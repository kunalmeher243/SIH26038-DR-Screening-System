import {
  CameraOff,
  Wand2,
  ScanEye,
  Eye,
  GitFork,
  Radio,
  Check,
  TrendingUp,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: CameraOff,
      title: "Automated Image Quality Assessment (IQA)",
      tag: "Focus & Illumination Gate",
      description:
        "Instant rejection of blurred, overexposed, or ungradeable captures at the camera stage to eliminate false predictions and guide field operators to immediate recapture.",
      stat: "Zero ungradeable misclassifications",
    },
    {
      icon: Wand2,
      title: "Adaptive Retinal Enhancement",
      tag: "Contrast Optimization",
      description:
        "Local contrast optimization via CLAHE, illumination-field normalization, and artifact suppression for borderline fundus images without hallucinating false lesions.",
      stat: "Preserves native tissue fidelity",
    },
    {
      icon: ScanEye,
      title: "Sub-Pixel Lesion Detection",
      tag: "MA / EX / HE Localization",
      description:
        "High-sensitivity localization of tiny capillary outpouchings (microaneurysms), hard/soft exudates, and retinal hemorrhages with distance metrics from optic disc and fovea.",
      stat: "Validated on IDRiD Indian dataset",
    },
    {
      icon: Eye,
      title: "Explainable AI (XAI) Heatmaps",
      tag: "Grad-CAM Evidence",
      description:
        "Transparent visual proof of neural network activations. Doctors verify model attention and lesion density in under 30 seconds before approving final diagnosis.",
      stat: "< 30s clinician validation",
    },
    {
      icon: GitFork,
      title: "Risk-Prioritized Triage Routing",
      tag: "3-Tier Routing Matrix",
      description:
        "Automated routing between Routine Screening (Low Risk), Uncertainty Escrow (Human Review), and Immediate Ophthalmology Escalation (High Risk).",
      stat: ">90% sensitivity on referable DR",
    },
    {
      icon: Radio,
      title: "Telemedicine Scalability",
      tag: "100,000+ Patients / Year",
      description:
        "Architected to simulate and balance district-level patient flow (274 patients/day), optimizing camera utilization, bandwidth constraints, and doctor workloads.",
      stat: "District-wide load balancing",
    },
  ];

  return (
    <section
      id="features"
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
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
            <span>End-to-End Capabilities</span>
          </div>
        </div>

        {/* Section Headline */}
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 64px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              color: "var(--saas-fg)",
              margin: "0 0 16px 0",
            }}
          >
            Engineering Rigor for{" "}
            <span className="gradient-text-saas">Clinical Reliability</span>
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--saas-fg-muted)",
              margin: 0,
            }}
          >
            An integrated multi-stage pipeline where image quality, anatomical segmentation, sub-pixel detection, and calibrated explainability outperform isolated single-model techniques.
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
                  {/* Top Row: Icon & Tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
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

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--saas-accent)",
                        backgroundColor: "rgba(0, 82, 255, 0.06)",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: "1px solid rgba(0, 82, 255, 0.15)",
                      }}
                    >
                      {feat.tag}
                    </span>
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

                {/* Bottom Proof Metric Tag */}
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
