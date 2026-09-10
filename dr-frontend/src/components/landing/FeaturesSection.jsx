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
        paddingTop: "80px",
        paddingBottom: "80px",
        backgroundColor: "var(--saas-bg)",
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
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 56px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "var(--saas-fg)",
              margin: "0 0 16px 0",
            }}
          >
            {t("featuresHeadlinePrefix")}{" "}
            <span className="gradient-text-saas">{t("featuresHeadlineGradient")}</span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--saas-fg-muted)",
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
                className="saas-card"
                style={{
                  padding: "36px 30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div>
                  {/* Top Row: Icon Only - Tag badge removed */}
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
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "var(--saas-accent-gradient)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        boxShadow: "var(--shadow-saas-accent)",
                      }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--saas-fg)",
                      margin: "0 0 12px 0",
                      lineHeight: 1.35,
                    }}
                  >
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--saas-fg-muted)",
                      lineHeight: 1.6,
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
                    borderTop: "1px solid var(--saas-border-subtle)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--saas-fg)",
                  }}
                >
                  <Check size={16} color="var(--saas-accent)" strokeWidth={2.5} />
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
