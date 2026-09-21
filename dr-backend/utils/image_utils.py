"""
utils/image_utils.py
Shared image loading, encoding, and preprocessing utilities.
Used by all services.
"""

import base64
import io
import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms


# ── Constants ────────────────────────────────────────────────────────────────

IMG_SIZE = 380  # EfficientNet-B4 native resolution

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]


# ── I/O ──────────────────────────────────────────────────────────────────────

def bytes_to_numpy(file_bytes: bytes) -> np.ndarray:
    """Raw bytes → numpy RGB uint8 array (H, W, 3)."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    return np.array(img)


def numpy_to_base64(img_rgb: np.ndarray) -> str:
    """numpy RGB uint8 → base64 PNG string for frontend."""
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode(".png", img_bgr)
    return base64.b64encode(buf).decode("utf-8")


def numpy_to_float(img_rgb: np.ndarray) -> np.ndarray:
    """uint8 RGB → float32 RGB normalized 0-1. Required by Grad-CAM."""
    return img_rgb.astype(np.float32) / 255.0


# ── Model Preprocessing ──────────────────────────────────────────────────────

def preprocess_for_model(img_rgb: np.ndarray) -> torch.Tensor:
    """
    numpy RGB uint8 (H, W, 3) → (1, 3, IMG_SIZE, IMG_SIZE) float tensor.
    Applies resize + ImageNet normalization.
    Ready to pass directly to EfficientNet.
    """
    t = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    return t(img_rgb).unsqueeze(0)  # add batch dim


# ── Device ───────────────────────────────────────────────────────────────────

def get_device() -> torch.device:
    """Returns CUDA if available, else CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")
