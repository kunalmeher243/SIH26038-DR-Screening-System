import useAnalysisStore from "../store/useAnalysisStore";

function ReportPanel() {
  const report = useAnalysisStore((state) => state.report);
  const grade = useAnalysisStore((state) => state.grade);

  if (!report) {
    return null;
  }

  const confidence = report.confidence_breakdown || {};
  const summary = report.clinical_summary;
  const evidence = report.evidence_statement;

  return (
    <section style={containerStyle}>
      {/* Header */}

      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>
            Clinical Screening Summary
          </h2>

          <p style={subtitleStyle}>
            AI-generated screening interpretation and supporting evidence
          </p>
        </div>
      </div>

      {/* Clinical Summary */}

      <div style={summaryCardStyle}>
        <div style={sectionLabelStyle}>
          Clinical Summary
        </div>

        <p style={summaryTextStyle}>
          {summary || "No clinical summary available."}
        </p>
      </div>

      {/* Evidence */}

      <div style={evidenceCardStyle}>
        <div style={sectionLabelStyle}>
          Supporting Evidence
        </div>

        <p style={evidenceTextStyle}>
          {evidence || "No evidence statement available."}
        </p>
      </div>

      {/* Confidence */}

      <div style={confidenceSectionStyle}>
        <div style={sectionLabelStyle}>
          Confidence Breakdown
        </div>

        <div style={confidenceGridStyle}>
          <ConfidenceCard
            label="Image Quality"
            value={confidence.image_quality}
          />

          <ConfidenceCard
            label="Classification"
            value={confidence.classification}
          />

          <ConfidenceCard
            label="Lesion Detection"
            value={confidence.lesion_detection}
          />
        </div>
      </div>

      {/* Referral */}

      {grade && (
        <div style={referralCardStyle}>
          <div>
            <div style={sectionLabelStyle}>
              Referral Recommendation
            </div>

            <h3 style={{ margin: "8px 0" }}>
              {grade.routing || "No routing information"}
            </h3>

            <p style={{ margin: 0, color: "#666" }}>
              Urgency:{" "}
              {grade.referral_urgency || "Not specified"}
            </p>
          </div>

          <div style={referralBadgeStyle}>
            {grade.refer ? "REFER" : "NO REFERRAL"}
          </div>
        </div>
      )}

      {/* Generated Time */}

      {report.generated_at && (
        <p style={timestampStyle}>
          Report generated:{" "}
          {new Date(report.generated_at).toLocaleString()}
        </p>
      )}
    </section>
  );
}


/* =========================
   Confidence Card
========================= */

function ConfidenceCard({ label, value }) {
  const percentage =
    typeof value === "number"
      ? Math.round(value * 100)
      : 0;

  return (
    <div style={confidenceCardStyle}>
      <div style={confidenceLabelStyle}>
        {label}
      </div>

      <div style={confidenceValueStyle}>
        {percentage}%
      </div>

      <div style={progressBackgroundStyle}>
        <div
          style={{
            ...progressStyle,
            width: `${percentage}%`,
          }}
        />
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
  marginBottom: "22px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#666",
};

const sectionLabelStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#555",
  marginBottom: "8px",
};

const summaryCardStyle = {
  padding: "20px",
  background: "#f8fbff",
  border: "1px solid #d6e7f7",
  borderRadius: "10px",
  marginBottom: "15px",
};

const summaryTextStyle = {
  margin: 0,
  fontSize: "17px",
  lineHeight: "1.6",
  color: "#222",
};

const evidenceCardStyle = {
  padding: "20px",
  background: "#fafafa",
  border: "1px solid #e0e4e8",
  borderRadius: "10px",
  marginBottom: "20px",
};

const evidenceTextStyle = {
  margin: 0,
  lineHeight: "1.6",
  color: "#444",
};

const confidenceSectionStyle = {
  marginBottom: "20px",
};

const confidenceGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "15px",
};

const confidenceCardStyle = {
  padding: "18px",
  background: "#fafbfc",
  border: "1px solid #e0e4e8",
  borderRadius: "10px",
};

const confidenceLabelStyle = {
  fontSize: "14px",
  color: "#666",
};

const confidenceValueStyle = {
  marginTop: "8px",
  marginBottom: "10px",
  fontSize: "24px",
  fontWeight: "700",
};

const progressBackgroundStyle = {
  width: "100%",
  height: "7px",
  background: "#e5e7eb",
  borderRadius: "10px",
  overflow: "hidden",
};

const progressStyle = {
  height: "100%",
  background: "#1976d2",
  borderRadius: "10px",
};

const referralCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  padding: "20px",
  background: "#fff8e1",
  border: "1px solid #ffe082",
  borderRadius: "10px",
};

const referralBadgeStyle = {
  padding: "10px 16px",
  borderRadius: "20px",
  background: "#ffecb3",
  fontWeight: "700",
  fontSize: "13px",
};

const timestampStyle = {
  margin: "15px 0 0",
  fontSize: "12px",
  color: "#888",
};

export default ReportPanel;