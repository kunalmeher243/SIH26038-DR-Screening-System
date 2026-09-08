import { create } from "zustand";

import {
  checkQuality,
  enhanceImage,
  gradeImage,
  generateReport,
} from "../api/endpoints";


const useAnalysisStore = create(
  (set, get) => ({

    /* =====================================================
       STATE
       ===================================================== */

    file: null,

    eye: "right",

    stage: "idle",

    quality: null,

    enhance: null,

    grade: null,

    report: null,

    error: null,


    /* =====================================================
       SET FILE
       ===================================================== */

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


    /* =====================================================
       SET EYE
       ===================================================== */

    setEye: (eye) =>
      set({
        eye,
      }),


    /* =====================================================
       SET STAGE
       ===================================================== */

    setStage: (stage) =>
      set({
        stage,
      }),


    /* =====================================================
       SET QUALITY
       ===================================================== */

    setQuality: (quality) =>
      set({
        quality,
      }),


    /* =====================================================
       SET ENHANCEMENT
       ===================================================== */

    setEnhance: (enhance) =>
      set({
        enhance,
      }),


    /* =====================================================
       SET GRADE
       ===================================================== */

    setGrade: (grade) =>
      set({
        grade,
      }),


    /* =====================================================
       SET REPORT
       ===================================================== */

    setReport: (report) =>
      set({
        report,

        stage: "done",

        error: null,
      }),


    /* =====================================================
       SET ERROR
       ===================================================== */

    setError: (error) =>
      set({
        error,

        stage: "error",
      }),


    /* =====================================================
       FULL ANALYSIS PIPELINE
       ===================================================== */

    runFullAnalysis: async () => {

      const {
        file,
        setStage,
        setQuality,
        setEnhance,
        setGrade,
        setReport,
        setError,
      } = get();


      /* ===================================================
         NO FILE
         =================================================== */

      if (!file) {

        setError({
          type: "unknown",

          message:
            "Please select a retinal image first.",
        });

        return;
      }


      /* ===================================================
         CLEAR PREVIOUS ERROR
         =================================================== */

      set({
        error: null,
      });


      try {

        /* =================================================
           STEP 1 — IMAGE QUALITY
           ================================================= */

        setStage(
          "quality"
        );


        const qualityResult =
          await checkQuality(file);


        console.log(
          "Quality response:",
          qualityResult
        );


        setQuality(
          qualityResult
        );


        /* =================================================
           UNGRADABLE GATE
           ================================================= */

        if (
          qualityResult &&
          qualityResult.gradable === false
        ) {

          console.log(
            "Image is UNGRADABLE. Stopping pipeline."
          );


          setError({
            type: "ungradable",

            message:
              qualityResult.recommendation ||
              "The retinal image is not suitable for automated screening.",
          });


          /*
           * STOP HERE.
           *
           * These functions WILL NOT execute:
           *
           * enhanceImage()
           * gradeImage()
           * generateReport()
           */

          return;
        }


        /* =================================================
           STEP 2 — IMAGE ENHANCEMENT
           ================================================= */

        setStage(
          "enhance"
        );


        const enhanceResult =
          await enhanceImage(file);


        console.log(
          "Enhancement response:",
          enhanceResult
        );


        setEnhance(
          enhanceResult
        );


        /* =================================================
           STEP 3 — DR GRADING
           ================================================= */

        setStage(
          "grade"
        );


        const gradeResult =
          await gradeImage(file);


        console.log(
          "Grade response:",
          gradeResult
        );


        setGrade(
          gradeResult
        );


        /* =================================================
           HUMAN REVIEW GATE
           ================================================= */

        if (
          gradeResult &&
          gradeResult.routing ===
            "HUMAN_REVIEW"
        ) {

          console.log(
            "Result requires HUMAN_REVIEW. Stopping pipeline."
          );


          setError({
            type: "human_review",

            message:
              "The screening result requires review by a qualified clinician before a final screening decision is made.",
          });


          /*
           * STOP HERE.
           *
           * Clinical report is intentionally
           * NOT generated for HUMAN_REVIEW.
           */

          return;
        }


        /* =================================================
           STEP 4 — CLINICAL REPORT
           ================================================= */

        setStage(
          "report"
        );


        const reportResult =
          await generateReport(file);


        console.log(
          "Report response:",
          reportResult
        );


        setReport(
          reportResult
        );


        /* =================================================
           COMPLETE
           ================================================= */

        setStage(
          "done"
        );


        console.log(
          "Analysis pipeline completed successfully."
        );

      } catch (error) {

        console.error(
          "Analysis pipeline failed:",
          error
        );


        /* =================================================
           TIMEOUT
           ================================================= */

        const isTimeout =
          error?.code ===
            "ECONNABORTED" ||
          error?.code ===
            "ETIMEDOUT";


        if (isTimeout) {

          setError({
            type: "api_timeout",

            message:
              "The screening service timed out. Please try the analysis again.",
          });

          return;
        }


        /* =================================================
           API ERROR
           ================================================= */

        const isApiError =
          Boolean(
            error?.response
          ) ||
          error?.code ===
            "ERR_BAD_RESPONSE";


        if (isApiError) {

          setError({
            type: "api_error",

            message:
              error?.response?.data?.detail ||
              "The screening service returned an error. Please try again.",
          });

          return;
        }


        /* =================================================
           UNKNOWN ERROR
           ================================================= */

        setError({
          type: "unknown",

          message:
            error?.message ||
            "An unexpected error occurred during analysis.",
        });
      }
    },


    /* =====================================================
       RESET
       ===================================================== */

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

  })
);


export default useAnalysisStore;