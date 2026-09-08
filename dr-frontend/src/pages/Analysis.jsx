import {
  useEffect,
  useRef,
  useState,
} from "react";
import "../styles/liquidGlass.css";
import useAnalysisStore from "../store/useAnalysisStore";
import ResultDashboard from "../components/ResultDashboard";
import GradCAMViewer from "../components/GradCAMViewer";
import PipelineFlow from "../components/PipelineFlow";
import LiquidGlass from "../components/LiquidGlass";


function Analysis() {

  const resultRef = useRef(null);

  const file = useAnalysisStore(
    (state) => state.file
  );

  const eye = useAnalysisStore(
    (state) => state.eye
  );

  const stage = useAnalysisStore(
    (state) => state.stage
  );

  const quality = useAnalysisStore(
    (state) => state.quality
  );

  const grade = useAnalysisStore(
    (state) => state.grade
  );

  const report = useAnalysisStore(
    (state) => state.report
  );

  const error = useAnalysisStore(
    (state) => state.error
  );

  const reset = useAnalysisStore(
    (state) => state.reset
  );

  const runFullAnalysis =
    useAnalysisStore(
      (state) => state.runFullAnalysis
    );


  /* =========================================================
     IMAGE PREVIEW
     ========================================================= */

  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);


  useEffect(() => {

    if (!file) {

      setImagePreview(null);

      return;
    }


    const objectUrl =
      URL.createObjectURL(file);


    setImagePreview(
      objectUrl
    );


    return () => {

      URL.revokeObjectURL(
        objectUrl
      );

    };

  }, [file]);


  /* =========================================================
     SMOOTHLY SHOW SCREENING RESULT
     ========================================================= */

  useEffect(() => {

    if (stage !== "done") {
      return;
    }

    /*
     * Wait until the Screening Result has fully rendered,
     * then place its heading near the top of the viewport.
     * A small offset keeps the heading from touching the browser edge.
     */
    const timer = setTimeout(() => {

      const result = resultRef.current;

      if (!result) return;

      const top =
        result.getBoundingClientRect().top +
        window.scrollY -
        18;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });

    }, 350);

    return () => {
      clearTimeout(timer);
    };

  }, [stage]);


  /* =========================================================
     EMPTY
     ========================================================= */

  if (!file) {

    return (

      <main className="analysis-page">

        <div className="analysis-container">

          <LiquidGlass
            variant="light"
            className="empty-analysis-card"
          >

            <div className="empty-analysis">

              <div className="empty-icon">
                ◎
              </div>


              <h1>
                No Analysis Available
              </h1>


              <p>
                Upload a retinal image and start
                the screening analysis first.
              </p>

            </div>

          </LiquidGlass>

        </div>

      </main>
    );
  }


  /* =========================================================
     DATA
     ========================================================= */

  const fileSize =
    file.size /
    (1024 * 1024);


  const isComplete =
    stage === "done";


  const drLevel =
    grade?.dr_level ?? "—";


  /* =========================================================
     ERROR SCREEN
     ========================================================= */

  if (
    error ||
    stage === "error"
  ) {

    const errorType =
      error?.type || "unknown";


    const errorMessage =
      error?.message ||
      (typeof error === "string"
        ? error
        : "An unexpected error occurred during analysis.");


    let errorKicker =
      "ANALYSIS ERROR";


    let errorTitle =
      "Analysis Error";


    let helpText =
      "Please try the analysis again.";


    /* -------------------------------------------------------
       UNGRADABLE
       ------------------------------------------------------- */

    if (
      errorType === "ungradable"
    ) {

      errorKicker =
        "IMAGE QUALITY CHECK";


      errorTitle =
        "Image Not Suitable for Analysis";


      helpText =
        "Please recapture the retinal image with the optic disc and retinal area clearly visible.";

    }

    /* -------------------------------------------------------
   HUMAN REVIEW
   ------------------------------------------------------- */

    if (
      errorType === "human_review"
    ) {

      errorKicker =
        "CLINICAL REVIEW REQUIRED";

      errorTitle =
        "Flagged for Doctor Review";

      helpText =
        "The AI screening result requires review by a qualified clinician before a final screening decision is made.";
    }

    /* -------------------------------------------------------
       API ERROR
       ------------------------------------------------------- */

    if (
      errorType === "api_error"
    ) {

      errorKicker =
        "SCREENING SERVICE ERROR";


      errorTitle =
        "Screening Service Unavailable";


      helpText =
        "The screening service returned an error. Please retry the analysis.";

    }


    /* -------------------------------------------------------
       TIMEOUT
       ------------------------------------------------------- */

    if (
      errorType === "api_timeout"
    ) {

      errorKicker =
        "REQUEST TIMEOUT";


      errorTitle =
        "Request Timed Out";


      helpText =
        "The screening service took too long to respond. Please try again.";

    }


    return (

      <main className="analysis-page">

        <div className="analysis-container">


          {/* HEADER */}

          <header className="analysis-header">

            <div>

              <span className="brand-kicker">
                RETINA AI · SCREENING SYSTEM
              </span>


              <h1>
                Screening Unable to Continue
              </h1>


              <p>
                The uploaded retinal image could not
                be processed for automated screening.
              </p>

            </div>


            <div
              className="analysis-status status-error"
            >

              <span className="status-dot" />

              Analysis Stopped

            </div>

          </header>


          {/* IMAGE INFORMATION */}

          <LiquidGlass
            variant="light"
            className="analysis-info-card"
          >

            <div className="info-item">

              <span className="info-label">
                RETINAL IMAGE
              </span>


              <strong>
                {file.name}
              </strong>

            </div>


            <div className="info-item">

              <span className="info-label">
                EYE
              </span>


              <strong>
                {eye === "right"
                  ? "Right Eye"
                  : "Left Eye"}
              </strong>

            </div>


            <div className="info-item">

              <span className="info-label">
                FILE SIZE
              </span>


              <strong>
                {fileSize.toFixed(2)} MB
              </strong>

            </div>


            <div className="info-item">

              <span className="info-label">
                PIPELINE
              </span>


              <strong>
                {errorType === "ungradable"
                  ? "Stopped at Image Quality"
                  : "Pipeline Interrupted"}
              </strong>

            </div>

          </LiquidGlass>


          {/* ERROR CARD */}

          <LiquidGlass
            variant="light"
            className="error-card phase1-error-card"
          >

            <div className="error-icon">
              !
            </div>


            <div className="error-content">

              <span className="section-kicker">
                {errorKicker}
              </span>


              <h2>
                {errorTitle}
              </h2>


              <p>
                {errorMessage}
              </p>


              {/* UNGRADABLE QUALITY */}

              {errorType ===
                "ungradable" &&
                quality && (

                  <div
                    className="ungradable-quality-summary"
                  >

                    <div>

                      <span>
                        QUALITY SCORE
                      </span>


                      <strong>
                        {Math.round(
                          (quality.quality_score ||
                            0) * 100
                        )}
                        %
                      </strong>

                    </div>


                    <div>

                      <span>
                        STATUS
                      </span>


                      <strong>
                        {quality.quality_label ||
                          "UNGRADABLE"}
                      </strong>

                    </div>

                  </div>

                )}


              <p className="error-help-text">
                {helpText}
              </p>


              <div className="error-actions">

                {errorType === "ungradable" ||
                  errorType === "human_review" ? (

                  <button
                    type="button"
                    className="recapture-button"
                    onClick={reset}
                  >
                    {errorType === "human_review"
                      ? "Upload New Image"
                      : "Recapture / Upload New Image"}
                  </button>

                ) : (

                  <button
                    type="button"
                    className="recapture-button"
                    onClick={runFullAnalysis}
                  >
                    Retry Analysis
                  </button>

                )}

              </div>

            </div>

          </LiquidGlass>


          {/* PIPELINE */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <span className="section-kicker">
                  PROCESSING PIPELINE
                </span>


                <h2>
                  Analysis Progress
                </h2>


                <p>
                  Processing stopped before the final
                  screening result was generated.
                </p>

              </div>

            </div>


            <PipelineFlow />

          </section>

        </div>

      </main>
    );
  }


  /* =========================================================
     CONFIDENCE
     ========================================================= */

  const confidenceBreakdown =
    report?.confidence_breakdown || {};


  const imageQualityConfidence =
    confidenceBreakdown.image_quality ??
    quality?.quality_score ??
    0;


  const classificationConfidence =
    confidenceBreakdown.classification ??
    grade?.confidence ??
    0;


  const lesionConfidence =
    confidenceBreakdown.lesion_detection ??
    0;


  /* =========================================================
     NORMAL PAGE
     ========================================================= */

  return (

    <main className="analysis-page">

      <div className="analysis-container">


        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="analysis-header">

          <div>

            <span className="brand-kicker">
              RETINA AI · SCREENING SYSTEM
            </span>


            <h1>
              DR Screening Analysis
            </h1>


            <p>
              AI-assisted retinal image screening
              and clinical evidence assessment
            </p>

          </div>


          <div
            className={`analysis-status ${isComplete
              ? "status-complete"
              : ""
              }`}
          >

            <span className="status-dot" />


            {isComplete
              ? "Analysis Complete"
              : "Analysis in Progress"}

          </div>

        </header>


        {/* ===================================================
            IMAGE INFORMATION
            =================================================== */}

        <LiquidGlass
          variant="light"
          className="analysis-info-card"
        >

          <div className="info-item">

            <span className="info-label">
              RETINAL IMAGE
            </span>


            <strong>
              {file.name}
            </strong>

          </div>


          <div className="info-item">

            <span className="info-label">
              EYE
            </span>


            <strong>
              {eye === "right"
                ? "Right Eye"
                : "Left Eye"}
            </strong>

          </div>


          <div className="info-item">

            <span className="info-label">
              FILE SIZE
            </span>


            <strong>
              {fileSize.toFixed(2)} MB
            </strong>

          </div>


          <div className="info-item">

            <span className="info-label">
              PIPELINE
            </span>


            <strong>
              {isComplete
                ? "4 / 4 Stages"
                : "Processing"}
            </strong>

          </div>

        </LiquidGlass>


        {/* ===================================================
            LIVE PROCESSING PIPELINE
            =================================================== */}

        <section
          className="dashboard-section pipeline-section-top"
        >

          <PipelineFlow />

        </section>


        {/* ===================================================
            RESULTS
            ONLY WHEN COMPLETE
            =================================================== */}

        {isComplete && (

          <>


            {/* ===============================================
                PRIMARY ASSESSMENT
                =============================================== */}

            <section
              ref={resultRef}
              className="dashboard-section screening-result-section"
            >

              <div className="section-heading">

                <div>

                  <span className="section-kicker">
                    PRIMARY ASSESSMENT
                  </span>


                  <h2>
                    Screening Result
                  </h2>


                  <p>
                    Automated diabetic retinopathy
                    assessment
                  </p>

                </div>


                {grade && (

                  <span className="dr-level-badge">
                    DR LEVEL {drLevel}
                  </span>

                )}

              </div>


              <ResultDashboard />

            </section>


            {/* ===============================================
                AI EXPLAINABILITY
                =============================================== */}

            <section
              className="dashboard-section explainability-section"
            >

              <div className="section-heading">

                <div>

                  <span className="section-kicker">
                    AI EXPLAINABILITY
                  </span>


                  <h2>
                    Clinical Evidence
                  </h2>


                  <p>
                    Visual evidence supporting the
                    automated retinal screening assessment
                  </p>

                </div>

              </div>


              <GradCAMViewer />

            </section>


            {/* ===============================================
                CONFIDENCE BREAKDOWN
                =============================================== */}

            <section
              className="dashboard-section"
            >

              <div className="section-heading">

                <div>

                  <span className="section-kicker">
                    MODEL RELIABILITY
                  </span>


                  <h2>
                    Confidence Breakdown
                  </h2>


                  <p>
                    Confidence across the major
                    screening stages
                  </p>

                </div>

              </div>


              <LiquidGlass
                variant="light"
                className="confidence-breakdown-card"
              >

                <ConfidenceRow
                  label="Image Quality"
                  value={
                    imageQualityConfidence
                  }
                />


                <ConfidenceRow
                  label="Classification"
                  value={
                    classificationConfidence
                  }
                />


                <ConfidenceRow
                  label="Lesion Detection"
                  value={
                    lesionConfidence
                  }
                />

              </LiquidGlass>

            </section>


            {/* ===============================================
                CLINICAL SUMMARY
                =============================================== */}

            <section
              className="dashboard-section"
            >

              <div className="section-heading">

                <div>

                  <span className="section-kicker">
                    CLINICAL INTERPRETATION
                  </span>


                  <h2>
                    Screening Summary
                  </h2>


                  <p>
                    AI-generated clinical evidence
                    summary
                  </p>

                </div>

              </div>


              <LiquidGlass
                variant="light"
                className="clinical-summary"
              >

                <div className="summary-icon">
                  ✓
                </div>


                <div className="summary-content">

                  <h3>
                    Clinical Summary
                  </h3>


                  <p>
                    {report?.clinical_summary ||
                      "Clinical summary will appear after analysis."}
                  </p>


                  {report?.evidence_statement && (

                    <div className="evidence-statement">

                      <span>
                        AI EVIDENCE
                      </span>


                      <p>
                        {report.evidence_statement}
                      </p>

                    </div>

                  )}

                </div>

              </LiquidGlass>

            </section>

          </>

        )}

      </div>

    </main>
  );
}


/* =========================================================
   CONFIDENCE ROW
   ========================================================= */

function ConfidenceRow({
  label,
  value,
}) {

  const percentage =
    Math.round(
      Math.max(
        0,
        Math.min(
          1,
          value || 0
        )
      ) * 100
    );


  return (

    <div className="confidence-row">

      <div className="confidence-label">

        <span>
          {label}
        </span>


        <strong>
          {percentage}%
        </strong>

      </div>


      <div className="confidence-track">

        <div
          className="confidence-fill"
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


export default Analysis;