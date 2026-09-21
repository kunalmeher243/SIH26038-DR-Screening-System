"""
train_classifier.py
EfficientNet-B4 training on APTOS 2019 for DR severity grading (Level 0-4).

BEFORE RUNNING:
    pip install -r requirements.txt

APTOS 2019 folder structure expected:
    data/
        train.csv          ← columns: id_code, diagnosis
        train_images/      ← .png files named by id_code

RUN:
    python train_classifier.py

OUTPUTS:
    models/best_model.pt           ← best checkpoint (by val sensitivity)
    models/last_model.pt           ← last epoch checkpoint
    models/training_log.csv        ← per-epoch metrics
"""

import os
import time
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import timm

from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import transforms
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, confusion_matrix,
    roc_auc_score, cohen_kappa_score
)
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
from tqdm import tqdm

# ── Config ───────────────────────────────────────────────────────────────────

CFG = {
    "data_dir":      "data",
    "img_dir":       "data/train_images",
    "model_dir":     "models",
    "img_size":      380,
    "batch_size":    8,
    "num_epochs":    25,
    "lr":            1e-4,
    "weight_decay":  1e-2,
    "num_classes":   5,
    "val_split":     0.15,
    "seed":          42,
    "num_workers":   4,
    "mixed_precision": True,      # faster on modern GPUs
    "model_name":    "efficientnet_b4",
}

os.makedirs(CFG["model_dir"], exist_ok=True)

# ── Reproducibility ──────────────────────────────────────────────────────────

torch.manual_seed(CFG["seed"])
np.random.seed(CFG["seed"])

# ── Augmentation ─────────────────────────────────────────────────────────────

TRAIN_AUG = A.Compose([
    A.Resize(CFG["img_size"], CFG["img_size"]),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.5),
    A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05, p=0.4),
    A.GaussNoise(p=0.2),
    A.GaussianBlur(blur_limit=3, p=0.1),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

VAL_AUG = A.Compose([
    A.Resize(CFG["img_size"], CFG["img_size"]),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])


# ── Dataset ──────────────────────────────────────────────────────────────────

class APTOSDataset(Dataset):
    def __init__(self, df: pd.DataFrame, img_dir: str, transform=None):
        self.df        = df.reset_index(drop=True)
        self.img_dir   = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row   = self.df.iloc[idx]
        path  = os.path.join(self.img_dir, f"{row.id_code}.png")
        img   = np.array(Image.open(path).convert("RGB"))
        label = int(row.diagnosis)

        if self.transform:
            img = self.transform(image=img)["image"]

        return img, label


# ── Weighted Sampler (handles APTOS class imbalance) ─────────────────────────

def make_sampler(df: pd.DataFrame) -> WeightedRandomSampler:
    counts      = df["diagnosis"].value_counts().sort_index().values
    class_w     = 1.0 / counts
    sample_w    = df["diagnosis"].map(lambda c: class_w[c]).values
    return WeightedRandomSampler(
        weights     = torch.tensor(sample_w, dtype=torch.float),
        num_samples = len(sample_w),
        replacement = True
    )


# ── Metrics ──────────────────────────────────────────────────────────────────

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray) -> dict:
    """
    y_true:  ground truth labels (0-4)
    y_pred:  predicted labels (0-4)
    y_proba: softmax probabilities (N, 5)
    Returns dict with accuracy, sensitivity, specificity, kappa, auc.
    """
    acc   = accuracy_score(y_true, y_pred)
    kappa = cohen_kappa_score(y_true, y_pred, weights="quadratic")

    # Binary referable DR: 0/1 = non-referable, 2/3/4 = referable
    y_bin_true = (y_true  >= 2).astype(int)
    y_bin_pred = (y_pred  >= 2).astype(int)
    y_bin_prob = y_proba[:, 2:].sum(axis=1)   # P(Level 2+)

    tn, fp, fn, tp = confusion_matrix(y_bin_true, y_bin_pred, labels=[0,1]).ravel()
    sensitivity = tp / (tp + fn + 1e-8)
    specificity = tn / (tn + fp + 1e-8)

    try:
        auc = roc_auc_score(y_bin_true, y_bin_prob)
    except Exception:
        auc = 0.0

    return {
        "accuracy":    round(float(acc),         4),
        "sensitivity": round(float(sensitivity),  4),
        "specificity": round(float(specificity),  4),
        "kappa":       round(float(kappa),        4),
        "auc":         round(float(auc),          4),
    }


