"""
services/lesion_service.py
Lesion detection inference using trained U-Net.

Requires: models/lesion_model.pt  (run train_lesion.py first)

Detects 4 lesion types:
    MA — Microaneurysms
    HE — Haemorrhages
    EX — Hard Exudates
    SE — Soft Exudates

Returns lesion counts + color overlay image as base64 PNG.
"""

import os
import cv2
import numpy as np
import torch
import segmentation_models_pytorch as smp
from fastapi import UploadFile
from utils.image_utils import bytes_to_numpy, numpy_to_base64, get_device

# ── Constants ─────────────────────────────────────────────────────────────────

LESION_NAMES = ["MA", "HE", "EX", "SE"]
IMG_SIZE     = 512
SEG_THRESHOLD = 0.45   # lower than 0.5 — better recall on small lesions

# BGR colors for overlay — visible against retinal background
LESION_COLORS = {
    "MA": (0,   0,   220),   # red    — microaneurysms
    "HE": (0,   140, 255),   # orange — haemorrhages
    "EX": (0,   230, 230),   # yellow — hard exudates
    "SE": (200, 0,   200),   # purple — soft exudates
}

LESION_UI_METADATA = {
    "microaneurysms": {
        "label": "Microaneurysms",
        "short_label": "MA",
        "color": "#dc0000",
        "description": "Small red retinal lesions.",
    },
    "hemorrhages": {
        "label": "Haemorrhages",
        "short_label": "HE",
        "color": "#ff8c00",
        "description": "Retinal bleeding regions.",
    },
    "hard_exudates": {
        "label": "Hard Exudates",
        "short_label": "EX",
        "color": "#e6e600",
        "description": "Bright lipid exudate regions.",
    },
    "soft_exudates": {
        "label": "Cotton Wool Spots",
        "short_label": "SE",
        "color": "#c800c8",
        "description": "Soft exudates, also called cotton wool spots.",
    },
}

# ── Model Loader (singleton) ──────────────────────────────────────────────────

_model  = None
_device = None


def load_lesion_model():
    global _model, _device

    _device = get_device()
    ckpt_path = "models/lesion_model.pt"

    if not os.path.exists(ckpt_path):
        raise FileNotFoundError(
            "Lesion model not found. Run train_lesion.py first."
        )

    ckpt = torch.load(ckpt_path, map_location=_device)
    cfg  = ckpt.get("cfg", {"num_classes": 4})

    model = smp.Unet(
        encoder_name    = "efficientnet-b2",
        encoder_weights = None,
        in_channels     = 3,
        classes         = cfg["num_classes"],
        activation      = None,
    )
    model.load_state_dict(ckpt["model_state"])
    model = model.to(_device)
    model.eval()
    _model = model
    print(f"[lesion_service] Model loaded on {_device}")


def get_lesion_model():
    if _model is None:
        load_lesion_model()
    return _model, _device


# ── Preprocessing ─────────────────────────────────────────────────────────────

def preprocess_for_segmentation(img_rgb: np.ndarray) -> torch.Tensor:
    """Resize + ImageNet normalize → (1, 3, H, W) tensor."""
    from torchvision import transforms
    t = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])
    return t(img_rgb).unsqueeze(0)


# ── Lesion Counting ───────────────────────────────────────────────────────────

def count_connected_regions(binary_mask: np.ndarray) -> int:
    """
    Count discrete lesion regions using connected components.
    Each connected region = one lesion instance.

    NOTE: For microaneurysms (MA), each connected region may be very small
    (few pixels). Report count honestly — do not claim sub-pixel accuracy.
    """
    binary_u8   = (binary_mask > SEG_THRESHOLD).astype(np.uint8)
    num_labels, _ = cv2.connectedComponents(binary_u8)
    return max(0, num_labels - 1)   # subtract background label


# ── Overlay Generation ────────────────────────────────────────────────────────

def draw_lesion_overlay(
    original_rgb: np.ndarray,
    masks: dict,
    alpha: float = 0.35
) -> np.ndarray:
    """
    Draw colored lesion overlays on original image.
    Returns RGB numpy array with overlay.
    """
    # Resize original to display size
    h, w     = 512, 512
    img_disp = cv2.resize(original_rgb, (w, h))
    overlay  = img_disp.copy()

    for lesion_name, mask in masks.items():
        mask_resized = cv2.resize(
            mask.astype(np.float32), (w, h),
            interpolation=cv2.INTER_LINEAR
        )
        binary = mask_resized > SEG_THRESHOLD
        color  = LESION_COLORS[lesion_name]   # BGR

        # Convert to RGB for overlay
        color_rgb = (color[2], color[1], color[0])
        overlay[binary] = color_rgb

    # Blend overlay with original
    result = cv2.addWeighted(img_disp, 1 - alpha, overlay, alpha, 0)
    return result


# ── Neovascularization Heuristic ──────────────────────────────────────────────

def detect_neovascularization(
    grade_level: int,
    he_count: int,
    ex_count: int
) -> bool:
    """
    Heuristic NV detection: Level 4 DR with severe hemorrhage burden.
    NOT a trained detector — label honestly in report.
    Replace with trained model when available.
    """
    return grade_level >= 4 and he_count >= 10


# ── Main Service Function ──────────────────────────────────────────────────────

@torch.no_grad()
async def detect(file: UploadFile, dr_level: int = 0) -> dict:
    """
    Entry point called by FastAPI router or report_service.
    Returns lesion counts + overlay image as base64 PNG.
    """
    model, device = get_lesion_model()

    raw     = await file.read()
    img_rgb = bytes_to_numpy(raw)
    tensor  = preprocess_for_segmentation(img_rgb).to(device)

    # Forward pass
    with torch.no_grad(), torch.amp.autocast(
        device_type=device.type,
        enabled=device.type == "cuda",
    ):
        logits = model(tensor)              # (1, 4, H, W) raw logits
        proba = torch.sigmoid(logits)       # (1, 4, H, W) probabilities
        proba = proba.squeeze(0).cpu().numpy()  # (4, H, W)

    # Per-lesion masks and counts
    masks  = {}
    counts = {}
    for i, name in enumerate(LESION_NAMES):
        mask         = proba[i]                         # (H, W) float
        masks[name]  = mask
        counts[name] = count_connected_regions(mask)

    # Neovascularization
    nv = detect_neovascularization(dr_level, counts["HE"], counts["EX"])

    # Generate color overlay
    overlay_rgb = draw_lesion_overlay(img_rgb, masks)
    overlay_b64 = numpy_to_base64(overlay_rgb)

    return {
        "lesions": {
            "microaneurysms":     counts["MA"],
            "hemorrhages":        counts["HE"],
            "hard_exudates":      counts["EX"],
            "soft_exudates":      counts["SE"],
            "neovascularization": nv,
        },
        "lesion_overlay_image": overlay_b64,
        "lesion_annotations": [
            {
                **metadata,
                "count": counts[{
                    "microaneurysms": "MA",
                    "hemorrhages": "HE",
                    "hard_exudates": "EX",
                    "soft_exudates": "SE",
                }[name]],
                "detected": counts[{
                    "microaneurysms": "MA",
                    "hemorrhages": "HE",
                    "hard_exudates": "EX",
                    "soft_exudates": "SE",
                }[name]] > 0,
            }
            for name, metadata in LESION_UI_METADATA.items()
        ],
    }
