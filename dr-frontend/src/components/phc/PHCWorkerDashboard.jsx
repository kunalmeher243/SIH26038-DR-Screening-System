import { useEffect, useMemo } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

import useAnalysisStore from "../../store/useAnalysisStore";
import Upload from "../../pages/Upload";
import PipelineFlow from "../PipelineFlow";
import LiquidGlass from "../LiquidGlass";

/*
 * =========================================================
 * PHC SCREENING STAGES
 * =========================================================
 */

const ACTIVE_STAGES = [
  "quality",
  "enhance",
  "grade",
  "report",
];

/*
 * =========================================================
 * LOCAL CASE STORAGE
 *
 * Development/mock persistence only.
 * This will later be replaced by the backend case API.
 * =========================================================
 */

const CASE_STORAGE_KEY = "retinatrack_cases";

/*
 * =========================================================
 * PHC WORKER DASHBOARD
 * =========================================================
 */

export default function PHCWorkerDashboard() {
  const file = useAnalysisStore(
    (state) => state.file
  );

  const eye = useAnalysisStore(
    (state) => state.eye
  );

  const stage = useAnalysisStore(
    (state) => state.stage
  );

  const quality = useAnalysisStore(
    (state) => state.quality
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

  const reset = useAnalysisStore(
    (state) => state.reset
  );

  /*
   * =======================================================
   * CASE ID
   * =======================================================
   */

  const caseId = useMemo(() => {
    if (!file) {
      return null;
    }

    const suffix = String(
      file.lastModified || Date.now()
    )
      .slice(-6)
      .padStart(6, "0");

    return `DR-${new Date().getFullYear()}-${suffix}`;
  }, [file]);

  /*
   * =======================================================
   * SCREENING STATE
   * =======================================================
   */

  const isProcessing =
    ACTIVE_STAGES.includes(stage);

  const isComplete =
    stage === "done";

  const isError =
    stage === "error";

  /*
   * =======================================================
   * CREATE DOCTOR-REVIEW CASE
   *
   * The PHC worker does not see the AI clinical result.
   * The result is stored internally so the Doctor Dashboard
   * can consume it later.
   * =======================================================
   */

  useEffect(() => {
    if (!isComplete || !file || !caseId) {
      return;
    }

    try {
      const rawCases =
        localStorage.getItem(
          CASE_STORAGE_KEY
        );

      const existingCases = rawCases
        ? JSON.parse(rawCases)
        : [];

      const safeCases = Array.isArray(
        existingCases
      )
        ? existingCases
        : [];

      const caseRecord = {
        case_id: caseId,

        status:
          "AWAITING_DOCTOR_REVIEW",

        created_at:
          new Date().toISOString(),

        patient: {
          status:
            "pending_patient_link",
        },

        screening: {
          eye:
            eye || null,

          image_quality:
            quality?.quality_label ||
            quality?.quality ||
            "Good",

          quality_score:
            quality?.score ??
            quality?.quality_score ??
            null,

          file_name:
            file.name,

          file_size:
            file.size ?? null,

          file_type:
            file.type || null,
        },

        /*
         * AI data is intentionally kept inside the
         * internal case record and is NOT rendered
         * on the PHC worker completion screen.
         */
        ai_assessment: {
          grade:
            grade || null,

          report:
            report || null,
        },

        clinical_review: {
          status:
            "PENDING",

          reviewed_by:
            null,

          reviewed_at:
            null,

          decision:
            null,

          notes:
            null,
        },
      };

      const caseIndex =
        safeCases.findIndex(
          (item) =>
            item?.case_id === caseId
        );

      if (caseIndex >= 0) {
        safeCases[caseIndex] = {
          ...safeCases[caseIndex],
          ...caseRecord,
        };
      } else {
        safeCases.unshift(
          caseRecord
        );
      }

      localStorage.setItem(
        CASE_STORAGE_KEY,
        JSON.stringify(safeCases)
      );
    } catch (storageError) {
      console.error(
        "Failed to create screening case:",
        storageError
      );
    }
  }, [
    isComplete,
    file,
    caseId,
    eye,
    quality,
    grade,
    report,
  ]);

  /*
   * =======================================================
   * INITIAL STATE
   * =======================================================
   */

  if (!file || stage === "idle") {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="PHC Screening Workspace"
            description="Capture or upload a retinal fundus image. SERIX will run image-quality checks and AI-assisted screening before creating a case for ophthalmologist review."
          />

          <Upload />
        </div>
      </main>
    );
  }

  /*
   * =======================================================
   * PROCESSING
   * =======================================================
   */

  if (isProcessing) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="Screening in Progress"
            description="The image is being processed. The PHC workflow will create a review case when screening is complete."
          />

          <LiquidGlass
            variant="light"
            className="saas-card"
          >
            <div style={statusHeaderStyle}>
              <div style={iconBoxStyle}>
                <ShieldCheck
                  size={24}
                />
              </div>

              <div>
                <span
                  style={kickerStyle}
                >
                  Automated screening
                </span>

                <h2
                  style={titleStyle}
                >
                  Processing retinal image
                </h2>

                <p
                  style={mutedStyle}
                >
                  {file.name} •{" "}
                  {eye
                    ? `${eye} eye`
                    : "Laterality pending"}
                </p>
              </div>
            </div>

            <PipelineFlow />
          </LiquidGlass>
        </div>
      </main>
    );
  }

  /*
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (isError) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Header
            title="Screening Could Not Be Completed"
            description="Resolve the image-quality or service issue and submit the case again."
          />

          <LiquidGlass
            variant="light"
            className="saas-card"
          >
            <div style={statusHeaderStyle}>
              <div
                style={{
                  ...iconBoxStyle,
                  color: "#DC2626",
                  background: "#FEF2F2",
                }}
              >
                <ClipboardCheck
                  size={24}
                />
              </div>

              <div>
                <span
                  style={kickerStyle}
                >
                  Case not created
                </span>

                <h2
                  style={titleStyle}
                >
                  {error?.type ===
                    "ungradable"
                    ? "Repeat image capture"
                    : "Screening service issue"}
                </h2>

                <p
                  style={mutedStyle}
                >
                  {error?.message ||
                    "Please try the screening again."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="saas-btn-primary"
              onClick={reset}
              style={{
                marginTop: "22px",
              }}
            >
              <UploadCloud
                size={16}
              />

              Start New Screening
            </button>
          </LiquidGlass>
        </div>
      </main>
    );
  }

  /*
   * =======================================================
   * SCREENING COMPLETED
   * =======================================================
   */

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Header
          title="Screening Completed"
          description="The screening case has been created for ophthalmologist review. The PHC workflow does not treat the AI result as the final clinical decision."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.7fr) minmax(300px, 0.9fr)",
            gap: "20px",
          }}
        >
          {/* =================================================
              CASE CREATED
              ================================================= */}

          <LiquidGlass
            variant="light"
            className="saas-card"
          >
            <div style={statusHeaderStyle}>
              <div
                style={{
                  ...iconBoxStyle,
                  color: "#059669",
                  background: "#ECFDF5",
                }}
              >
                <CheckCircle2
                  size={24}
                />
              </div>

              <div>
                <span
                  style={kickerStyle}
                >
                  Case created
                </span>

                <h2
                  style={titleStyle}
                >
                  Doctor Review Required
                </h2>

                <p
                  style={mutedStyle}
                >
                  Case {caseId} is ready
                  for ophthalmologist
                  review.
                </p>
              </div>
            </div>

            {/* ===============================================
                CASE SUMMARY
                =============================================== */}

            <div
              style={summaryGridStyle}
            >
              <SummaryItem
                label="Case ID"
                value={caseId}
              />

              <SummaryItem
                label="Image Quality"
                value={
                  quality?.quality_label ||
                  quality?.quality ||
                  "Good"
                }
              />

              <SummaryItem
                label="Eye"
                value={
                  eye
                    ? `${eye} eye`
                    : "Not available"
                }
              />

              <SummaryItem
                label="Status"
                value="Awaiting doctor review"
              />
            </div>

            {/* ===============================================
                CLINICAL REVIEW BOUNDARY
                =============================================== */}

            <div
              style={{
                marginTop: "22px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#F8FAFC",
                border:
                  "1px solid var(--saas-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontWeight: 750,
                  color:
                    "var(--saas-fg)",
                }}
              >
                <Stethoscope
                  size={17}
                />

                Clinical review boundary
              </div>

              <p
                style={{
                  ...mutedStyle,
                  marginBottom: 0,
                }}
              >
                AI findings are supporting
                evidence for the
                ophthalmologist. The final
                referral or clinical decision
                is made during human review.
              </p>
            </div>
          </LiquidGlass>

          {/* =================================================
              UPLOADED IMAGE
              ================================================= */}

          <LiquidGlass
            variant="light"
            className="saas-card"
          >
            <div style={statusHeaderStyle}>
              <div style={iconBoxStyle}>
                <FileImage
                  size={22}
                />
              </div>

              <div>
                <span
                  style={kickerStyle}
                >
                  Uploaded image
                </span>

                <h3
                  style={{
                    ...titleStyle,
                    fontSize: "1.05rem",
                  }}
                >
                  Fundus Image
                </h3>
              </div>
            </div>

            <p
              style={{
                margin: "18px 0 5px",
                fontWeight: 700,
                color: "var(--saas-fg)",
                wordBreak: "break-word",
              }}
            >
              {file.name}
            </p>

            <p
              style={{
                ...mutedStyle,
                margin: 0,
              }}
            >
              Screening completed
              successfully.
            </p>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#059669",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <CheckCircle2
                size={15}
              />

              Ready for doctor review
            </div>
          </LiquidGlass>
        </div>

        {/* ===================================================
            NEW CASE
            =================================================== */}

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="saas-btn-primary"
            onClick={reset}
          >
            <UploadCloud
              size={16}
            />

            Create Another Case
          </button>
        </div>
      </div>
    </main>
  );
}

