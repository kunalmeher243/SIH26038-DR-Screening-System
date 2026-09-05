import "../styles/liquidGlass.css";

import useAnalysisStore from "../store/useAnalysisStore";
import ResultDashboard from "../components/ResultDashboard";
import GradCAMViewer from "../components/GradCAMViewer";
import PipelineFlow from "../components/PipelineFlow";
import LiquidGlass from "../components/LiquidGlass";

function Analysis() {
  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const stage = useAnalysisStore((state) => state.stage);
  const quality = useAnalysisStore((state) => state.quality);
  const enhance = useAnalysisStore((state) => state.enhance);
  const grade = useAnalysisStore((state) => state.grade);
  const report = useAnalysisStore((state) => state.report);
  const error = useAnalysisStore((state) => state.error);

  /* =========================================================
     EMPTY STATE
     ========================================================= */

  if (!file) {
    return (
      <main className="analysis-page">
        <div className="analysis-container">
          <LiquidGlass variant="large">
            <div className="empty-analysis">
              <div className="empty-icon">◎</div>

              <h1>No Analysis Available</h1>

              <p>
                Upload a retinal image and start the screening
                analysis first.
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
    file.size / (1024 * 1024);

  const isComplete =
    stage === "done";

  const drLevel =
    grade?.dr_level ?? "—";

  const drLabel =
    grade?.dr_label ?? "Analysis pending";

  const confidence =
    grade?.confidence != null
      ? Math.round(grade.confidence * 100)
      : null;

  const calibratedConfidence =
    grade?.calibrated_confidence != null
      ? Math.round(
          grade.calibrated_confidence * 100
        )
      : null;

  /* =========================================================
     RETURN
     ========================================================= */

  return (
    <main className="analysis-page">

      <div className="analysis-container">

        {/* =====================================================
            HEADER
            ===================================================== */}

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
            className={`analysis-status ${
              isComplete
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


        {/* =====================================================
            IMAGE INFORMATION
            ===================================================== */}

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


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <LiquidGlass
            variant="light"
            className="error-card"
          >
            <div className="error-icon">
              !
            </div>

            <div>
              <h3>
                Analysis Error
              </h3>

              <p>
                {error}
              </p>
            </div>
          </LiquidGlass>
        )}


        {/* =====================================================
            PRIMARY ASSESSMENT
            ===================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                PRIMARY ASSESSMENT
              </span>

              <h2>
                Screening Result
              </h2>
            </div>

            {grade && (
              <span className="dr-level-badge">
                DR LEVEL {drLevel}
              </span>
            )}

          </div>


          <LiquidGlass
            variant="light"
            className="result-dashboard-shell"
          >

            <ResultDashboard />

          </LiquidGlass>

        </section>


        {/* =====================================================
            AI EXPLAINABILITY
            ===================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                AI EXPLAINABILITY
              </span>

              <h2>
                Clinical Evidence
              </h2>
            </div>

          </div>


          <LiquidGlass
            variant="light"
            className="result-dashboard-shell"
          >

            <div className="evidence-grid">

              {/* ===============================================
                  GRAD-CAM
                  =============================================== */}

              <div className="evidence-card">

                <div className="evidence-card-header">

                  <div>
                    <span className="card-kicker">
                      VISUAL EVIDENCE
                    </span>

                    <h3>
                      Attention Map
                    </h3>
                  </div>

                </div>

                <div className="gradcam-container">

                  <GradCAMViewer />

                </div>

              </div>


              {/* ===============================================
                  LESION INFORMATION
                  =============================================== */}

              <div className="evidence-card">

                <div className="evidence-card-header">

                  <div>
                    <span className="card-kicker">
                      DETECTED LESIONS
                    </span>

                    <h3>
                      Retinal Findings
                    </h3>
                  </div>

                </div>


                {report?.lesions ? (
                  <>
                    <div className="lesion-grid">

                      <div className="lesion-metric">

                        <div className="lesion-icon">
                          MA
                        </div>

                        <strong>
                          {report.lesions.microaneurysms ?? 0}
                        </strong>

                        <span>
                          Microaneurysms
                        </span>

                      </div>


                      <div className="lesion-metric">

                        <div className="lesion-icon">
                          HEM
                        </div>

                        <strong>
                          {report.lesions.hemorrhages ?? 0}
                        </strong>

                        <span>
                          Hemorrhages
                        </span>

                      </div>


                      <div className="lesion-metric">

                        <div className="lesion-icon">
                          EX
                        </div>

                        <strong>
                          {report.lesions.hard_exudates ?? 0}
                        </strong>

                        <span>
                          Hard Exudates
                        </span>

                      </div>


                      <div className="lesion-metric">

                        <div className="lesion-icon">
                          SE
                        </div>

                        <strong>
                          {report.lesions.soft_exudates ?? 0}
                        </strong>

                        <span>
                          Soft Exudates
                        </span>

                      </div>

                    </div>


                    <div className="finding-row">

                      <span>
                        Neovascularization
                      </span>

                      <strong>
                        {report.lesions.neovascularization
                          ? "Detected"
                          : "Not Detected"}
                      </strong>

                    </div>


                    {report.anatomy && (
                      <>
                        <div className="finding-row">

                          <span>
                            Optic Disc
                          </span>

                          <strong>
                            {report.anatomy.optic_disc_detected
                              ? "Detected"
                              : "Not Detected"}
                          </strong>

                        </div>


                        <div className="finding-row">

                          <span>
                            Fovea
                          </span>

                          <strong>
                            {report.anatomy.fovea_detected
                              ? "Detected"
                              : "Not Detected"}
                          </strong>

                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="gradcam-container">
                    Lesion information is not available yet.
                  </div>
                )}

              </div>

            </div>

          </LiquidGlass>

        </section>


        {/* =====================================================
            MODEL RELIABILITY
            ===================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                MODEL RELIABILITY
              </span>

              <h2>
                Confidence Breakdown
              </h2>
            </div>

          </div>


          <LiquidGlass
            variant="light"
            className="confidence-card"
          >

            <ConfidenceRow
              label="Image Quality"
              value={
                report?.confidence_breakdown
                  ?.image_quality ?? 0
              }
            />

            <ConfidenceRow
              label="Classification"
              value={
                report?.confidence_breakdown
                  ?.classification ?? 0
              }
            />

            <ConfidenceRow
              label="Lesion Detection"
              value={
                report?.confidence_breakdown
                  ?.lesion_detection ?? 0
              }
            />

          </LiquidGlass>

        </section>


        {/* =====================================================
            CLINICAL INTERPRETATION
            ===================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                CLINICAL INTERPRETATION
              </span>

              <h2>
                Screening Summary
              </h2>
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


        {/* =====================================================
            PIPELINE
            ===================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                PROCESSING PIPELINE
              </span>

              <h2>
                Analysis Progress
              </h2>
            </div>

          </div>


          <LiquidGlass
            variant="light"
            className="pipeline-shell"
          >

            <PipelineFlow />

          </LiquidGlass>

        </section>


        {/* =====================================================
            COMPLETION
            ===================================================== */}

        {isComplete && (
          <LiquidGlass
            variant="light"
            className="completion-card"
          >

            <div className="completion-icon">
              ✓
            </div>

            <div>

              <h2>
                Analysis Completed
              </h2>

              <p>
                The retinal image has been successfully
                processed through the complete screening
                pipeline.
              </p>

            </div>

          </LiquidGlass>
        )}

      </div>

    </main>
  );
}


/* =========================================================
   CONFIDENCE ROW COMPONENT
   ========================================================= */

function ConfidenceRow({
  label,
  value,
}) {
  const percentage =
    Math.round((value || 0) * 100);

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
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


export default Analysis;