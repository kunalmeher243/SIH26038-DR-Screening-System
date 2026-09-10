import {
  useEffect,
  useRef,
  useState,
} from "react";
import "../styles/LiquidGlass.css";
import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";
import ResultDashboard from "../components/ResultDashboard";
import GradCAMViewer from "../components/GradCAMViewer";
import PipelineFlow from "../components/PipelineFlow";
import LiquidGlass from "../components/LiquidGlass";
import ClinicalReport from "../components/ClinicalReport";

function Analysis() {
  const resultRef = useRef(null);
  const { t } = useLanguageStore();

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

  const handleRecapture = () => {
    reset();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
     EMPTY STATE
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
                {t("noAnalysisTitle")}
              </h1>

              <p>
                {t("noAnalysisDesc")}
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
        : t("serviceUnavailableHelp"));

    let errorKicker =
      t("screeningSystemKicker");

    let errorTitle =
      t("serviceUnavailableTitle");

    let helpText =
      t("serviceUnavailableHelp");

    /* -------------------------------------------------------
       UNGRADABLE
       ------------------------------------------------------- */

    if (
      errorType === "ungradable"
    ) {
      errorKicker =
        t("pipeQualityTitle");

      errorTitle =
        t("imageNotSuitableTitle");

      helpText =
        t("imageNotSuitableHelp");
    }

    /* -------------------------------------------------------
       HUMAN REVIEW
       ------------------------------------------------------- */

    if (
      errorType === "human_review"
    ) {
      errorKicker =
        t("clinicalReviewReqKicker");

      errorTitle =
        t("flaggedDoctorTitle");

      helpText =
        t("flaggedDoctorHelp");
    }

    /* -------------------------------------------------------
       API ERROR
       ------------------------------------------------------- */

    if (
      errorType === "api_error"
    ) {
      errorKicker =
        t("screeningSystemKicker");

      errorTitle =
        t("serviceUnavailableTitle");

      helpText =
        t("serviceUnavailableHelp");
    }

    /* -------------------------------------------------------
       TIMEOUT
       ------------------------------------------------------- */

    if (
      errorType === "api_timeout"
    ) {
      errorKicker =
        t("requestTimeoutTitle");

      errorTitle =
        t("requestTimeoutTitle");

      helpText =
        t("requestTimeoutHelp");
    }

    return (
      <main className="analysis-page">
        <div className="analysis-container">

          {/* HEADER */}
          <header className="analysis-header">
            <div>
              <span className="brand-kicker">
                {t("screeningSystemKicker")}
              </span>

              <h1>
                {t("screeningUnable")}
              </h1>

              <p>
                {t("screeningUnableDesc")}
              </p>
            </div>

            <div
              className="analysis-status status-error"
            >
              <span className="status-dot" />
              {t("analysisStopped")}
            </div>
          </header>

          {/* IMAGE INFORMATION */}
          <LiquidGlass
            variant="light"
            className="analysis-info-card"
          >
            <div className="info-item">
              <span className="info-label">
                {t("retinalImageLabel")}
              </span>

              <strong>
                {file.name}
              </strong>
            </div>

            <div className="info-item">
              <span className="info-label">
                {t("eyeLabel")}
              </span>

              <strong>
                {eye === "right"
                  ? t("rightEye")
                  : t("leftEye")}
              </strong>
            </div>

            <div className="info-item">
              <span className="info-label">
                {t("fileSizeLabel")}
              </span>

              <strong>
                {fileSize.toFixed(2)} MB
              </strong>
            </div>

            <div className="info-item">
              <span className="info-label">
                {t("pipelineLabel")}
              </span>

              <strong>
                {errorType === "ungradable"
                  ? t("stoppedAtQuality")
                  : t("pipelineInterrupted")}
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
                        {t("qualityScoreLabel")}
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
                        {t("statusLabelUpper")}
                      </span>

                      <strong>
                        {quality.quality_label ||
                          t("pipeStopped")}
                      </strong>
                    </div>
                  </div>
                )}

              <p className="error-help-text">
                {helpText}
              </p>

              <div className="error-actions">
                {errorType === "ungradable" ? (
                  <button
                    type="button"
                    className="recapture-button"
                    onClick={handleRecapture}
                  >
                    {t("recaptureBtn")}
                  </button>
                ) : errorType === "human_review" ? (
                  <button
                    type="button"
                    className="recapture-button"
                    onClick={reset}
                  >
                    {t("uploadNewImageBtn")}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="recapture-button"
                      onClick={runFullAnalysis}
                    >
                      {t("retryAnalysisBtn")}
                    </button>

                    <button
                      type="button"
                      className="recapture-button"
                      onClick={handleRecapture}
                    >
                      {t("uploadNewImageBtn")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </LiquidGlass>

          {/* PIPELINE */}
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  {t("pipeProcessingKicker")}
                </span>

                <h2>
                  {t("pipelineProgress")}
                </h2>

                <p>
                  {t("pipeStoppedDesc")}
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

        {/* HEADER */}
        <header className="analysis-header">
          <div>
            <span className="brand-kicker">
              {t("screeningSystemKicker")}
            </span>

            <h1>
              {t("drAnalysisTitle")}
            </h1>

            <p>
              {t("drAnalysisSubtitle")}
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
              ? t("analysisComplete")
              : t("analysisInProgress")}
          </div>
        </header>

        {/* IMAGE INFORMATION */}
        <LiquidGlass
          variant="light"
          className="analysis-info-card"
        >
          <div className="info-item">
            <span className="info-label">
              {t("retinalImageLabel")}
            </span>

            <strong>
              {file.name}
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              {t("eyeLabel")}
            </span>

            <strong>
              {eye === "right"
                ? t("rightEye")
                : t("leftEye")}
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              {t("fileSizeLabel")}
            </span>

            <strong>
              {fileSize.toFixed(2)} MB
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              {t("pipelineLabel")}
            </span>

            <strong>
              {isComplete
                ? t("stagesCountComplete")
                : t("stagesProcessing")}
            </strong>
          </div>
        </LiquidGlass>

        {/* LIVE PROCESSING PIPELINE */}
        <section
          className="dashboard-section pipeline-section-top"
        >
          <PipelineFlow />
        </section>

        {/* RESULTS ONLY WHEN COMPLETE */}
        {isComplete && (
          <>
            {/* PRIMARY ASSESSMENT */}
            <section
              ref={resultRef}
              className="dashboard-section screening-result-section"
            >
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    {t("primaryAssessment")}
                  </span>

                  <h2>
                    {t("screeningResultTitle")}
                  </h2>

                  <p>
                    {t("screeningResultDesc")}
                  </p>
                </div>

                {grade && (
                  <span className="dr-level-badge">
                    {t("drLevelPrefix")} {drLevel}
                  </span>
                )}
              </div>

              <ResultDashboard />
            </section>

            {/* AI EXPLAINABILITY */}
            <section
              className="dashboard-section explainability-section"
            >
              <div className="section-heading">
                <div>
                  <h2>
                    {t("clinicalEvidenceTitle")}
                  </h2>
                </div>
              </div>

              <GradCAMViewer />
            </section>

            {/* CONFIDENCE BREAKDOWN */}
            <section
              className="dashboard-section"
            >
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    {t("modelReliability")}
                  </span>

                  <h2>
                    {t("confidenceBreakdownTitle")}
                  </h2>

                  <p>
                    {t("confidenceBreakdownDesc")}
                  </p>
                </div>
              </div>

              <LiquidGlass
                variant="light"
                className="confidence-breakdown-card"
              >
                <ConfidenceRow
                  label={t("imageQualityStage")}
                  value={
                    imageQualityConfidence
                  }
                />

                <ConfidenceRow
                  label={t("classificationStage")}
                  value={
                    classificationConfidence
                  }
                />

                <ConfidenceRow
                  label={t("lesionDetectionStage")}
                  value={
                    lesionConfidence
                  }
                />
              </LiquidGlass>
            </section>

            {/* CLINICAL REPORT + WHATSAPP DELIVERY */}
            <ClinicalReport
              file={file}
              eye={eye}
              quality={quality}
              grade={grade}
              report={report}
            />

            {/* CLINICAL SUMMARY */}
            <section
              className="dashboard-section"
            >
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    {t("clinicalInterpretation")}
                  </span>

                  <h2>
                    {t("screeningSummaryTitle")}
                  </h2>

                  <p>
                    {t("screeningSummaryDesc")}
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
                    {t("clinicalSummaryTitle")}
                  </h3>

                  <p>
                    {report?.clinical_summary ||
                      t("screeningSummaryDesc")}
                  </p>

                  {report?.evidence_statement && (
                    <div className="evidence-statement">
                      <span>
                        {t("aiEvidenceKicker")}
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