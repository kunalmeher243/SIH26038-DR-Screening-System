import { Eye, ShieldCheck, Activity, HeartHandshake, Database } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid var(--saas-border)",
        paddingTop: "64px",
        paddingBottom: "48px",
        color: "var(--saas-fg-muted)",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Top Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Col 1: Brand & Mission */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--saas-accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Eye size={18} strokeWidth={2.4} />
              </div>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--saas-fg)",
                  letterSpacing: "-0.02em",
                }}
              >
                RetinaTrack<span style={{ color: "var(--saas-accent)" }}>.AI</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "var(--saas-fg-muted)",
                marginBottom: "16px",
              }}
            >
              Intelligent, explainable diabetic retinopathy screening engineered to empower rural primary health centers and safeguard vision through rapid clinical triage.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                backgroundColor: "var(--saas-bg-subtle)",
                borderRadius: "6px",
                border: "1px solid var(--saas-border)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--saas-fg)",
              }}
            >
              <Activity size={14} color="var(--saas-accent)" />
              <span>Calibrated for 100k+ Annual Patients</span>
            </div>
          </div>

          {/* Col 2: Clinical Benchmarks */}
          <div>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono)",
                marginBottom: "18px",
              }}
            >
              Clinical Datasets
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.875rem",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <li>APTOS 2019 Blindness Detection</li>
              <li>IDRiD Indian Retinal Lesion Dataset</li>
              <li>DRIVE Retinal Vessel Segmentation</li>
              <li>Messidor-2 External Validation</li>
            </ul>
          </div>

          {/* Col 3: Architecture Pillars */}
          <div>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono)",
                marginBottom: "18px",
              }}
            >
              AI Triage Pipeline
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.875rem",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <li>Real-Time Quality Assessment (IQA)</li>
              <li>Adaptive CLAHE Enhancement</li>
              <li>Sub-Pixel Microaneurysm & Exudate Maps</li>
              <li>Grad-CAM Visual Explanations</li>
            </ul>
          </div>

          {/* Col 4: Triage Disclaimer */}
          <div>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono)",
                marginBottom: "18px",
              }}
            >
              Safety Standard
            </h4>
            <div
              style={{
                padding: "14px",
                backgroundColor: "var(--saas-bg-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--saas-border)",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 700,
                  color: "var(--saas-fg)",
                  marginBottom: "4px",
                }}
              >
                <ShieldCheck size={16} color="#10B981" />
                <span>Clinical Triage Safety Net</span>
              </div>
              Assists ophthalmologists with sub-30s case validation. Does not replace dilated clinical ophthalmic examinations.
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--saas-border)",
            marginBottom: "24px",
          }}
        />

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "0.8125rem",
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} RetinaTrack AI / GramDrishti. Built for Smart India Hackathon (SIH26038).
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Pure JavaScript (MERN Stack)</span>
            <span>•</span>
            <span>IEC 62304 / Good Machine Learning Practice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
