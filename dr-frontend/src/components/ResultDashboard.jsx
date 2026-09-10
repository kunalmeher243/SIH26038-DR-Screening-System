import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";
import LiquidGlass from "./LiquidGlass";

function ResultDashboard() {
  const { t } = useLanguageStore();
  const grade = useAnalysisStore((state) => state.grade);
  const report = useAnalysisStore((state) => state.report);
  const quality = useAnalysisStore((state) => state.quality);

  if (!grade) {
    return null;
  }

  const drLabel = grade.dr_label || t("screeningResultTitle");

  const confidence = grade.confidence ?? 0;

  const calibratedConfidence =
    grade.calibrated_confidence ?? 0;

  const lesions = report?.lesions || {};

  const imageQuality =
    quality?.quality_score ?? 0;

  return (
    <section className="result-dashboard">

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
              {t("finalAssessment")}
            </span>

            <h1>
              {drLabel}
            </h1>

            <p>
              {t("aiScreeningResult")}
            </p>
          </div>

          {/* Confidence */}
          <div className="confidence-card">
            <span>
              {t("confidenceLabel")}
            </span>

            <strong>
              {Math.round(confidence * 100)}%
            </strong>

            <small>
              {t("calibratedLabel")}{" "}
              {Math.round(
                calibratedConfidence * 100
              )}
              %
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
              {t("referralRecommended")}
            </span>

            <p>
              {t("routingLabel")}{" "}
              <strong>
                {grade.routing || "STANDARD_REFERRAL"}
              </strong>
            </p>

            <p>
              {t("urgencyLabel")}{" "}
              <strong>
                {grade.referral_urgency || "standard"}
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
          label={t("imageQualityStage")}
          value={`${Math.round(
            imageQuality * 100
          )}%`}
          percentage={imageQuality}
        />

        <Metric
          label={t("classificationStage")}
          value={`${Math.round(
            confidence * 100
          )}%`}
          percentage={confidence}
        />

        <Metric
          label={t("microaneurysmsLabel")}
          value={lesions.microaneurysms ?? 0}
        />

        <Metric
          label={t("hemorrhagesLabel")}
          value={lesions.hemorrhages ?? 0}
        />

        <Metric
          label={t("hardExudatesLabel")}
          value={lesions.hard_exudates ?? 0}
        />

        <Metric
          label={t("softExudatesLabel")}
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
  percentage = null,
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

        {percentage !== null && (
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(
                  Math.max(percentage * 100, 0),
                  100
                )}%`,
              }}
            />
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

export default ResultDashboard;