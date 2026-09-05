import useAnalysisStore from "../store/useAnalysisStore";

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
    // Completed
    if (results[stageKey] !== null) {
      return "completed";
    }

    // Currently running
    if (stage === stageKey) {
      return "active";
    }

    // Waiting
    return "pending";
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Analysis Progress</h2>

        <p style={subtitleStyle}>
          Retinal image screening pipeline
        </p>
      </div>

      <div style={flowStyle}>
        {stages.map((item, index) => {
          const status = getStatus(item.key);

          return (
            <div
              key={item.key}
              style={stageWrapperStyle}
            >
              <div
                style={{
                  ...stageCardStyle,
                  ...(status === "completed"
                    ? completedStyle
                    : {}),
                  ...(status === "active"
                    ? activeStyle
                    : {}),
                }}
              >
                <div
                  style={{
                    ...iconStyle,
                    ...(status === "completed"
                      ? completedIconStyle
                      : {}),
                    ...(status === "active"
                      ? activeIconStyle
                      : {}),
                  }}
                >
                  {status === "completed" && "✓"}

                  {status === "active" && (
                    <span className="pipeline-spinner">
                      ↻
                    </span>
                  )}

                  {status === "pending" && index + 1}
                </div>

                <div style={textStyle}>
                  <strong style={stageTitleStyle}>
                    {item.title}
                  </strong>

                  <span style={stageDescriptionStyle}>
                    {status === "completed"
                      ? "Completed"
                      : status === "active"
                      ? item.description + "..."
                      : "Waiting"}
                  </span>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div
                  style={{
                    ...connectorStyle,
                    ...(status === "completed"
                      ? connectorCompletedStyle
                      : {}),
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stage === "done" && (
        <div style={successStyle}>
          <span style={successIconStyle}>✓</span>

          <div>
            <strong>Analysis Completed</strong>

            <p style={{ margin: "4px 0 0" }}>
              All screening stages have been successfully
              processed.
            </p>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div style={errorStyle}>
          <strong>Analysis stopped</strong>

          <p style={{ margin: "4px 0 0" }}>
            An error occurred during the screening pipeline.
          </p>
        </div>
      )}
    </div>
  );
}


// ================================
// Styles
// ================================

const containerStyle = {
  marginTop: "35px",
  marginBottom: "35px",
  padding: "25px",
  background: "#ffffff",
  border: "1px solid #d9e1e8",
  borderRadius: "12px",
};

const headerStyle = {
  marginBottom: "25px",
};

const titleStyle = {
  margin: 0,
  fontSize: "24px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
};

const flowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const stageWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flex: "1 1 220px",
};

const stageCardStyle = {
  width: "100%",
  minHeight: "80px",
  padding: "15px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  border: "1px solid #d9e1e8",
  borderRadius: "10px",
  background: "#f8fafc",
  boxSizing: "border-box",
};

const completedStyle = {
  background: "#ecfdf3",
  border: "1px solid #86efac",
};

const activeStyle = {
  background: "#fff8e1",
  border: "2px solid #f59e0b",
  boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.12)",
};

const iconStyle = {
  width: "38px",
  height: "38px",
  minWidth: "38px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e5e7eb",
  color: "#374151",
  fontWeight: "bold",
  fontSize: "18px",
};

const completedIconStyle = {
  background: "#22c55e",
  color: "#ffffff",
};

const activeIconStyle = {
  background: "#f59e0b",
  color: "#ffffff",
};

const textStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const stageTitleStyle = {
  fontSize: "16px",
};

const stageDescriptionStyle = {
  fontSize: "13px",
  color: "#6b7280",
};

const connectorStyle = {
  fontSize: "25px",
  color: "#9ca3af",
  fontWeight: "bold",
};

const connectorCompletedStyle = {
  color: "#22c55e",
};

const successStyle = {
  marginTop: "20px",
  padding: "15px 18px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#ecfdf3",
  border: "1px solid #86efac",
  borderRadius: "10px",
  color: "#166534",
};

const successIconStyle = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  background: "#22c55e",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const errorStyle = {
  marginTop: "20px",
  padding: "15px 18px",
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  borderRadius: "10px",
  color: "#991b1b",
};

export default PipelineFlow;