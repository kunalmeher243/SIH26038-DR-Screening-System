"""
services/model_service.py
DR severity grading using calibrated EfficientNet-B4.

Requires: models/calibrated_model.pt  (run calibrate.py first)
          models/best_model.pt         (fallback if calibration not done)

Loads model once at startup. Subsequent calls reuse loaded model.
"""

import os
import torch
import torch.nn as nn
import timm
import numpy as np
from fastapi import UploadFile
from utils.image_utils import bytes_to_numpy, preprocess_for_model, get_device

# ── DR Metadata ───────────────────────────────────────────────────────────────

DR_LABELS = {
    0: "No Diabetic Retinopathy",
    1: "Mild Non-Proliferative DR",
    2: "Moderate Non-Proliferative DR",
    3: "Severe Non-Proliferative DR",
    4: "Proliferative DR",
}

REFERRAL_URGENCY = {
    0: "none",
    1: "none",
    2: "standard",
    3: "urgent",
    4: "emergency",
}

HUMAN_REVIEW_THRESHOLD = 0.60   # route to doctor if confidence below this


# ── Model Loader (singleton) ─────────────────────────────────────────────────

_model       = None
_temperature = 1.0
_device      = None


def load_model():
    """
    Loads model once. Called on first inference request.
    Prefers calibrated model. Falls back to best_model.pt.
    """
    global _model, _temperature, _device

    _device = get_device()
    print(f"[model_service] Loading model on {_device}")

    calibrated_path = "models/calibrated_model.pt"
    best_path       = "models/best_model.pt"

    if os.path.exists(calibrated_path):
        ckpt         = torch.load(calibrated_path, map_location=_device)
        _temperature = ckpt.get("temperature", 1.0)
        print(f"[model_service] Using calibrated model  T={_temperature:.4f}")
    elif os.path.exists(best_path):
        ckpt         = torch.load(best_path, map_location=_device)
        _temperature = 1.0
        print("[model_service] WARNING: Using uncalibrated model. Run calibrate.py.")
    else:
        raise FileNotFoundError(
            "No model checkpoint found. "
            "Run train_classifier.py first, then calibrate.py."
        )

    cfg   = ckpt.get("cfg", {"model_name": "efficientnet_b4", "num_classes": 5})
    model = timm.create_model(
        cfg["model_name"], pretrained=False,
        num_classes=cfg["num_classes"]
    )
    model.load_state_dict(ckpt["model_state"])
    model = model.to(_device)
    model.eval()
    _model = model
    print("[model_service] Model ready.")


def get_model():
    if _model is None:
        load_model()
    return _model, _temperature, _device


# ── Routing Logic ─────────────────────────────────────────────────────────────

def get_routing(dr_level: int, calibrated_conf: float) -> str:
    """
    Three routing outcomes:
        ROUTINE           → non-referable, high confidence
        PRIORITY_REFERRAL → referable, high confidence
        HUMAN_REVIEW      → any level, low confidence
    """
    if calibrated_conf < HUMAN_REVIEW_THRESHOLD:
        return "HUMAN_REVIEW"
    if dr_level <= 1:
        return "ROUTINE"
    return "PRIORITY_REFERRAL"


# ── Main Service Function ─────────────────────────────────────────────────────

@torch.no_grad()
async def grade(file: UploadFile) -> dict:
    """
    Entry point called by FastAPI router.
    Returns DR grading result matching API contract exactly.
    """
    model, temperature, device = get_model()

    # Load and preprocess image
    raw       = await file.read()
    img_rgb   = bytes_to_numpy(raw)
    tensor    = preprocess_for_model(img_rgb).to(device)

    # Forward pass
    logits = model(tensor)                                      # (1, 5)

    # Raw confidence
    proba_raw = torch.softmax(logits, dim=1).squeeze()         # (5,)
    raw_conf  = float(proba_raw.max().item())

    # Calibrated confidence — divide logits by temperature
    proba_cal = torch.softmax(logits / temperature, dim=1).squeeze()
    cal_conf  = float(proba_cal.max().item())

    dr_level  = int(proba_cal.argmax().item())

    # Class probabilities dict for frontend bar chart
    class_probs = {
        str(i): round(float(proba_cal[i].item()), 4)
        for i in range(5)
    }

    routing = get_routing(dr_level, cal_conf)

    return {
        "dr_level":             dr_level,
        "dr_label":             DR_LABELS[dr_level],
        "confidence":           round(raw_conf, 4),
        "calibrated_confidence": round(cal_conf, 4),
        "refer":                dr_level >= 2,
        "referral_urgency":     REFERRAL_URGENCY[dr_level],
        "routing":              routing,
        "class_probabilities":  class_probs,
    }
