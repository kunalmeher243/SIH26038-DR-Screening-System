export const USE_DUMMY = true;


/* =========================================================
   NORMAL / GRADABLE IMAGE
   ========================================================= */

export const DUMMY_QUALITY = {
  gradable: true,
  quality_score: 0.87,
  quality_label: "GRADABLE",
  issues: [],
  recommendation:
    "Image is suitable for automated grading.",
};


/* =========================================================
   BORDERLINE IMAGE
   ========================================================= */

export const DUMMY_BORDERLINE_QUALITY = {
  gradable: true,
  quality_score: 0.62,
  quality_label: "BORDERLINE",
  issues: [
    "Moderate image quality variation detected.",
  ],
  recommendation:
    "Image is borderline but suitable for automated screening.",
};


/* =========================================================
   UNGRADABLE IMAGE
   ========================================================= */

export const DUMMY_UNGRADABLE_QUALITY = {
  gradable: false,
  quality_score: 0.28,
  quality_label: "UNGRADABLE",
  issues: [
    "Image is too blurry for reliable assessment.",
    "Retinal structures are not sufficiently clear.",
  ],
  recommendation:
    "Image quality is insufficient for automated screening. Please recapture the retinal image.",
};


/* =========================================================
   ENHANCEMENT
   ========================================================= */

export const DUMMY_ENHANCE = {
  enhanced_image: null,
  original_image: null,
  techniques_applied: [
    "CLAHE",
    "illumination_normalization",
    "denoising",
  ],
  enhancement_trustworthy: true,
};


/* =========================================================
   DR GRADING
   ========================================================= */

export const DUMMY_GRADE = {
  dr_level: 2,
  dr_label: "Moderate Non-Proliferative DR",
  confidence: 0.91,
  calibrated_confidence: 0.88,
  refer: true,
  referral_urgency: "standard",
  routing: "PRIORITY_REFERRAL",

  class_probabilities: {
    "0": 0.01,
    "1": 0.04,
    "2": 0.88,
    "3": 0.06,
    "4": 0.01,
  },
};


/* =========================================================
   CLINICAL REPORT
   ========================================================= */

export const DUMMY_REPORT = {
  gradcam_image: null,
  lesion_overlay_image: null,

  lesions: {
    microaneurysms: 8,
    hemorrhages: 3,
    hard_exudates: 2,
    soft_exudates: 0,
    neovascularization: false,
  },

  anatomy: {
    optic_disc_detected: true,
    fovea_detected: true,
  },

  clinical_summary:
    "Moderate NPDR detected. 8 microaneurysms and 3 hemorrhages identified.",

  evidence_statement:
    "DR Level 2 assigned based on: microaneurysm count exceeding threshold.",

  confidence_breakdown: {
    image_quality: 0.87,
    classification: 0.91,
    lesion_detection: 0.83,
  },

  generated_at: new Date().toISOString(),
};