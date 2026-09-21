"""
calibrate.py
Temperature scaling calibration for EfficientNet-B4.

Run AFTER training completes:
    python calibrate.py

Reads:  models/best_model.pt
Writes: models/calibrated_model.pt   ← use this in model_service.py
        models/temperature.txt        ← optimal temperature value
"""

import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import timm

from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import log_loss
from train_classifier import APTOSDataset, VAL_AUG, CFG

# ── Temperature Scaler ───────────────────────────────────────────────────────

class TemperatureScaler(nn.Module):
    """Wraps model with a single learnable temperature parameter."""

    def __init__(self, model):
        super().__init__()
        self.model       = model
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)

    def forward(self, x):
        return self.model(x) / self.temperature

    def calibrate(self, val_loader, device):
        """
        Fit temperature on validation set using LBFGS.
        Minimizes NLL loss — makes confidence match accuracy.
        """
        self.to(device)
        self.model.eval()

        logits_list, labels_list = [], []

        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs = imgs.to(device)
                logits_list.append(self.model(imgs).cpu())
                labels_list.append(labels)

        logits = torch.cat(logits_list)
        labels = torch.cat(labels_list)

        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.LBFGS(
            [self.temperature], lr=0.01, max_iter=100
        )
        logits = logits.to(device)
        labels = labels.to(device)

        def eval_step():
            optimizer.zero_grad()
            loss = criterion(logits / self.temperature, labels)
            loss.backward()
            return loss

        optimizer.step(eval_step)

        T = self.temperature.item()
        print(f"[INFO] Optimal temperature: {T:.4f}")
        return T


# ── ECE (Expected Calibration Error) ─────────────────────────────────────────

def compute_ece(proba: np.ndarray, labels: np.ndarray, n_bins=15) -> float:
    """Lower ECE = better calibrated. Target < 0.05."""
    preds      = proba.argmax(axis=1)
    confidence = proba.max(axis=1)
    correct    = (preds == labels).astype(float)

    bins = np.linspace(0, 1, n_bins + 1)
    ece  = 0.0

    for i in range(n_bins):
        mask = (confidence >= bins[i]) & (confidence < bins[i+1])
        if mask.sum() == 0:
            continue
        acc  = correct[mask].mean()
        conf = confidence[mask].mean()
        ece += mask.sum() * abs(acc - conf)

    return float(ece / len(labels))


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if torch.cuda.is_available():
        free_memory, _ = torch.cuda.mem_get_info()
        device = torch.device("cuda" if free_memory >= 1_000_000_000 else "cpu")
    else:
        device = torch.device("cpu")
    print(f"[INFO] Using device: {device}")

    # Load checkpoint
    ckpt = torch.load(
        os.path.join(CFG["model_dir"], "best_model.pt"), map_location=device
    )
    model = timm.create_model(
        CFG["model_name"], pretrained=False, num_classes=CFG["num_classes"]
    )
    model.load_state_dict(ckpt["model_state"])
    model = model.to(device)

    # Validation set — same split as training
    df = pd.read_csv(os.path.join(CFG["data_dir"], "train.csv"))
    _, val_df = train_test_split(
        df, test_size=CFG["val_split"],
        stratify=df["diagnosis"], random_state=CFG["seed"]
    )
    val_ds = APTOSDataset(val_df, CFG["img_dir"], VAL_AUG)
    val_loader = DataLoader(
        val_ds, batch_size=1,
        shuffle=False, num_workers=CFG["num_workers"]
    )

    # ECE before calibration
    all_logits, all_labels = [], []
    model.eval()
    with torch.no_grad():
        for imgs, labels in val_loader:
            with torch.amp.autocast(
                device_type=device.type, enabled=device.type == "cuda"
            ):
                all_logits.append(model(imgs.to(device)).cpu())
            all_labels.append(labels)

    logits = torch.cat(all_logits)
    labels = torch.cat(all_labels).numpy()
    proba_before = torch.softmax(logits, dim=1).numpy()
    ece_before   = compute_ece(proba_before, labels)
    nll_before   = log_loss(labels, proba_before)
    print(f"\n[BEFORE calibration]  ECE={ece_before:.4f}  NLL={nll_before:.4f}")

    # Calibrate
    scaler = TemperatureScaler(model)
    T      = scaler.calibrate(val_loader, device)

    # ECE after calibration
    proba_after = torch.softmax(
        logits / scaler.temperature.detach().cpu(), dim=1
    ).detach().numpy()
    ece_after   = compute_ece(proba_after, labels)
    nll_after   = log_loss(labels, proba_after)
    print(f"[AFTER  calibration]  ECE={ece_after:.4f}  NLL={nll_after:.4f}")

    # Save
    torch.save({
        "model_state":   model.state_dict(),
        "temperature":   T,
        "cfg":           CFG,
        "ece_before":    ece_before,
        "ece_after":     ece_after,
    }, os.path.join(CFG["model_dir"], "calibrated_model.pt"))

    with open(os.path.join(CFG["model_dir"], "temperature.txt"), "w") as f:
        f.write(str(T))

    print(f"[DONE] Calibrated model saved to models/calibrated_model.pt")


if __name__ == "__main__":
    main()
