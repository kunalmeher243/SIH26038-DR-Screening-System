import useAnalysisStore from "../store/useAnalysisStore";
import LiquidGlass from "./LiquidGlass";


function ResultDashboard() {
  const grade =
    useAnalysisStore(
      (state) => state.grade
    );

  const report =
    useAnalysisStore(
      (state) => state.report
    );

  const quality =
    useAnalysisStore(
      (state) => state.quality
    );


  if (!grade) {
    return null;
  }


  /* =========================================================
     BASIC DATA
     ========================================================= */

  const drLabel =
    grade.dr_label ||
    "Assessment unavailable";

  const drLevel =
    Number.isFinite(
      Number(grade.dr_level)
    )
      ? Number(grade.dr_level)
      : null;

  const confidence =
    grade.confidence ?? 0;

  const calibratedConfidence =
    grade.calibrated_confidence ??
    0;

  const lesions =
    report?.lesions || {};

  const imageQuality =
    quality?.quality_score ?? 0;


  /* =========================================================
     SEVERITY COLOR
     
     DR 0-1 -> GREEN
     DR 2   -> YELLOW
     DR 3-4 -> RED
     ========================================================= */

  const getSeverityClass = () => {
    if (drLevel === 0) {
      return "normal";
    }

    if (drLevel === 1) {
      return "mild";
    }

    if (drLevel === 2) {
      return "moderate";
    }

    if (
      drLevel === 3 ||
      drLevel === 4
    ) {
      return "severe";
    }

    /*
     * Fallback based on the label if
     * dr_level is unavailable.
     */
    const label =
      drLabel.toLowerCase();

    if (
      label.includes("proliferative") ||
      label.includes("severe")
    ) {
      return "severe";
    }

    if (
      label.includes("moderate")
    ) {
      return "moderate";
    }

    if (
      label.includes("mild") ||
      label.includes("normal")
    ) {
      return "normal";
    }

    return "moderate";
  };


  const severityClass =
    getSeverityClass();


  /* =========================================================
     SEVERITY LABEL
     ========================================================= */

  const severityText =
    severityClass === "normal"
      ? "Normal / Low Risk"
      : severityClass === "mild"
      ? "Mild / Low Risk"
      : severityClass === "moderate"
      ? "Moderate Risk"
      : "High Risk";


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section className="result-dashboard">

      {/* =====================================================
          MAIN ASSESSMENT CARD
          ===================================================== */}

      <LiquidGlass
        className={
          `assessment-card severity-${severityClass}`
        }
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
              AI-based retinal image
              screening result
            </p>

          </div>


          {/* =================================================
              CONFIDENCE CARD
              ================================================= */}

          <div
            className={
              `confidence-card confidence-${severityClass}`
            }
          >

            <span>
              Confidence
            </span>

            <strong>
              {Math.round(
                confidence * 100
              )}
              %
            </strong>

            <small>
              Calibrated:{" "}
              {Math.round(
                calibratedConfidence *
                  100
              )}
              %
            </small>

            <div className="confidence-severity">

              <span className="severity-dot" />

              <span>
                {severityText}
              </span>

            </div>

          </div>

        </div>

      </LiquidGlass>


      {/* =====================================================
          REFERRAL
          ===================================================== */}

      {grade.refer && (

        <LiquidGlass
          className={
            `referral-card referral-${severityClass}`
          }
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
                {
                  grade.routing ||
                  "STANDARD_REFERRAL"
                }
              </strong>
            </p>

            <p>
              Urgency:{" "}
              <strong>
                {
                  grade.referral_urgency ||
                  "standard"
                }
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
          value={`${Math.round(
            imageQuality * 100
          )}%`}
          percentage={
            imageQuality
          }
        />


        <Metric
          label="Classification"
          value={`${Math.round(
            confidence * 100
          )}%`}
          percentage={
            confidence
          }
          severityClass={
            severityClass
          }
        />


        <Metric
          label="Microaneurysms"
          value={
            lesions.microaneurysms ??
            0
          }
        />


        <Metric
          label="Hemorrhages"
          value={
            lesions.hemorrhages ??
            0
          }
        />


        <Metric
          label="Hard Exudates"
          value={
            lesions.hard_exudates ??
            0
          }
        />


        <Metric
          label="Soft Exudates"
          value={
            lesions.soft_exudates ??
            0
          }
        />

      </div>


      {/* =====================================================
          SEVERITY COLOR STYLES
          ===================================================== */}

      <style>{`

        /* ===================================================
           CONFIDENCE CARD BASE
           =================================================== */

        .confidence-card {
          position: relative;

          min-width: 136px;

          padding:
            16px 18px;

          display: flex;
          flex-direction: column;

          align-items: center;

          justify-content: center;

          border-radius:
            18px;

          border:
            1px solid
              rgba(255,255,255,0.20);

          backdrop-filter:
            blur(18px)
            saturate(150%);

          -webkit-backdrop-filter:
            blur(18px)
            saturate(150%);

          transition:
            all 220ms ease;

          overflow: hidden;
        }


        .confidence-card::before {
          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.13),
              transparent 45%
            );
        }


        .confidence-card > * {
          position: relative;

          z-index: 1;
        }


        .confidence-card > span:first-child {
          font-size:
            0.72rem;

          font-weight:
            600;

          opacity:
            0.72;

          margin-bottom:
            2px;
        }


        .confidence-card > strong {
          font-size:
            2rem;

          line-height:
            1.05;

          font-weight:
            800;

          letter-spacing:
            -0.04em;
        }


        .confidence-card > small {
          margin-top:
            5px;

          font-size:
            0.65rem;

          opacity:
            0.72;
        }


        /* ===================================================
           GREEN — NORMAL / MILD
           =================================================== */

        .confidence-normal,
        .confidence-mild {

          color:
            #16834f;

          background:
            linear-gradient(
              135deg,
              rgba(48,190,125,0.15),
              rgba(48,190,125,0.055)
            );

          border-color:
            rgba(48,190,125,0.38);

          box-shadow:
            0 10px 28px
              rgba(48,190,125,0.12),

            inset 0 1px 0
              rgba(255,255,255,0.42);
        }


        .confidence-normal > strong,
        .confidence-mild > strong {
          color:
            #15945a;
        }


        /* ===================================================
           YELLOW — MODERATE
           =================================================== */

        .confidence-moderate {

          color:
            #a16207;

          background:
            linear-gradient(
              135deg,
              rgba(245,184,48,0.18),
              rgba(245,184,48,0.055)
            );

          border-color:
            rgba(245,184,48,0.48);

          box-shadow:
            0 10px 28px
              rgba(245,184,48,0.14),

            inset 0 1px 0
              rgba(255,255,255,0.42);
        }


        .confidence-moderate > strong {
          color:
            #d18a05;
        }


        /* ===================================================
           RED — SEVERE / PROLIFERATIVE
           =================================================== */

        .confidence-severe {

          color:
            #b42318;

          background:
            linear-gradient(
              135deg,
              rgba(239,68,68,0.17),
              rgba(239,68,68,0.055)
            );

          border-color:
            rgba(239,68,68,0.48);

          box-shadow:
            0 10px 28px
              rgba(239,68,68,0.15),

            inset 0 1px 0
              rgba(255,255,255,0.40);
        }


        .confidence-severe > strong {
          color:
            #dc2626;
        }


        /* ===================================================
           SEVERITY INDICATOR
           =================================================== */

        .confidence-severity {
          display: flex;

          align-items: center;

          gap: 5px;

          margin-top:
            8px;

          padding:
            4px 8px;

          border-radius:
            999px;

          background:
            rgba(255,255,255,0.38);

          font-size:
            0.60rem;

          font-weight:
            750;
        }


        .severity-dot {
          width: 6px;
          height: 6px;

          flex:
            0 0 6px;

          border-radius:
            50%;
        }


        .confidence-normal
        .severity-dot,
        .confidence-mild
        .severity-dot {
          background:
            #20a968;

          box-shadow:
            0 0 8px
              rgba(32,169,104,0.50);
        }


        .confidence-moderate
        .severity-dot {
          background:
            #e3a20b;

          box-shadow:
            0 0 8px
              rgba(227,162,11,0.50);
        }


        .confidence-severe
        .severity-dot {
          background:
            #ef4444;

          box-shadow:
            0 0 8px
              rgba(239,68,68,0.50);
        }


        /* ===================================================
           ASSESSMENT CARD ACCENT
           =================================================== */

        .assessment-card {
          position: relative;
        }


        .assessment-card.severity-normal {
          border-color:
            rgba(48,190,125,0.22);
        }


        .assessment-card.severity-mild {
          border-color:
            rgba(48,190,125,0.22);
        }


        .assessment-card.severity-moderate {
          border-color:
            rgba(245,184,48,0.28);
        }


        .assessment-card.severity-severe {
          border-color:
            rgba(239,68,68,0.28);
        }


        /* ===================================================
           REFERRAL COLOR
           =================================================== */

        .referral-severe {
          border-color:
            rgba(239,68,68,0.42) !important;
        }


        .referral-severe
        .referral-icon {
          background:
            #ef4444 !important;

          box-shadow:
            0 7px 18px
              rgba(239,68,68,0.25);
        }


        .referral-moderate {
          border-color:
            rgba(245,184,48,0.42) !important;
        }


        .referral-moderate
        .referral-icon {
          background:
            #f4ad19 !important;

          box-shadow:
            0 7px 18px
              rgba(244,173,25,0.25);
        }


        /* ===================================================
           RESPONSIVE
           =================================================== */

        @media (max-width: 650px) {

          .confidence-card {
            min-width:
              115px;

            padding:
              13px 14px;
          }


          .confidence-card > strong {
            font-size:
              1.65rem;
          }


          .confidence-severity {
            font-size:
              0.55rem;
          }

        }

      `}</style>

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
  severityClass = null,
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

        <strong
          className={
            "metric-value " +
            (
              severityClass
                ? `metric-${severityClass}`
                : ""
            )
          }
        >
          {value}
        </strong>


        {percentage !== null && (

          <div className="metric-bar">

            <div
              className={
                "metric-bar-fill " +
                (
                  severityClass
                    ? `metric-fill-${severityClass}`
                    : ""
                )
              }
              style={{
                width: `${Math.min(
                  Math.max(
                    percentage *
                      100,
                    0
                  ),
                  100
                )}%`,
              }}
            />

          </div>

        )}

      </div>


      <style>{`

        .metric-${severityClass} {
          color:
            ${
              severityClass ===
              "severe"
                ? "#dc2626"
                : severityClass ===
                  "moderate"
                ? "#d18a05"
                : "#15945a"
            } !important;
        }


        .metric-fill-${severityClass} {
          background:
            ${
              severityClass ===
              "severe"
                ? "#ef4444"
                : severityClass ===
                  "moderate"
                ? "#e3a20b"
                : "#20a968"
            } !important;
        }

      `}</style>

    </LiquidGlass>
  );
}


export default ResultDashboard;