# ── Training Loop ────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, criterion, optimizer, scaler, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for imgs, labels in tqdm(loader, desc="  Train", leave=False):
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()

        with torch.amp.autocast("cuda", enabled=CFG["mixed_precision"] and device.type == "cuda"):
            logits = model(imgs)
            loss   = criterion(logits, labels)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item() * imgs.size(0)
        correct    += (logits.argmax(1) == labels).sum().item()
        total      += imgs.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_labels, all_preds, all_proba = [], [], []

    for imgs, labels in tqdm(loader, desc="  Val  ", leave=False):
        imgs, labels = imgs.to(device), labels.to(device)

        with torch.amp.autocast("cuda", enabled=CFG["mixed_precision"] and device.type == "cuda"):
            logits = model(imgs)
            loss   = criterion(logits, labels)

        proba = torch.softmax(logits, dim=1)
        preds = logits.argmax(1)

        total_loss  += loss.item() * imgs.size(0)
        all_labels.extend(labels.cpu().numpy())
        all_preds.extend(preds.cpu().numpy())
        all_proba.extend(proba.cpu().numpy())

    y_true  = np.array(all_labels)
    y_pred  = np.array(all_preds)
    y_proba = np.array(all_proba)

    metrics = compute_metrics(y_true, y_pred, y_proba)
    metrics["loss"] = round(total_loss / len(loader.dataset), 4)
    return metrics


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n[INFO] Using device: {device}")
    if device.type == "cuda":
        print(f"[INFO] GPU: {torch.cuda.get_device_name(0)}")

    # ── Data ─────────────────────────────────────────────────────────────────
    df = pd.read_csv(os.path.join(CFG["data_dir"], "train.csv"))
    print(f"[INFO] Total samples: {len(df)}")
    print(f"[INFO] Class distribution:\n{df['diagnosis'].value_counts().sort_index()}\n")

    train_df, val_df = train_test_split(
        df, test_size=CFG["val_split"],
        stratify=df["diagnosis"], random_state=CFG["seed"]
    )
    print(f"[INFO] Train: {len(train_df)}  Val: {len(val_df)}")

    train_ds = APTOSDataset(train_df, CFG["img_dir"], TRAIN_AUG)
    val_ds   = APTOSDataset(val_df,   CFG["img_dir"], VAL_AUG)

    sampler     = make_sampler(train_df)
    train_loader = DataLoader(
        train_ds, batch_size=CFG["batch_size"],
        sampler=sampler, num_workers=CFG["num_workers"], pin_memory=True
    )
    val_loader = DataLoader(
        val_ds, batch_size=CFG["batch_size"],
        shuffle=False, num_workers=CFG["num_workers"], pin_memory=True
    )

    # ── Model ────────────────────────────────────────────────────────────────
    model = timm.create_model(
        CFG["model_name"], pretrained=True,
        num_classes=CFG["num_classes"]
    ).to(device)
    print(f"[INFO] Model: {CFG['model_name']} loaded with pretrained ImageNet weights")

    # Class-weighted loss — extra penalty for misclassifying minority classes
    class_counts = train_df["diagnosis"].value_counts().sort_index().values
    class_weights = torch.tensor(1.0 / class_counts, dtype=torch.float).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    optimizer = torch.optim.AdamW(
        model.parameters(), lr=CFG["lr"], weight_decay=CFG["weight_decay"]
    )
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=CFG["num_epochs"]
    )
    scaler = torch.amp.GradScaler(
        "cuda", enabled=CFG["mixed_precision"] and device.type == "cuda"
    )

    # ── Training ─────────────────────────────────────────────────────────────
    best_sensitivity = 0.0
    log_rows = []

    print("\n" + "="*65)
    print(f"  Training for {CFG['num_epochs']} epochs")
    print(f"  Checkpoint saved on: best referable DR sensitivity")
    print("="*65 + "\n")

    for epoch in range(1, CFG["num_epochs"] + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, scaler, device
        )
        val_metrics = validate(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        print(
            f"Epoch {epoch:02d}/{CFG['num_epochs']}  "
            f"train_loss={train_loss:.4f}  train_acc={train_acc:.4f}  "
            f"val_sens={val_metrics['sensitivity']:.4f}  "
            f"val_spec={val_metrics['specificity']:.4f}  "
            f"val_kappa={val_metrics['kappa']:.4f}  "
            f"val_auc={val_metrics['auc']:.4f}  "
            f"({elapsed:.1f}s)"
        )

        # Save best by sensitivity — missing referable DR is the worst failure
        if val_metrics["sensitivity"] > best_sensitivity:
            best_sensitivity = val_metrics["sensitivity"]
            torch.save({
                "epoch":       epoch,
                "model_state": model.state_dict(),
                "metrics":     val_metrics,
                "cfg":         CFG,
            }, os.path.join(CFG["model_dir"], "best_model.pt"))
            print(f"  ✓ Best model saved  (sensitivity={best_sensitivity:.4f})")

        # Always save last
        torch.save({
            "epoch":       epoch,
            "model_state": model.state_dict(),
            "metrics":     val_metrics,
        }, os.path.join(CFG["model_dir"], "last_model.pt"))

        log_rows.append({"epoch": epoch, "train_loss": train_loss,
                          "train_acc": train_acc, **val_metrics})

    pd.DataFrame(log_rows).to_csv(
        os.path.join(CFG["model_dir"], "training_log.csv"), index=False
    )
    print(f"\n[DONE] Best referable DR sensitivity: {best_sensitivity:.4f}")
    print(f"[DONE] Checkpoints saved to: {CFG['model_dir']}/")


if __name__ == "__main__":
    main()
