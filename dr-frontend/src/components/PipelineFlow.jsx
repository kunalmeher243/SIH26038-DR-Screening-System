import useAnalysisStore from "../store/useAnalysisStore";
import LiquidGlass from "./LiquidGlass";

const stages = [
  {
    key: "quality",
    title: "Image Quality",
    description: "Checking image quality",
  },
  {
    key: "enhance",
    title: "Enhancement",
    description: "Enhancing retinal image",
  },
  {
    key: "grade",
    title: "DR Grading",
    description: "Assessing diabetic retinopathy",
  },
  {
    key: "report",
    title: "Report",
    description: "Generating screening report",
  },
];

function PipelineFlow() {
  const stage = useAnalysisStore((state) => state.stage);
  const quality = useAnalysisStore((state) => state.quality);
  const enhance = useAnalysisStore((state) => state.enhance);
  const grade = useAnalysisStore((state) => state.grade);
  const report = useAnalysisStore((state) => state.report);

  const results = {
    quality,
    enhance,
    grade,
    report,
  };

  const getStatus = (stageKey) => {
    if (results[stageKey] !== null) {
      return "completed";
    }

    if (stage === stageKey) {
      return "active";
    }

    return "pending";
  };

  return (
    <LiquidGlass className="pipeline-card">
      <div className="pipeline-inner">

        {/* Pipeline stages */}
        <div className="pipeline-flow">
          {stages.map((item, index) => {
            const status = getStatus(item.key);

            return (
              <div className="pipeline-stage-wrapper" key={item.key}>

                <div
                  className={`pipeline-stage pipeline-stage-${status}`}
                >
                  <div className="pipeline-stage-icon">
                    {status === "completed" && "✓"}

                    {status === "active" && (
                      <span className="pipeline-spinner">
                        ↻
                      </span>
                    )}

                    {status === "pending" && index + 1}
                  </div>

                  <div className="pipeline-stage-text">
                    <strong>{item.title}</strong>

                    <span>
                      {status === "completed"
                        ? "Completed"
                        : status === "active"
                        ? `${item.description}...`
                        : "Waiting"}
                    </span>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <div
                    className={`pipeline-connector ${
                      status === "completed"
                        ? "pipeline-connector-completed"
                        : ""
                    }`}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Success state */}
        {stage === "done" && (
          <div className="pipeline-success">
            <div className="pipeline-success-icon">
              ✓
            </div>

            <div>
              <strong>Analysis Completed</strong>

              <p>
                All screening stages have been successfully
                processed.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {stage === "error" && (
          <div className="pipeline-error">
            <strong>Analysis stopped</strong>

            <p>
              An error occurred during the screening pipeline.
            </p>
          </div>
        )}

      </div>
    </LiquidGlass>
  );
}

export default PipelineFlow;