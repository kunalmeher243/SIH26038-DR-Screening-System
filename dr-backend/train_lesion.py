"""
train_lesion.py
U-Net lesion segmentation on IDRiD Task A dataset.

Trains a single multi-class U-Net detecting 4 lesion types:
    Channel 0 — Microaneurysms (MA)
    Channel 1 — Haemorrhages (HE)
    Channel 2 — Hard Exudates (EX)
    Channel 3 — Soft Exudates (SE)

IDRiD Task A folder structure expected:
    data/IDRiD/
        images/
            train/     ← IDRiD_01.jpg ... IDRiD_54.jpg
            test/      ← IDRiD_55.jpg ... IDRiD_81.jpg
        masks/
            train/
                MA/    ← IDRiD_01_MA.tif ... (microaneurysms)
                HE/    ← IDRiD_01_HE.tif ... (haemorrhages)
                EX/    ← IDRiD_01_EX.tif ... (hard exudates)
                SE/    ← IDRiD_01_SE.tif ... (soft exudates)
            test/
                MA/ HE/ EX/ SE/

RUN:
    python train_lesion.py

OUTPUTS:
    models/lesion_model.pt     ← best checkpoint (by mean AUROC)
    models/lesion_log.csv      ← per-epoch metrics
"""

import os
import glob
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
from sklearn.metrics import roc_auc_score
import segmentation_models_pytorch as smp
from tqdm import tqdm
import time

# ── Config ───────────────────────────────────────────────────────────────────

CFG = {
    "data_dir":      "data/IDRiD",
    "model_dir":     "models",
    "img_size":      512,          # IDRiD images are 4288x2848 — downsample
    "batch_size":    4,            # IDRiD is small (54 images) — small batch ok
    "num_epochs":    60,           # more epochs compensates for small dataset
    "lr":            3e-4,
    "num_workers":   2,
    "seed":          42,
    "num_classes":   4,            # MA, HE, EX, SE
    "mixed_precision": True,
}

LESION_NAMES  = ["MA", "HE", "EX", "SE"]
LESION_SUFFIX = ["_MA", "_HE", "_EX", "_SE"]

os.makedirs(CFG["model_dir"], exist_ok=True)
torch.manual_seed(CFG["seed"])
np.random.seed(CFG["seed"])

# ── Augmentation ─────────────────────────────────────────────────────────────
# Heavy augmentation — IDRiD only has 54 training images

TRAIN_AUG = A.Compose([
    A.Resize(CFG["img_size"], CFG["img_size"]),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=20, p=0.6),
    A.OneOf([
        A.ElasticTransform(alpha=120, sigma=120*0.05, p=1.0),
        A.GridDistortion(p=1.0),
    ], p=0.3),
    A.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1, p=0.5),
    A.GaussNoise(p=0.2),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

