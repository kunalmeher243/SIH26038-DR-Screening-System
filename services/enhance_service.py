"""
services/enhance_service.py
Adaptive CLAHE enhancement for BORDERLINE images.
Returns both original and enhanced image as base64 PNG strings.

IMPORTANT: Both images are returned so the doctor can compare.
Never hide the original from the end user.
"""

import cv2
import numpy as np
from fastapi import UploadFile
from utils.image_utils import bytes_to_numpy, numpy_to_base64


def apply_clahe(img_rgb: np.ndarray) -> np.ndarray:
    """
    Contrast Limited Adaptive Histogram Equalization on L channel (LAB space).
    Improves local contrast without overamplifying noise.
    Operates in LAB space to avoid color distortion.
    """
    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_eq  = clahe.apply(l)

    lab_eq = cv2.merge([l_eq, a, b])
    return cv2.cvtColor(lab_eq, cv2.COLOR_LAB2RGB)


def apply_illumination_normalization(img_rgb: np.ndarray) -> np.ndarray:
    """
    Removes uneven background illumination using large-kernel blur subtraction.
    Useful for vignetting and uneven fundus lighting.
    """
    # Large gaussian blur estimates background illumination
    background = cv2.GaussianBlur(img_rgb, (101, 101), 0)
    # Subtract background and restore mean
    normalized = cv2.addWeighted(img_rgb, 4.0, background, -4.0, 128)
    return np.clip(normalized, 0, 255).astype(np.uint8)


def apply_denoising(img_rgb: np.ndarray) -> np.ndarray:
    """
    Fast Non-Local Means denoising.
    Reduces sensor noise while preserving edge structure.
    """
    return cv2.fastNlMeansDenoisingColored(img_rgb, None, 5, 5, 7, 21)


def verify_enhancement(
    original: np.ndarray, enhanced: np.ndarray, threshold: float = 0.05
) -> bool:
    """
    Checks whether enhancement altered the image structure significantly.
    Large structural difference may indicate enhancement manufactured artifacts.
    Returns True if enhancement is trustworthy.
    """
    orig_gray = cv2.cvtColor(original, cv2.COLOR_RGB2GRAY).astype(np.float32)
    enh_gray  = cv2.cvtColor(enhanced, cv2.COLOR_RGB2GRAY).astype(np.float32)
    # Structural similarity approximation via normalized cross-correlation
    diff = np.abs(orig_gray - enh_gray) / 255.0
    return float(diff.mean()) < threshold


async def enhance(file: UploadFile) -> dict:
    """
    Entry point called by FastAPI router.
    Returns original and enhanced images as base64 strings.
    """
    raw      = await file.read()
    original = bytes_to_numpy(raw)

    # Apply enhancement pipeline
    enhanced   = apply_illumination_normalization(original)
    enhanced   = apply_clahe(enhanced)
    enhanced   = apply_denoising(enhanced)

    trustworthy = verify_enhancement(original, enhanced)

    techniques = ["illumination_normalization", "CLAHE", "denoising"]

    return {
        "enhanced_image":          numpy_to_base64(enhanced),
        "original_image":          numpy_to_base64(original),
        "techniques_applied":      techniques,
        "enhancement_trustworthy": trustworthy,
    }
