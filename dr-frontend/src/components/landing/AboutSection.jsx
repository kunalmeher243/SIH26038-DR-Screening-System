import {
  ShieldAlert,
  SlidersHorizontal,
  Crosshair,
  CheckCircle,
  FileCheck2,
} from "lucide-react";
import useLanguageStore from "../../store/useLanguageStore";

export default function AboutSection() {
  const { t } = useLanguageStore();

  return (
    <section
      id="about"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
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
        {/* Section Headline - Pill badge removed */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 56px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "var(--saas-fg)",
              margin: "0 0 16px 0",
            }}
          >
            {t("aboutHeadlinePrefix")}{" "}
            <span className="gradient-text-saas">{t("aboutHeadlineGradient")}</span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--saas-fg-muted)",
              margin: 0,
            }}
          >
            {t("aboutDescription")}
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

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage1Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage1Desc")}
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

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage2Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage2Desc")}
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

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage3Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage3Desc")}
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

            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "var(--saas-fg)",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage4Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage4Desc")}
            </p>
          </div>
        </div>

        {/* Inverted Summary Banner - Badge removed */}
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
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 12px 0",
              }}
            >
              {t("bannerTitle")}
            </h3>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                color: "#CBD5E1",
                margin: 0,
              }}
            >
              {t("bannerDesc")}
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
                  {t("bannerPoint1")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC" }}>
                  {t("bannerPoint2")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC" }}>
                  {t("bannerPoint3")}
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