VAL_AUG = A.Compose([
    A.Resize(CFG["img_size"], CFG["img_size"]),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

# ── Dataset ──────────────────────────────────────────────────────────────────

class IDRiDDataset(Dataset):
    """
    Loads IDRiD images and multi-channel lesion masks.
    Missing mask file = no lesion of that type in this image (all zeros).
    """

    def __init__(self, img_dir: str, mask_base_dir: str, transform=None):
        self.img_dir       = img_dir
        self.mask_base_dir = mask_base_dir
        self.transform     = transform
        self.img_paths     = sorted(glob.glob(os.path.join(img_dir, "*.jpg")))

        if len(self.img_paths) == 0:
            # Also try .png
            self.img_paths = sorted(glob.glob(os.path.join(img_dir, "*.png")))

        print(f"[IDRiD] Found {len(self.img_paths)} images in {img_dir}")

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        img_path = self.img_paths[idx]
        stem     = os.path.splitext(os.path.basename(img_path))[0]

        # Load image
        img = np.array(Image.open(img_path).convert("RGB"))

        # Load masks — one per lesion type
        masks = []
        for lesion_suffix, lesion_name in zip(LESION_SUFFIX, LESION_NAMES):
            mask_path = os.path.join(
                self.mask_base_dir, lesion_name,
                f"{stem}{lesion_suffix}.tif"
            )
            if os.path.exists(mask_path):
                mask = np.array(Image.open(mask_path).convert("L"))
                # IDRiD masks may be encoded as binary 0/1 or 8-bit 0/255.
                mask = (mask > 0).astype(np.float32)
            else:
                # No lesion of this type in this image
                mask = np.zeros(
                    (img.shape[0], img.shape[1]), dtype=np.float32
                )
            masks.append(mask)

        # Stack to (H, W, 4) for albumentations
        mask_stack = np.stack(masks, axis=-1)

        if self.transform:
            augmented  = self.transform(image=img, masks=list(masks))
            img        = augmented["image"]
            mask_list  = augmented["masks"]
            mask_stack = torch.stack([
                torch.as_tensor(m, dtype=torch.float32) for m in mask_list
            ])
        else:
            img        = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1)
            mask_stack = torch.tensor(mask_stack, dtype=torch.float32).permute(2, 0, 1)

        return img, mask_stack   # (3, H, W), (4, H, W)


# ── Loss ─────────────────────────────────────────────────────────────────────

class DiceBCELoss(nn.Module):
    """
    Combined Dice + BCE loss.
    Dice handles class imbalance (lesion pixels << background pixels).
    BCE provides stable gradients for training.
    """

    def __init__(self, smooth: float = 1.0, bce_weight: float = 0.5):
        super().__init__()
        self.smooth     = smooth
        self.bce_weight = bce_weight
        self.bce        = nn.BCEWithLogitsLoss()

    def dice_loss(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        pred   = pred.contiguous().view(-1)
        target = target.contiguous().view(-1)
        inter  = (pred * target).sum()
        return 1 - (2.0 * inter + self.smooth) / (
            pred.sum() + target.sum() + self.smooth
        )

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        bce_loss  = self.bce(pred, target)
        dice_loss = self.dice_loss(torch.sigmoid(pred), target)
        return self.bce_weight * bce_loss + (1 - self.bce_weight) * dice_loss


# ── Metrics ──────────────────────────────────────────────────────────────────

def compute_lesion_metrics(
    preds: list, targets: list, threshold: float = 0.5
) -> dict:
    """
    Per-lesion AUROC and F1.
    preds, targets: lists of (N, 4, H, W) tensors.
    """
    all_preds  = torch.cat(preds,  dim=0).numpy()   # (N, 4, H, W)
    all_target = torch.cat(targets, dim=0).numpy()

    metrics = {}
    for i, name in enumerate(LESION_NAMES):
        p = all_preds[:, i].flatten()
        t = all_target[:, i].flatten()

        # Binary F1
        p_bin = (p > threshold).astype(int)
        tp = ((p_bin == 1) & (t == 1)).sum()
        fp = ((p_bin == 1) & (t == 0)).sum()
        fn = ((p_bin == 0) & (t == 1)).sum()
        f1 = 2*tp / (2*tp + fp + fn + 1e-8)

        # AUROC (skip if only one class present)
        try:
            auc = roc_auc_score(t, p) if t.sum() > 0 else 0.0
        except Exception:
            auc = 0.0

        metrics[name] = {
            "f1":  round(float(f1),  4),
            "auc": round(float(auc), 4),
        }

    metrics["mean_auc"] = round(
        float(np.mean([metrics[n]["auc"] for n in LESION_NAMES])), 4
    )
    return metrics


# ── Train / Val ───────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, criterion, optimizer, scaler, device):
    model.train()
    total_loss = 0.0

    for imgs, masks in tqdm(loader, desc="  Train", leave=False):
        imgs, masks = imgs.to(device), masks.to(device)
        optimizer.zero_grad()

        with torch.amp.autocast(
            device_type=device.type,
            enabled=CFG["mixed_precision"] and device.type == "cuda",
        ):
            preds = model(imgs)
            loss  = criterion(preds, masks)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        total_loss += loss.item() * imgs.size(0)

    return total_loss / len(loader.dataset)


@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_preds, all_targets = [], []

    for imgs, masks in tqdm(loader, desc="  Val  ", leave=False):
        imgs, masks = imgs.to(device), masks.to(device)

        with torch.amp.autocast(
            device_type=device.type,
            enabled=CFG["mixed_precision"] and device.type == "cuda",
        ):
            preds = model(imgs)
            loss  = criterion(preds, masks)

        total_loss  += loss.item() * imgs.size(0)
        all_preds.append(torch.sigmoid(preds).cpu())
        all_targets.append(masks.cpu())

    metrics         = compute_lesion_metrics(all_preds, all_targets)
    metrics["loss"] = round(total_loss / len(loader.dataset), 4)
    return metrics


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n[INFO] Using device: {device}")

    train_img_dir  = os.path.join(CFG["data_dir"], "images", "train")
    train_mask_dir = os.path.join(CFG["data_dir"], "masks", "train")
    test_img_dir   = os.path.join(CFG["data_dir"], "images", "test")
    test_mask_dir  = os.path.join(CFG["data_dir"], "masks", "test")

    train_ds = IDRiDDataset(train_img_dir, train_mask_dir, TRAIN_AUG)
    val_ds   = IDRiDDataset(test_img_dir,  test_mask_dir,  VAL_AUG)

    train_loader = DataLoader(
        train_ds, batch_size=CFG["batch_size"],
        shuffle=True, num_workers=CFG["num_workers"], pin_memory=True
    )
    val_loader = DataLoader(
        val_ds, batch_size=CFG["batch_size"],
        shuffle=False, num_workers=CFG["num_workers"], pin_memory=True
    )

    # U-Net with EfficientNet-B2 encoder
    # B2 is lighter than B4 — faster training on small IDRiD dataset
    model = smp.Unet(
        encoder_name    = "efficientnet-b2",
        encoder_weights = "imagenet",
        in_channels     = 3,
        classes         = CFG["num_classes"],
        activation      = None,   # raw logits — sigmoid applied in loss
    ).to(device)

    criterion = DiceBCELoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=CFG["lr"])
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=CFG["num_epochs"]
    )
    scaler = torch.amp.GradScaler(
        "cuda", enabled=CFG["mixed_precision"] and device.type == "cuda"
    )

    best_auc = 0.0
    log_rows  = []

    print(f"\n{'='*65}")
    print(f"  Training U-Net lesion detector for {CFG['num_epochs']} epochs")
    print(f"  Dataset: IDRiD Task A  —  train={len(train_ds)}  val={len(val_ds)}")
    print(f"  Lesions: {LESION_NAMES}")
    print(f"{'='*65}\n")

    for epoch in range(1, CFG["num_epochs"] + 1):
        t0         = time.time()
        train_loss = train_one_epoch(
            model, train_loader, criterion, optimizer, scaler, device
        )
        metrics    = validate(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        print(
            f"Epoch {epoch:02d}/{CFG['num_epochs']}  "
            f"train_loss={train_loss:.4f}  val_loss={metrics['loss']:.4f}  "
            f"mean_auc={metrics['mean_auc']:.4f}  "
            f"MA={metrics['MA']['auc']:.3f}  HE={metrics['HE']['auc']:.3f}  "
            f"EX={metrics['EX']['auc']:.3f}  SE={metrics['SE']['auc']:.3f}  "
            f"({elapsed:.1f}s)"
        )

        if metrics["mean_auc"] > best_auc:
            best_auc = metrics["mean_auc"]
            torch.save({
                "epoch":       epoch,
                "model_state": model.state_dict(),
                "metrics":     metrics,
                "cfg":         CFG,
            }, os.path.join(CFG["model_dir"], "lesion_model.pt"))
            print(f"  ✓ Best lesion model saved  (mean_auc={best_auc:.4f})")

        log_rows.append({
            "epoch": epoch, "train_loss": train_loss, **metrics
        })

    pd.DataFrame(log_rows).to_csv(
        os.path.join(CFG["model_dir"], "lesion_log.csv"), index=False
    )
    print(f"\n[DONE] Best mean AUROC: {best_auc:.4f}")


if __name__ == "__main__":
    main()
