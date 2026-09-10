import {
  Users,
  ShieldAlert,
  SlidersHorizontal,
  Crosshair,
  CheckCircle,
  FileCheck2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid var(--saas-border)",
        borderBottom: "1px solid var(--saas-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section Pill Badge */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="saas-pill-badge">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--saas-accent)",
              }}
            />
            <span>Clinical Context & Mission</span>
          </div>
        </div>

        {/* Section Headline */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 64px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "var(--saas-fg)",
              margin: "0 0 16px 0",
            }}
          >
            Closing the Rural Specialist Gap with{" "}
            <span className="gradient-text-saas">Intelligent Triage</span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--saas-fg-muted)",
              margin: 0,
            }}
          >
            In rural India, there is approximately <strong>1 ophthalmologist per 100,000 citizens</strong>. RetinaTrack AI does not replace specialists—it acts as an automated triage safety net, converting high-volume rural screenings into calibrated, evidence-backed referrals.
          </p>
        </div>

        {/* 4-Stage Safety Net Architecture Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {/* Stage 1 */}
          <div
            className="saas-card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <ShieldAlert size={24} />
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--saas-fg-light)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Stage 01 • Gatekeeper
            </div>

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              Quality Rejection (IQA)
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Filters blurred, dark, or cropped captures immediately at the PHC camera. Prevents unreliable automated predictions and flags instant recapture instructions.
            </p>
          </div>

          {/* Stage 2 */}
          <div
            className="saas-card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(0, 82, 255, 0.08)",
                border: "1px solid rgba(0, 82, 255, 0.2)",
                color: "var(--saas-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <SlidersHorizontal size={24} />
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--saas-fg-light)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Stage 02 • Enhancement
            </div>

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              Adaptive CLAHE Filter
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Optimizes borderline retinal captures with Contrast Limited Adaptive Histogram Equalization, illumination normalization, and selective denoising without hallucinating artifacts.
            </p>
          </div>

          {/* Stage 3 */}
          <div
            className="saas-card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Crosshair size={24} />
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--saas-fg-light)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Stage 03 • Anatomical Maps
            </div>

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              Anatomy & Lesion AI
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Localizes optic disc, fovea center, and vascular tree. Detects sub-pixel microaneurysms, hemorrhages, and exudates with spatial coordinate references.
            </p>
          </div>

          {/* Stage 4 */}
          <div
            className="saas-card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <FileCheck2 size={24} />
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--saas-fg-light)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Stage 04 • Clinician Triage
            </div>

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              &lt; 30s Clinician Review
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Multi-class ICDR severity classification (Levels 0–4) paired with Grad-CAM visual heatmaps, calibrated confidence metrics, and structured clinical referrals.
            </p>
          </div>
        </div>

        {/* Inverted Summary Banner for Visual Rhythm */}
        <div
          style={{
            backgroundColor: "var(--saas-fg)",
            color: "#FFFFFF",
            borderRadius: "20px",
            padding: "40px 48px",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "36px",
            alignItems: "center",
          }}
          className="about-inverted-banner"
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: "16px",
                color: "#93C5FD",
              }}
            >
              <Sparkles size={14} />
              <span>Human-In-The-Loop Paradigm</span>
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 12px 0",
              }}
            >
              Screening vs. Diagnosis: The Essential Difference
            </h3>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                color: "#CBD5E1",
                margin: 0,
              }}
            >
              By filtering out normal cases (Level 0/1) with &gt;85% specificity and escalating referable cases (Level 2+) with &gt;90% sensitivity, ophthalmologists focus their time where it is needed most.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC" }}>
                  Triage 100,000+ rural patients annually
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC" }}>
                  Sub-30s ophthalmologist case sign-off
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC" }}>
                  Real-time WhatsApp report delivery to patients
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-inverted-banner {
            grid-template-columns: 1fr !important;
            padding: 28px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