/*
 * =========================================================
 * HEADER
 * =========================================================
 */

function Header({
  title,
  description,
}) {
  return (
    <header
      style={{
        marginBottom: "24px",
      }}
    >
      <span
        style={kickerStyle}
      >
        SERIX PHC WORKFLOW
      </span>

      <h1
        style={{
          margin: "5px 0 7px",
          fontSize:
            "clamp(1.7rem, 3vw, 2.25rem)",
          fontWeight: 850,
          letterSpacing: "-0.035em",
          color: "var(--saas-fg)",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          maxWidth: "780px",
          margin: 0,
          color:
            "var(--saas-fg-muted)",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </header>
  );
}

/*
 * =========================================================
 * SUMMARY ITEM
 * =========================================================
 */

function SummaryItem({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "13px 14px",
        borderRadius: "10px",
        border:
          "1px solid var(--saas-border)",
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
          color:
            "var(--saas-fg-muted)",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display: "block",
          fontSize: "0.88rem",
          color: "var(--saas-fg)",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const pageStyle = {
  minHeight:
    "calc(100vh - 150px)",
  padding: "38px 24px 56px",
  background: "#FAFAFA",
};

const containerStyle = {
  width: "min(1280px, 100%)",
  margin: "0 auto",
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
  background:
    "rgba(0, 82, 255, 0.08)",
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
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};