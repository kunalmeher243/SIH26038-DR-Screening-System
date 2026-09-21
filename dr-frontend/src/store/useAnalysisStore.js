import { create } from "zustand";

import {
  checkQuality,
  enhanceImage,
  gradeImage,
  generateReport,
} from "../api/endpoints";


const useAnalysisStore = create(
  (set, get) => ({

    /*
     * =====================================================
     * STATE
     * =====================================================
     */

    file: null,

    eye: "right",

    stage: "idle",

    quality: null,

    enhance: null,

    grade: null,

    report: null,

    error: null,


    /*
     * =====================================================
     * SET FILE
     * =====================================================
     */

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


    /*
     * =====================================================
     * SET EYE
     *
     * Kept for compatibility with the existing UI.
     * Do NOT invent automatic eye detection here.
     * =====================================================
     */

    setEye: (eye) =>

      set({
        eye,
      }),


    /*
     * =====================================================
     * SET STAGE
     * =====================================================
     */

    setStage: (stage) =>

      set({
        stage,
      }),


    /*
     * =====================================================
     * SET QUALITY
     * =====================================================
     */

    setQuality: (quality) =>

      set({
        quality,
      }),


    /*
     * =====================================================
     * SET ENHANCEMENT
     * =====================================================
     */

    setEnhance: (enhance) =>

      set({
        enhance,
      }),


    /*
     * =====================================================
     * SET GRADE
     * =====================================================
     */

    setGrade: (grade) =>

      set({
        grade,
      }),


    /*
     * =====================================================
     * SET REPORT
     * =====================================================
     */

    setReport: (report) =>

      set({
        report,

        stage: "done",

        error: null,
      }),


    /*
     * =====================================================
     * SET ERROR
     * =====================================================
     */

    setError: (error) =>

      set({
        error,

        stage: "error",
      }),


    /*
     * =====================================================
     * FULL ANALYSIS PIPELINE
     * =====================================================
     *
     * REAL API ONLY
     *
     * quality
     *    ↓
     * enhance
     *    ↓
     * grade
     *    ↓
     * report
     *
     * =====================================================
     */

    runFullAnalysis:
      async () => {

        const {
          file,

          setStage,

          setQuality,

          setEnhance,

          setGrade,

          setReport,

          setError,
        } = get();


        /*
         * =================================================
         * NO FILE
         * =================================================
         */

        if (!file) {

          setError({
            type: "unknown",

            message:
              "Please select a retinal image first.",
          });

          return;
        }


        /*
         * =================================================
         * CLEAR PREVIOUS ERROR / RESULTS
         * =================================================
         */

        set({
          error: null,

          quality: null,

          enhance: null,

          grade: null,

          report: null,
        });


        try {

          /*
           * ===============================================
           * STEP 1 — IMAGE QUALITY
           * ===============================================
           */

          setStage(
            "quality"
          );


          const qualityResult =
            await checkQuality(
              file
            );


          console.log(
            "[RetinaTrack] Quality:",
            qualityResult
          );


          setQuality(
            qualityResult
          );


          /*
           * ===============================================
           * UNGRADABLE GATE
           * ===============================================
           *
           * If the real backend says the image
           * is not gradable, stop here.
           */

          if (
            qualityResult &&
            qualityResult.gradable === false
          ) {

            setError({

              type:
                "ungradable",

              message:
                qualityResult.recommendation ||

                "The retinal image is not suitable for automated screening.",
            });


            return;
          }


          /*
           * ===============================================
           * STEP 2 — IMAGE ENHANCEMENT
           * ===============================================
           */

          setStage(
            "enhance"
          );


          const enhanceResult =
            await enhanceImage(
              file
            );


          console.log(
            "[RetinaTrack] Enhancement:",
            enhanceResult
          );


          setEnhance(
            enhanceResult
          );


          /*
           * ===============================================
           * STEP 3 — DR GRADING
           * ===============================================
           */

          setStage(
            "grade"
          );


          const gradeResult =
            await gradeImage(
              file
            );


          console.log(
            "[RetinaTrack] Grade:",
            gradeResult
          );


          setGrade(
            gradeResult
          );


          /*
           * ===============================================
           * HUMAN REVIEW GATE
           * ===============================================
           */

          if (
            gradeResult &&
            gradeResult.routing ===
              "HUMAN_REVIEW"
          ) {

            setError({

              type:
                "human_review",

              message:
                "The screening result requires review by a qualified clinician before a final screening decision is made.",
            });


            return;
          }


          /*
           * ===============================================
           * STEP 4 — CLINICAL REPORT
           * ===============================================
           */

          setStage(
            "report"
          );


          const reportResult =
            await generateReport(
              file
            );


          console.log(
            "[RetinaTrack] Report:",
            reportResult
          );


          setReport(
            reportResult
          );


          /*
           * ===============================================
           * COMPLETE
           * ===============================================
           */

          setStage(
            "done"
          );


          console.log(
            "[RetinaTrack] Analysis completed successfully."
          );

        } catch (error) {

          console.error(
            "[RetinaTrack] Analysis failed:",
            error
          );


          setError({

            type:
              "api_error",

            message:
              error?.userMessage ||

              error?.response?.data?.detail ||

              error?.message ||

              "The screening service is currently unavailable. Please try again.",
          });

        }
      },


    /*
     * =====================================================
     * RESET
     * =====================================================
     */

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