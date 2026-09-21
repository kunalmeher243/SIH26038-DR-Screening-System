"""
services/iqa_service.py
Image Quality Assessment — runs first in pipeline.
Determines if image is safe to grade.

Returns one of three quality labels:
    GRADABLE    → proceed normally
    BORDERLINE  → proceed with CLAHE enhancement + warning
    UNGRADABLE  → block pipeline, request recapture
"""

import cv2
import numpy as np
from fastapi import UploadFile
from utils.image_utils import bytes_to_numpy


# ── Thresholds ───────────────────────────────────────────────────────────────
# Tune these by running assess() on 200 APTOS images you manually label
# as good/bad. Adjust until confusion matrix matches your manual grading.

BLUR_THRESHOLD       = 80.0   # Laplacian variance — below this = blurry
TENENGRAD_THRESHOLD  = 200.0  # gradient energy — below this = blurry
GRADABLE_CUTOFF      = 0.70   # composite score above this = GRADABLE
BORDERLINE_CUTOFF    = 0.45   # composite score above this = BORDERLINE


# ── Quality Metrics ──────────────────────────────────────────────────────────

def laplacian_variance(gray: np.ndarray) -> float:
    """
    Measures image sharpness via Laplacian second derivative.
    High variance = sharp edges = good quality.
    Low variance = smooth/blurry image.
    """
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def tenengrad_energy(gray: np.ndarray) -> float:
    """
    Measures gradient energy via Sobel operators.
    Directional sharpness estimator — more stable than Laplacian on noisy images.
    """
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    return float(np.mean(gx**2 + gy**2))


def illumination_score(img_rgb: np.ndarray) -> float:
    """
    Checks illumination distribution in HSV value channel.
    Penalizes underexposed (dark) or overexposed (washed-out) images.
    Returns 1.0 if illumination is acceptable, <0.5 if not.
    """
    hsv    = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    v      = hsv[:, :, 2].astype(np.float32) / 255.0
    mean_v = float(v.mean())

    if mean_v < 0.15:    # Very dark — underexposed
        return 0.2
    if mean_v > 0.90:    # Very bright — overexposed
        return 0.25
    if mean_v < 0.25:    # Dark but workable
        return 0.5
    return 1.0


def field_of_view_score(gray: np.ndarray) -> float:
    """
    Estimates whether the retinal circle is properly centered and covers
    sufficient area of the image. Detects partial captures.
    Returns 1.0 if FOV is adequate, 0.4 if not.
    """
    # Threshold to find bright retinal region
    _, binary = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY)
    retinal_area = float(binary.sum() / 255)
    total_area   = float(gray.shape[0] * gray.shape[1])
    coverage     = retinal_area / total_area

    if coverage < 0.30:   # Less than 30% of frame is retina
        return 0.4
    return 1.0


def composite_quality_score(
    lap: float, ten: float, illum: float, fov: float
) -> float:
    """
    Weighted combination of all quality metrics, normalized to [0, 1].
    Weights reflect clinical importance of each factor.
    """
    lap_n = min(lap / 500.0, 1.0)    # normalize Laplacian
    ten_n = min(ten / 1000.0, 1.0)   # normalize Tenengrad
    return (
        0.35 * lap_n  +
        0.35 * ten_n  +
        0.20 * illum  +
        0.10 * fov
    )


# ── Issues Detection ─────────────────────────────────────────────────────────

def detect_issues(
    lap: float, ten: float, illum_raw: float, fov: float
) -> list[str]:
    issues = []
    if lap  < BLUR_THRESHOLD:       issues.append("blur")
    if ten  < TENENGRAD_THRESHOLD:  issues.append("low_sharpness")
    if illum_raw < 0.5:             issues.append("poor_illumination")
    if fov < 0.5:                   issues.append("incomplete_field_of_view")
    return issues


# ── Main Service Function ─────────────────────────────────────────────────────

async def assess(file: UploadFile) -> dict:
    """
    Entry point called by FastAPI router.
    Returns quality assessment dict matching API contract exactly.
    """
    raw = await file.read()
    img = bytes_to_numpy(raw)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Compute metrics
    lap         = laplacian_variance(gray)
    ten         = tenengrad_energy(gray)
    illum_score = illumination_score(img)
    illum_raw   = illumination_score(img)   # same value for issue detection
    fov         = field_of_view_score(gray)
    score       = composite_quality_score(lap, ten, illum_score, fov)
    issues      = detect_issues(lap, ten, illum_raw, fov)

    # Classify
    if score >= GRADABLE_CUTOFF:
        label    = "GRADABLE"
        gradable = True
        rec      = "Image is suitable for automated grading."

    elif score >= BORDERLINE_CUTOFF:
        label    = "BORDERLINE"
        gradable = True
        rec      = (
            "Image quality is low. Proceeding with enhancement. "
            "Results may be less reliable — consider recapturing."
        )

    else:
        label    = "UNGRADABLE"
        gradable = False
        issue_str = ", ".join(issues) if issues else "unknown quality issues"
        rec      = (
            f"Image cannot be reliably graded due to: {issue_str}. "
            "Please recapture the image."
        )

    return {
        "gradable":       gradable,
        "quality_score":  round(score, 3),
        "quality_label":  label,
        "issues":         issues,
        "recommendation": rec,
        # Debug info — remove in production if needed
        "_debug": {
            "laplacian_variance": round(lap, 2),
            "tenengrad_energy":   round(ten, 2),
            "illumination_score": round(illum_score, 3),
            "fov_score":          round(fov, 3),
        }
    }
