import {
  CameraOff,
  Wand2,
  ScanEye,
  Eye,
  GitFork,
  Radio,
  Check,
} from "lucide-react";
import useLanguageStore from "../../store/useLanguageStore";

export default function FeaturesSection() {
  const { t } = useLanguageStore();

  const features = [
    {
      icon: CameraOff,
      title: t("feat1Title"),
      description: t("feat1Desc"),
      stat: t("feat1Stat"),
    },
    {
      icon: Wand2,
      title: t("feat2Title"),
      description: t("feat2Desc"),
      stat: t("feat2Stat"),
    },
    {
      icon: ScanEye,
      title: t("feat3Title"),
      description: t("feat3Desc"),
      stat: t("feat3Stat"),
    },
    {
      icon: Eye,
      title: t("feat4Title"),
      description: t("feat4Desc"),
      stat: t("feat4Stat"),
    },
    {
      icon: GitFork,
      title: t("feat5Title"),
      description: t("feat5Desc"),
      stat: t("feat5Stat"),
    },
    {
      icon: Radio,
      title: t("feat6Title"),
      description: t("feat6Desc"),
      stat: t("feat6Stat"),
    },
  ];

  return (
    <section
      id="features"
      style={{
        paddingTop: "90px",
        paddingBottom: "90px",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section Headline */}
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 56px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "#FFFFFF",
              margin: "0 0 16px 0",
              fontWeight: 800,
            }}
          >
            {t("featuresHeadlinePrefix")}{" "}
            <span style={{ color: "#FFFFFF", fontWeight: 800 }}>
              {t("featuresHeadlineGradient")}
            </span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "#CBD5E1",
              margin: 0,
            }}
          >
            {t("featuresDescription")}
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "28px",
          }}
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="card"
                style={{
                  padding: "36px 30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.4)";
                }}
              >
                <div>
                  {/* Top Row: Icon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#38BDF8",
                        boxShadow: "0 4px 14px rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      <Icon size={24} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "1.22rem",
                      fontWeight: 750,
                      color: "#FFFFFF",
                      margin: "0 0 12px 0",
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#CBD5E1",
                      lineHeight: 1.65,
                      margin: "0 0 24px 0",
                    }}
                  >
                    {feat.description}
                  </p>
                </div>

                {/* Bottom Proof Metric */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#F1F5F9",
                  }}
                >
                  <Check size={16} color="#34D399" strokeWidth={2.5} />
                  <span>{feat.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
