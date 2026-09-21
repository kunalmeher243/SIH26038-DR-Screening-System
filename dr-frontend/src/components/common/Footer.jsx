import { Eye, ShieldCheck, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import useLanguageStore from "../../store/useLanguageStore";

export default function Footer() {
  const { t } = useLanguageStore();

  return (
    <footer
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        paddingTop: "64px",
        paddingBottom: "48px",
        color: "var(--color-text-muted)",
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
              <img 
                src="/retinal.png" 
                alt="SERIX Logo" 
                style={{ 
                  height: "28px", 
                  width: "auto", 
                  objectFit: "contain" 
                }} 
              />
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                SERIX<span style={{ color: "var(--color-primary)", marginLeft: "4px" }}>Health</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "var(--color-text-muted)",
                marginBottom: "16px",
              }}
            >
              {t("footerDesc")}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                backgroundColor: "var(--saas-bg-subtle)",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              <Activity size={14} color="var(--color-primary)" />
              <span>{t("footerCapacity")}</span>
            </div>
          </div>

          {/* Col 2: Clinical Benchmarks */}
          <div>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "18px",
              }}
            >
              {t("footerDatasets")}
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
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "18px",
              }}
            >
              {t("footerPipeline")}
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
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "18px",
              }}
            >
              {t("footerSafety")}
            </h4>
            <div
              style={{
                padding: "14px",
                backgroundColor: "var(--saas-bg-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
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
                  color: "var(--color-text)",
                  marginBottom: "4px",
                }}
              >
                <ShieldCheck size={16} color="#10B981" />
                <span>Clinical Triage Safety Net</span>
              </div>
              {t("footerSafetyText")}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
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
            gap: "20px",
            fontSize: "0.8125rem",
          }}
        >
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} SERIX Health. AI-Assisted Clinical Triage.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>
            <Link
              to="/privacy"
              style={{
                color: "var(--color-text-muted)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >
              {t("navPrivacy")}
            </Link>

            <Link
              to="/terms"
              style={{
                color: "var(--color-text-muted)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >
              {t("termsDisclaimer")}
            </Link>

            <span style={{ color: "var(--color-border)" }}>•</span>
            <span style={{ color: "#64748B" }}>IEC 62304 / Good Machine Learning Practice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
