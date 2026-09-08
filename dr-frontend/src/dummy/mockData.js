/* =========================================================
   DUMMY MODE
   ========================================================= */

export const USE_DUMMY = true;


/* =========================================================
   IMAGE QUALITY
   ========================================================= */

export const DUMMY_QUALITY = {
  gradable: true,
  quality_score: 0.87,
  quality_label: "GRADABLE",
  recommendation:
    "The retinal image is suitable for automated screening.",
};


export const DUMMY_BORDERLINE_QUALITY = {
  gradable: true,
  quality_score: 0.62,
  quality_label: "BORDERLINE",
  recommendation:
    "Image quality is borderline but suitable for screening.",
  issue:
    "Moderate image quality variation detected.",
};


export const DUMMY_UNGRADABLE_QUALITY = {
  gradable: false,
  quality_score: 0.28,
  quality_label: "UNGRADABLE",
  recommendation:
    "Image quality is insufficient. Please recapture the retinal image with better focus and illumination.",
  issue:
    "The image is blurry and retinal structures are unclear.",
};


/* =========================================================
   IMAGE ENHANCEMENT
   ========================================================= */

export const DUMMY_ENHANCE = {
  enhanced_image: null,
  original_image: null,

  techniques: [
    "CLAHE",
    "illumination_normalization",
    "denoising",
  ],

  enhancement_trustworthy: true,
};


/* =========================================================
   NORMAL DR GRADE
   ========================================================= */

export const DUMMY_GRADE = {
  dr_level: 2,

  dr_label:
    "Moderate Non-Proliferative DR",

  confidence: 0.91,

  calibrated_confidence: 0.88,

  refer: true,

  referral_urgency:
    "standard",

  routing:
    "PRIORITY_REFERRAL",

  class_probabilities: {
    "0": 0.01,
    "1": 0.04,
    "2": 0.88,
    "3": 0.06,
    "4": 0.01,
  },
};


/* =========================================================
   HUMAN REVIEW GRADE
   ========================================================= */

export const DUMMY_HUMAN_REVIEW = {
  dr_level: 2,

  dr_label:
    "Moderate Non-Proliferative DR",

  confidence: 0.67,

  calibrated_confidence: 0.64,

  refer: true,

  referral_urgency:
    "standard",

  routing:
    "HUMAN_REVIEW",

  class_probabilities: {
    "0": 0.03,
    "1": 0.10,
    "2": 0.67,
    "3": 0.16,
    "4": 0.04,
  },
};


/* =========================================================
   SCREENING REPORT
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
    optic_disc: {
      detected: true,
    },

    fovea: {
      detected: true,
    },
  },

  clinical_summary:
    "Moderate NPDR detected. 8 microaneurysms and 3 hemorrhages identified.",

  evidence_statement:
    "The screening result is supported by detected retinal lesions and the model classification.",

  confidence_breakdown: {
    image_quality: 0.87,
    classification: 0.91,
    lesion_detection: 0.83,
  },

  generated_at:
    new Date().toISOString(),
};