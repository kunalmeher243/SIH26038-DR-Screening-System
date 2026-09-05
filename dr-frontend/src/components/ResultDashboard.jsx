import useAnalysisStore from "../store/useAnalysisStore";
import LiquidGlass from "./LiquidGlass";

function ResultDashboard() {
  const grade = useAnalysisStore((state) => state.grade);
  const report = useAnalysisStore((state) => state.report);
  const quality = useAnalysisStore((state) => state.quality);

  if (!grade) {
    return null;
  }

  const drLevel = grade.dr_level;
  const drLabel = grade.dr_label;
  const confidence = grade.confidence ?? 0;
  const calibratedConfidence = grade.calibrated_confidence ?? 0;

  const lesions = report?.lesions || {};

  return (
    <section className="result-dashboard">

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <div className="section-heading">
        <div>
          <span className="eyebrow">
            PRIMARY ASSESSMENT
          </span>

          <h2>
            Screening Result
          </h2>

          <p>
            Automated diabetic retinopathy assessment
          </p>
        </div>

        <div className="dr-level-badge">
          DR LEVEL {drLevel}
        </div>
      </div>


      {/* =====================================================
          MAIN ASSESSMENT CARD
      ===================================================== */}

      <LiquidGlass
        className="assessment-card"
        variant="strong"
      >

        <div className="assessment-content">

          <div className="assessment-text">

            <span className="assessment-label">
              FINAL ASSESSMENT
            </span>

            <h1>
              {drLabel}
            </h1>

            <p>
              AI-based retinal image screening result
            </p>

          </div>


          {/* Confidence */}

          <div className="confidence-card">

            <span>
              Confidence
            </span>

            <strong>
              {Math.round(confidence * 100)}%
            </strong>

            <small>
              Calibrated:{" "}
              {Math.round(calibratedConfidence * 100)}%
            </small>

          </div>

        </div>

      </LiquidGlass>


      {/* =====================================================
          REFERRAL
      ===================================================== */}

      {grade.refer && (
        <LiquidGlass
          className="referral-card"
          variant="light"
        >

          <div className="referral-icon">
            !
          </div>

          <div className="referral-content">

            <span className="referral-title">
              Referral Recommended
            </span>

            <p>
              Routing:{" "}
              <strong>
                {grade.routing}
              </strong>
            </p>

            <p>
              Urgency:{" "}
              <strong>
                {grade.referral_urgency}
              </strong>
            </p>

          </div>

        </LiquidGlass>
      )}


      {/* =====================================================
          KEY METRICS
      ===================================================== */}

      <div className="metrics-grid">

        <Metric
          label="Image Quality"
          value={
            quality
              ? `${Math.round(
                  quality.quality_score * 100
                )}%`
              : "N/A"
          }
          type="percentage"
        />

        <Metric
          label="Classification"
          value={`${Math.round(
            confidence * 100
          )}%`}
          type="percentage"
        />

        <Metric
          label="Microaneurysms"
          value={lesions.microaneurysms ?? 0}
        />

        <Metric
          label="Hemorrhages"
          value={lesions.hemorrhages ?? 0}
        />

        <Metric
          label="Hard Exudates"
          value={lesions.hard_exudates ?? 0}
        />

        <Metric
          label="Soft Exudates"
          value={lesions.soft_exudates ?? 0}
        />

      </div>

    </section>
  );
}


/* =========================================================
   METRIC COMPONENT
   ========================================================= */

function Metric({
  label,
  value,
  type = "number",
}) {
  return (
    <LiquidGlass
      className="metric-card"
      variant="light"
      hover
    >

      <div className="metric-inner">

        <span className="metric-label">
          {label}
        </span>

        <strong className="metric-value">
          {value}
        </strong>

        {type === "percentage" && (
          <div className="metric-bar">

            <div
              className="metric-bar-fill"
              style={{
                width: value,
              }}
            />

          </div>
        )}

      </div>

    </LiquidGlass>
  );
}


export default ResultDashboard;