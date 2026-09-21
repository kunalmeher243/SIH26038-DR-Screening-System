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
        borderTop: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section Headline */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 56px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "#0F172A",
              margin: "0 0 16px 0",
              fontWeight: 800,
            }}
          >
            {t("aboutHeadlinePrefix")}{" "}
            <span style={{
              background: "linear-gradient(135deg, #1976D2 0%, #16A085 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {t("aboutHeadlineGradient")}
            </span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "#475569",
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
            className="card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
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
                color: "#0F172A",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage1Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage1Desc")}
            </p>
          </div>

          {/* Stage 2 */}
          <div
            className="card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1976D2",
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
                color: "#0F172A",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage2Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage2Desc")}
            </p>
          </div>

          {/* Stage 3 */}
          <div
            className="card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#FFFBEB",
                border: "1px solid #FDE68A",
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
                color: "#0F172A",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage3Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage3Desc")}
            </p>
          </div>

          {/* Stage 4 */}
          <div
            className="card"
            style={{
              padding: "32px 26px",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
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
                color: "#0F172A",
                margin: "0 0 10px 0",
              }}
            >
              {t("stage4Title")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("stage4Desc")}
            </p>
          </div>
        </div>

        {/* Inverted Summary Banner (High-Contrast Dark Slate/Navy Card with Crisp White Text) */}
        <div
          style={{
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            borderRadius: "20px",
            padding: "40px 48px",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "36px",
            alignItems: "center",
            boxShadow: "0 12px 36px rgba(15, 23, 42, 0.15)",
          }}
          className="about-inverted-banner"
        >
          <div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#FFFFFF",
                margin: "0 0 12px 0",
                letterSpacing: "-0.01em",
              }}
            >
              {t("bannerTitle")}
            </h3>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                color: "#94A3B8",
                margin: 0,
              }}
            >
              {t("bannerDesc")}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC", fontWeight: 600 }}>
                  {t("bannerPoint1")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC", fontWeight: 600 }}>
                  {t("bannerPoint2")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontSize: "0.875rem", color: "#F8FAFC", fontWeight: 600 }}>
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
