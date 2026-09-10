import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";
import LiquidGlass from "./LiquidGlass";

function PipelineFlow() {
  const { t } = useLanguageStore();

  const stage = useAnalysisStore(
    (state) => state.stage
  );

  const quality = useAnalysisStore(
    (state) => state.quality
  );

  const enhance = useAnalysisStore(
    (state) => state.enhance
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

  const stages = [
    {
      key: "quality",
      title: t("pipeQualityTitle"),
      description: t("pipeQualityDesc"),
      activeText: t("pipeQualityActive"),
    },
    {
      key: "enhance",
      title: t("pipeEnhanceTitle"),
      description: t("pipeEnhanceDesc"),
      activeText: t("pipeEnhanceActive"),
    },
    {
      key: "grade",
      title: t("pipeGradeTitle"),
      description: t("pipeGradeDesc"),
      activeText: t("pipeGradeActive"),
    },
    {
      key: "report",
      title: t("pipeReportTitle"),
      description: t("pipeReportDesc"),
      activeText: t("pipeReportActive"),
    },
  ];

  const results = {
    quality,
    enhance,
    grade,
    report,
  };

  const getStatus = (stageKey) => {
    if (stage === "error") {
      if (results[stageKey]) {
        return "completed";
      }
      return "pending";
    }

    if (stage === "done") {
      return "completed";
    }

    if (stageKey === stage) {
      return "active";
    }

    if (results[stageKey]) {
      return "completed";
    }

    return "pending";
  };

  const currentStage =
    stages.find(
      (item) => item.key === stage
    );

  return (
    <LiquidGlass
      className="pipeline-card"
      variant="light"
    >
      <div className="pipeline-inner">

        {/* =================================================
            HEADER
            ================================================= */}
        <div className="pipeline-header">
          <div>
            <span className="section-kicker">
              {t("pipeProcessingKicker")}
            </span>

            <h3>
              {stage === "done"
                ? t("analysisComplete")
                : stage === "error"
                ? t("analysisStopped")
                : currentStage
                ? currentStage.title
                : t("pipePreparing")}
            </h3>

            <p>
              {stage === "done"
                ? t("pipeCompleteDesc")
                : stage === "error"
                ? t("pipeStoppedDesc")
                : currentStage
                ? currentStage.activeText
                : t("pipePreparingDesc")}
            </p>
          </div>

          <div className="pipeline-count">
            {stage === "done"
              ? "4 / 4"
              : stage === "error"
              ? t("pipeStopped")
              : `${Math.max(
                  0,
                  stages.findIndex(
                    (item) =>
                      item.key === stage
                  ) + 1
                )} / 4`}
          </div>
        </div>

        {/* =================================================
            FOUR STAGES
            ================================================= */}
        <div className="pipeline-flow">
          {stages.map(
            (item, index) => {
              const status =
                getStatus(
                  item.key
                );

              return (
                <div
                  className="pipeline-stage-wrapper"
                  key={item.key}
                >
                  <div
                    className={`
                      pipeline-stage
                      pipeline-stage-${status}
                    `}
                  >
                    <div className="pipeline-stage-icon">
                      {status === "completed" && (
                        <span>✓</span>
                      )}

                      {status === "active" && (
                        <span className="pipeline-spinner" />
                      )}

                      {status === "pending" && (
                        <span>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="pipeline-stage-text">
                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {status === "active"
                          ? item.activeText
                          : status === "completed"
                          ? t("stageStatusCompleted")
                          : item.description}
                      </span>
                    </div>
                  </div>

                  {index <
                    stages.length - 1 && (
                    <div
                      className={`
                        pipeline-connector
                        ${
                          status ===
                          "completed"
                            ? "pipeline-connector-completed"
                            : ""
                        }
                      `}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* =================================================
            IMAGE QUALITY RESULT
            ================================================= */}
        {quality && (
          <div className="pipeline-quality-result">
            <div>
              <span className="section-kicker">
                {t("pipeQualityTitle")}
              </span>

              <strong>
                {quality.quality_label ||
                  t("qualityAssessed")}
              </strong>

              {quality.recommendation && (
                <p>
                  {quality.recommendation}
                </p>
              )}
            </div>

            {typeof quality.quality_score ===
              "number" && (
              <div className="pipeline-quality-score">
                <span>
                  {t("qualityScoreLabel")}
                </span>

                <strong>
                  {Math.round(
                    quality.quality_score * 100
                  )}
                  %
                </strong>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            SUCCESS
            ================================================= */}
        {stage === "done" && (
          <div className="pipeline-success">
            <div className="pipeline-success-icon">
              ✓
            </div>

            <div>
              <strong>
                {t("analysisComplete")}
              </strong>

              <p>
                {t("pipeSuccessDesc")}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            ERROR
            ================================================= */}
        {stage === "error" && (
          <div className="pipeline-error">
            <div className="pipeline-error-icon">
              !
            </div>

            <div>
              <strong>
                {t("analysisStopped")}
              </strong>

              <p>
                {typeof error === "string"
                  ? error
                  : error?.message ||
                    t("serviceUnavailableHelp")}
              </p>
            </div>
          </div>
        )}

      </div>
    </LiquidGlass>
  );
}

export default PipelineFlow;