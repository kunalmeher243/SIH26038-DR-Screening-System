import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileImage,
  RefreshCw,
  Stethoscope,
} from "lucide-react";

import useAnalysisStore from "../../store/useAnalysisStore";
import ResultDashboard from "../ResultDashboard";
import GradCAMViewer from "../GradCAMViewer";
import ClinicalReport from "../ClinicalReport";
import PipelineFlow from "../PipelineFlow";
import LiquidGlass from "../LiquidGlass";

const ACTIVE_STAGES = ["quality", "enhance", "grade", "report"];

const DECISIONS = [
  {
    id: "routine",
    label: "Routine Follow-up",
    description: "No urgent escalation from the reviewed case.",
  },
  {
    id: "consultation",
    label: "Ophthalmologist Consultation",
    description: "Continue specialist consultation or follow-up.",
  },
  {
    id: "priority",
    label: "Priority Referral",
    description: "Escalate the patient for timely specialist care.",
  },
  {
    id: "repeat",
    label: "Repeat Image",
    description: "Request another image because the current evidence is insufficient.",
  },
];

export default function DoctorDashboard() {
  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const stage = useAnalysisStore((state) => state.stage);
  const quality = useAnalysisStore((state) => state.quality);
  const grade = useAnalysisStore((state) => state.grade);
  const report = useAnalysisStore((state) => state.report);
  const error = useAnalysisStore((state) => state.error);
  const reset = useAnalysisStore((state) => state.reset);

  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState("");

  const caseId = useMemo(() => {
    if (!file) return null;

    const suffix = String(file.lastModified || Date.now())
      .slice(-6)
      .padStart(6, "0");

    return `DR-${new Date().getFullYear()}-${suffix}`;
  }, [file]);

  const isProcessing = ACTIVE_STAGES.includes(stage);
  const hasReviewableCase =
    Boolean(file) && Boolean(grade || report) && (stage === "done" || stage === "error");

  if (!file) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="Doctor Review Dashboard"
            description="Review screening cases created by the PHC workflow. AI findings are decision-support evidence; the final clinical decision remains with the reviewing ophthalmologist."
          />

          <LiquidGlass variant="light" className="saas-card">
            <EmptyState
              title="No case is currently available"
              description="A PHC worker must complete a retinal screening case before it appears in this local review workspace."
            />
          </LiquidGlass>
        </div>
      </main>
    );
  }

  if (isProcessing) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="Screening Case Processing"
            description="The current case is still being processed. Detailed AI findings will be available after screening completes."
          />

          <LiquidGlass variant="light" className="saas-card">
            <div style={statusHeaderStyle}>
              <div style={iconBoxStyle}>
                <RefreshCw size={22} />
              </div>
              <div>
                <span style={kickerStyle}>Case {caseId}</span>
                <h2 style={titleStyle}>AI screening in progress</h2>
                <p style={mutedStyle}>
                  {file.name} • {eye ? `${eye} eye` : "Laterality pending"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "22px" }}>
              <PipelineFlow />
            </div>
          </LiquidGlass>
        </div>
      </main>
    );
  }

  if (!hasReviewableCase) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="Doctor Review Dashboard"
            description="The current case does not yet contain a reviewable AI result."
          />

          <LiquidGlass variant="light" className="saas-card">
            <EmptyState
              title="Case awaiting screening output"
              description="Complete the PHC screening workflow first."
            />
          </LiquidGlass>
        </div>
      </main>
    );
  }

  const humanReviewRequired =
    error?.type === "human_review" ||
    grade?.routing === "HUMAN_REVIEW";

  const isDecisionSaved = Boolean(decision);

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Header
          title="Doctor Review Dashboard"
          description="This workspace exposes the AI assessment, image evidence, and screening report for clinical review."
        />

        <LiquidGlass variant="light" className="saas-card">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={statusHeaderStyle}>
              <div style={iconBoxStyle}>
                <Stethoscope size={23} />
              </div>

              <div>
                <span style={kickerStyle}>Case ID</span>
                <h2 style={titleStyle}>{caseId}</h2>
                <p style={mutedStyle}>
                  {file.name} • {eye ? `${eye} eye` : "Laterality unavailable"}
                </p>
              </div>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 10px",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 750,
                color: humanReviewRequired ? "#B45309" : "#0369A1",
                background: humanReviewRequired ? "#FFFBEB" : "#F0F9FF",
                border: humanReviewRequired
                  ? "1px solid #FDE68A"
                  : "1px solid #BAE6FD",
              }}
            >
              {humanReviewRequired ? (
                <AlertTriangle size={14} />
              ) : (
                <ClipboardList size={14} />
              )}
              {humanReviewRequired
                ? "Human review required"
                : "Awaiting doctor decision"}
            </span>
          </div>

          <div style={summaryGridStyle}>
            <SummaryItem
              label="Image quality"
              value={quality?.quality_label || "—"}
            />
            <SummaryItem
              label="AI grade"
              value={grade?.dr_label || grade?.dr_level || "—"}
            />
            <SummaryItem
              label="AI confidence"
              value={
                typeof grade?.confidence === "number"
                  ? `${Math.round(grade.confidence * 100)}%`
                  : "—"
              }
            />
            <SummaryItem
              label="Referral signal"
              value={
                grade?.refer === true
                  ? "AI indicates referral"
                  : grade?.refer === false
                  ? "No AI referral signal"
                  : "—"
              }
            />
          </div>
        </LiquidGlass>

        <section style={sectionStyle}>
          <SectionHeading
            kicker="AI assessment"
            title="Screening Evidence"
            description="Detailed AI output is shown here for the ophthalmologist. It is not a substitute for clinical judgment."
          />

          <ResultDashboard />
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            kicker="Explainability"
            title="Image Evidence"
            description="Review available Grad-CAM and lesion evidence associated with the screening result."
          />

          <GradCAMViewer />
        </section>

        <section style={sectionStyle}>
          <ClinicalReport
            file={file}
            eye={eye}
            quality={quality}
            grade={grade}
            report={report}
          />
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            kicker="Clinical decision"
            title="Doctor Decision"
            description="Record the action to be taken after reviewing the case."
          />

          <LiquidGlass variant="light" className="saas-card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              {DECISIONS.map((item) => {
                const active = decision === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDecision(item.id)}
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      borderRadius: "12px",
                      border: active
                        ? "1.5px solid var(--saas-accent)"
                        : "1px solid var(--saas-border)",
                      background: active
                        ? "rgba(0, 82, 255, 0.06)"
                        : "#FFFFFF",
                      cursor: "pointer",
                      color: "var(--saas-fg)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 800,
                        fontSize: "0.86rem",
                      }}
                    >
                      {active && <CheckCircle2 size={16} />}
                      {item.label}
                    </div>

                    <p
                      style={{
                        margin: "7px 0 0",
                        fontSize: "0.76rem",
                        lineHeight: 1.45,
                        color: "var(--saas-fg-muted)",
                      }}
                    >
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <label
              style={{
                display: "block",
                marginTop: "18px",
                marginBottom: "7px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
              }}
            >
              Doctor notes
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Add clinical observations or follow-up instructions..."
              style={textareaStyle}
            />

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span style={mutedStyle}>
                {isDecisionSaved
                  ? `Selected action: ${
                      DECISIONS.find((item) => item.id === decision)?.label
                    }`
                  : "Select a clinical action before completing review."}
              </span>

              <button
                type="button"
                className="saas-btn-primary"
                disabled={!decision}
                onClick={() => {
                  // Local prototype state only. Backend case persistence will be added
                  // when the case/review API is connected.
                  window.dispatchEvent(
                    new CustomEvent("serix:doctor-decision", {
                      detail: {
                        caseId,
                        decision,
                        notes,
                      },
                    })
                  );
                }}
                style={{ opacity: decision ? 1 : 0.55 }}
              >
                <CheckCircle2 size={16} />
                Record Review Decision
              </button>
            </div>
          </LiquidGlass>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ ...mutedStyle, maxWidth: "720px" }}>
            <strong style={{ color: "var(--saas-fg)" }}>
              Clinical safety boundary:
            </strong>{" "}
            the displayed AI classification and confidence are decision-support
            outputs. They should not be presented as the final diagnosis.
          </div>

          <button
            type="button"
            className="saas-btn-primary"
            onClick={reset}
          >
            <FileImage size={16} />
            Open Next Case
          </button>
        </div>
      </div>
    </main>
  );
}

