DUMMY_QUALITY = {
    "gradable": True,
    "quality_score": 0.87,
    "quality_label": "GRADABLE",
    "issues": [],
    "recommendation": "Image is suitable for automated grading."
}


DUMMY_ENHANCE = {
    "enhanced_image": None,
    "original_image": None,
    "techniques_applied": [
        "CLAHE",
        "illumination_normalization",
        "denoising"
    ],
    "enhancement_trustworthy": True
}


DUMMY_GRADE = {
    "dr_level": 2,
    "dr_label": "Moderate Non-Proliferative DR",
    "confidence": 0.91,
    "calibrated_confidence": 0.88,
    "refer": True,
    "referral_urgency": "standard",
    "routing": "PRIORITY_REFERRAL",
    "class_probabilities": {
        "0": 0.01,
        "1": 0.04,
        "2": 0.88,
        "3": 0.06,
        "4": 0.01
    }
}


DUMMY_REPORT = {
    "gradcam_image": None,
    "lesion_overlay_image": None,
    "lesions": {
        "microaneurysms": 8,
        "hemorrhages": 3,
        "hard_exudates": 2,
        "soft_exudates": 0,
        "neovascularization": False
    },
    "anatomy": {
        "optic_disc_detected": True,
        "fovea_detected": True
    },
    "clinical_summary": (
        "Moderate NPDR detected. Referral recommended."
    ),
    "evidence_statement": (
        "DR Level 2 based on microaneurysm count "
        "and hemorrhage presence."
    ),
    "confidence_breakdown": {
        "image_quality": 0.87,
        "classification": 0.91,
        "lesion_detection": 0.83
    },
    "generated_at": "2026-09-05T10:32:11Z"
}