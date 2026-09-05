import useAnalysisStore from "../store/useAnalysisStore";

function LesionBadges() {
  const report = useAnalysisStore((state) => state.report);

  if (!report || !report.lesions) {
    return null;
  }

  const {
    microaneurysms = 0,
    hemorrhages = 0,
    hard_exudates = 0,
    soft_exudates = 0,
    neovascularization = false,
  } = report.lesions;

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Detected Lesions</h2>

          <p style={subtitleStyle}>
            Retinal abnormalities identified by the screening system
          </p>
        </div>
      </div>

      <div style={badgesGridStyle}>
        <LesionBadge
          label="Microaneurysms"
          value={microaneurysms}
          type="lesion"
        />

        <LesionBadge
          label="Hemorrhages"
          value={hemorrhages}
          type="lesion"
        />

        <LesionBadge
          label="Hard Exudates"
          value={hard_exudates}
          type="lesion"
        />

        <LesionBadge
          label="Soft Exudates"
          value={soft_exudates}
          type="lesion"
        />

        <LesionBadge
          label="Neovascularization"
          value={neovascularization ? "Detected" : "Not Detected"}
          type="status"
        />
      </div>
    </section>
  );
}


/* =========================
   Lesion Badge
========================= */

function LesionBadge({ label, value, type }) {
  const isDetected =
    type === "status"
      ? value === "Detected"
      : Number(value) > 0;

  return (
    <div
      style={{
        ...badgeStyle,
        ...(isDetected ? detectedStyle : normalStyle),
      }}
    >
      <div style={badgeTopStyle}>
        <span style={indicatorStyle}>
          {isDetected ? "●" : "○"}
        </span>

        <span style={labelStyle}>
          {label}
        </span>
      </div>

      <div style={valueStyle}>
        {value}
      </div>
    </div>
  );
}


/* =========================
   Styles
========================= */

const containerStyle = {
  marginTop: "30px",
  marginBottom: "30px",
  padding: "25px",
  background: "#ffffff",
  border: "1px solid #d9dfe7",
  borderRadius: "12px",
};

const headerStyle = {
  marginBottom: "20px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#666",
};

const badgesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
};

const badgeStyle = {
  padding: "18px",
  borderRadius: "10px",
  border: "1px solid #dfe4ea",
  background: "#fafbfc",
};

const detectedStyle = {
  borderColor: "#ef9a9a",
  background: "#fff5f5",
};

const normalStyle = {
  borderColor: "#cfd8dc",
  background: "#f8fafb",
};

const badgeTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const indicatorStyle = {
  fontSize: "12px",
};

const labelStyle = {
  fontWeight: "600",
  color: "#444",
  fontSize: "14px",
};

const valueStyle = {
  marginTop: "12px",
  fontSize: "22px",
  fontWeight: "700",
  color: "#222",
};

export default LesionBadges;