function Header({ title, description }) {
  return (
    <header style={{ marginBottom: "24px" }}>
      <span style={kickerStyle}>SERIX OPHTHALMOLOGY WORKFLOW</span>
      <h1
        style={{
          margin: "5px 0 7px",
          fontSize: "clamp(1.7rem, 3vw, 2.25rem)",
          fontWeight: 850,
          letterSpacing: "-0.035em",
          color: "var(--saas-fg)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          maxWidth: "840px",
          margin: 0,
          color: "var(--saas-fg-muted)",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </header>
  );
}

function SectionHeading({ kicker, title, description }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <span style={kickerStyle}>{kicker}</span>
      <h2
        style={{
          margin: "5px 0 5px",
          fontSize: "1.3rem",
          fontWeight: 820,
          color: "var(--saas-fg)",
        }}
      >
        {title}
      </h2>
      <p style={mutedStyle}>{description}</p>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div
      style={{
        padding: "13px 14px",
        borderRadius: "10px",
        border: "1px solid var(--saas-border)",
        background: "#FFFFFF",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "0.7rem",
          fontWeight: 750,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--saas-fg-muted)",
        }}
      >
        {label}
      </span>
      <strong
        style={{
          display: "block",
          fontSize: "0.88rem",
          color: "var(--saas-fg)",
        }}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div
      style={{
        padding: "46px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "54px",
          height: "54px",
          margin: "0 auto 14px",
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 82, 255, 0.08)",
          color: "var(--saas-accent)",
        }}
      >
        <Eye size={25} />
      </div>
      <h2 style={titleStyle}>{title}</h2>
      <p
        style={{
          ...mutedStyle,
          maxWidth: "560px",
          margin: "0 auto",
        }}
      >
        {description}
      </p>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 150px)",
  padding: "38px 24px 56px",
  background: "#FAFAFA",
};

const containerStyle = {
  width: "min(1280px, 100%)",
  margin: "0 auto",
};

const sectionStyle = {
  marginTop: "30px",
};

const statusHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
};

const iconBoxStyle = {
  width: "48px",
  height: "48px",
  flex: "0 0 48px",
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--saas-accent)",
  background: "rgba(0, 82, 255, 0.08)",
};

const kickerStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--saas-accent)",
};

const titleStyle = {
  margin: "4px 0 4px",
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "var(--saas-fg)",
};

const mutedStyle = {
  margin: 0,
  fontSize: "0.84rem",
  lineHeight: 1.5,
  color: "var(--saas-fg-muted)",
};

const summaryGridStyle = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  resize: "vertical",
  borderRadius: "10px",
  border: "1px solid var(--saas-border)",
  background: "#FFFFFF",
  color: "var(--saas-fg)",
  fontFamily: "inherit",
  fontSize: "0.86rem",
  outline: "none",
};
