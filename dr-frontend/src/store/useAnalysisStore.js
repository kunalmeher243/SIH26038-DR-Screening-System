import { create } from "zustand";

import {
  assessQuality,
  enhanceImage,
  gradeImage,
  generateReport,
} from "../api/endpoints";

const useAnalysisStore = create((set) => ({
  // =========================
  // Uploaded file
  // =========================
  file: null,

  // =========================
  // Selected eye
  // =========================
  eye: "right",

  // =========================
  // Current pipeline stage
  // =========================
  stage: "idle",

  // =========================
  // API responses
  // =========================
  quality: null,
  enhance: null,
  grade: null,
  report: null,

  // =========================
  // Error
  // =========================
  error: null,

  // =========================
  // Set file
  // =========================
  setFile: (file) =>
    set({
      file,
      stage: "idle",
      quality: null,
      enhance: null,
      grade: null,
      report: null,
      error: null,
    }),

  // =========================
  // Set eye
  // =========================
  setEye: (eye) =>
    set({
      eye,
    }),

  // =========================
  // Set stage
  // =========================
  setStage: (stage) =>
    set({
      stage,
    }),

  // =========================
  // Set API responses
  // =========================
  setQuality: (quality) =>
    set({
      quality,
    }),

  setEnhance: (enhance) =>
    set({
      enhance,
    }),

  setGrade: (grade) =>
    set({
      grade,
    }),

  setReport: (report) =>
    set({
      report,
      stage: "done",
      error: null,
    }),

  // =========================
  // Set error
  // =========================
  setError: (error) =>
    set({
      error,
      stage: "error",
    }),

  // =========================
  // FULL ANALYSIS PIPELINE
  // =========================
  runFullAnalysis: async (file) => {
    try {
      // Clear previous error
      set({
        error: null,
        stage: "quality",
      });

      // -------------------------
      // 1. Image Quality
      // -------------------------
      console.log("Starting quality assessment...");

      const qualityResult = await assessQuality(file);

      set({
        quality: qualityResult,
      });

      console.log("Quality result:", qualityResult);

      // -------------------------
      // 2. Image Enhancement
      // -------------------------
      set({
        stage: "enhance",
      });

      console.log("Starting image enhancement...");

      const enhanceResult = await enhanceImage(file);

      set({
        enhance: enhanceResult,
      });

      console.log("Enhancement result:", enhanceResult);

      // -------------------------
      // 3. Disease Grading
      // -------------------------
      set({
        stage: "grade",
      });

      console.log("Starting disease grading...");

      const gradeResult = await gradeImage(file);

      set({
        grade: gradeResult,
      });

      console.log("Grade result:", gradeResult);

      // -------------------------
      // 4. Generate Report
      // -------------------------
      set({
        stage: "report",
      });

      console.log("Generating final report...");

      const reportResult = await generateReport(file);

      set({
        report: reportResult,
        stage: "done",
        error: null,
      });

      console.log("Final report:", reportResult);

      return reportResult;
    } catch (error) {
      console.error("Analysis failed:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Analysis failed. Please try again.";

      set({
        error: message,
        stage: "error",
      });

      throw error;
    }
  },

  // =========================
  // Reset everything
  // =========================
  reset: () =>
    set({
      file: null,
      eye: "right",
      stage: "idle",
      quality: null,
      enhance: null,
      grade: null,
      report: null,
      error: null,
    }),
}));

export default useAnalysisStore;