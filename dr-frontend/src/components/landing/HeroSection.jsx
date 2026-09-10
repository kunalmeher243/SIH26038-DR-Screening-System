import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Eye,
  FileText,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function HeroSection({ onAccessDashboard, onExploreClick }) {
  const { isAuthenticated, user, openLogin } = useAuthStore();
  const [activeLayer, setActiveLayer] = useState("gradcam"); // "raw" | "enhanced" | "gradcam" | "lesions"

  const handleCtaClick = () => {
    if (isAuthenticated) {
      if (onAccessDashboard) onAccessDashboard();
    } else {
      openLogin("Patient");
    }
  };

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "64px",
        paddingBottom: "80px",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 82, 255, 0.08), transparent 70%), #FAFAFA",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="hero-grid-layout"
        >
          {/* Left Column: Narrative & CTA */}
          <div>
            {/* Live Indicator Pill Badge */}
            <div
              className="saas-pill-badge"
              style={{
                marginBottom: "24px",
                boxShadow: "0 1px 2px rgba(0, 82, 255, 0.05)",
              }}
            >
              <span
                className="animate-pulse-subtle"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--saas-accent)",
                  display: "inline-block",
                }}
              />
              <span>AI-Powered Rural Healthcare Screening</span>
            </div>

            {/* Main Headline */}
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 3.75rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "var(--saas-fg)",
                margin: "0 0 20px 0",
              }}
            >
              Explainable Retinal Screening. Built for{" "}
              <span className="gradient-text-saas">Rural Triage.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.65,
                color: "var(--saas-fg-muted)",
                margin: "0 0 32px 0",
                maxWidth: "580px",
              }}
            >
              Empowering primary health centers with real-time image quality assessment, adaptive CLAHE enhancement, sub-pixel lesion detection, and Grad-CAM explanations for clinician validation in <strong style={{ color: "var(--saas-fg)", fontWeight: 600 }}>under 30 seconds</strong>.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px",
                marginBottom: "40px",
              }}
            >
              <button
                type="button"
                onClick={handleCtaClick}
                className="saas-btn-primary"
                style={{
                  padding: "14px 28px",
                  fontSize: "1rem",
                }}
              >
                <span>
                  {isAuthenticated
                    ? user?.role === "Ophthalmologist"
                      ? "Open Screening Dashboard"
                      : "Open Patient Portal"
                    : "Access Dashboard"}
                </span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("about");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="saas-btn-secondary"
                style={{
                  padding: "14px 24px",
                  fontSize: "1rem",
                }}
              >
                <Layers size={18} color="var(--saas-accent)" />
                <span>Explore AI Architecture</span>
              </button>
            </div>

            {/* Key Clinical Metric Highlights */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                paddingTop: "24px",
                borderTop: "1px solid var(--saas-border)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--saas-fg)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  &gt; 93%
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--saas-fg-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  Referable DR Sensitivity
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--saas-fg)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  &lt; 30s
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--saas-fg-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  Clinician Validation Time
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--saas-accent)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  100k+
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--saas-fg-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  Annual Patient Tele-Triage
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Definition Retinal Screening Visualizer */}
          <div style={{ position: "relative" }}>
            {/* Background Ambient Glow */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                right: "10%",
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0, 82, 255, 0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            {/* Main Interactive Visual Card */}
            <div
              className="saas-card animate-float-slow"
              style={{
                padding: "24px",
                position: "relative",
                zIndex: 2,
                borderRadius: "24px",
                border: "1.5px solid rgba(0, 82, 255, 0.15)",
                boxShadow: "0 20px 40px -10px rgba(0, 82, 255, 0.12), 0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Header of Interactive Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--saas-border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10B981",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--saas-fg)",
                      textTransform: "uppercase",
                    }}
                  >
                    Triage Engine Live View
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#059669",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  IQA: 0.91 (GRADABLE)
                </span>
              </div>

              {/* Fundus Visual Canvas Area */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.15",
                  borderRadius: "16px",
                  overflow: "hidden",
                  backgroundColor: "#0B132B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Visual Retinal Diagram SVG */}
                <svg
                  viewBox="0 0 400 340"
                  style={{ width: "100%", height: "100%" }}
                >
                  <defs>
                    {/* Fundus Orange/Red Glow */}
                    <radialGradient id="fundusGlow" cx="45%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#8A1C14" />
                      <stop offset="60%" stopColor="#4A0E0B" />
                      <stop offset="100%" stopColor="#1C0605" />
                    </radialGradient>

                    {/* Optic Disc Glow */}
                    <radialGradient id="opticDisc" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFEAA7" />
                      <stop offset="70%" stopColor="#FDCB6E" />
                      <stop offset="100%" stopColor="#E17055" />
                    </radialGradient>

                    {/* Grad-CAM Heatmap Radial */}
                    <radialGradient id="gradcamHeat" cx="62%" cy="48%" r="40%">
                      <stop offset="0%" stopColor="#FF0055" stopOpacity="0.85" />
                      <stop offset="45%" stopColor="#FF7700" stopOpacity="0.65" />
                      <stop offset="75%" stopColor="#FFDD00" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
                    </radialGradient>

                    {/* Vessel Stroke Filter */}
                    <filter id="glowFilter">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Fundus Globe */}
                  <circle cx="200" cy="170" r="150" fill="url(#fundusGlow)" />

                  {/* Vasculature Network */}
                  <g stroke="#C0392B" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8">
                    {/* Main Arches from Optic Disc (cx=120, cy=170) */}
                    <path d="M 120 170 Q 140 100 200 80 T 310 90" />
                    <path d="M 120 170 Q 150 70 240 60 T 330 80" />
                    <path d="M 120 170 Q 135 230 190 260 T 300 250" />
                    <path d="M 120 170 Q 160 270 250 280 T 320 255" />
                    {/* Nasal branches */}
                    <path d="M 120 170 Q 90 120 60 110" />
                    <path d="M 120 170 Q 85 220 55 230" />
                    {/* Sub-branches */}
                    <path d="M 180 85 Q 210 110 240 120" strokeWidth="1.5" stroke="#E74C3C" />
                    <path d="M 230 65 Q 270 95 285 130" strokeWidth="1.5" stroke="#E74C3C" />
                    <path d="M 175 250 Q 210 220 250 210" strokeWidth="1.5" stroke="#E74C3C" />
                    <path d="M 240 275 Q 280 235 295 190" strokeWidth="1.5" stroke="#E74C3C" />
                  </g>

                  {/* Optic Disc Location */}
                  <circle cx="120" cy="170" r="28" fill="url(#opticDisc)" opacity="0.95" />
                  <circle cx="120" cy="170" r="32" fill="none" stroke="#0052FF" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="120" y="218" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">
                    Optic Disc
                  </text>

                  {/* Fovea / Macula Center */}
                  <circle cx="250" cy="170" r="18" fill="none" stroke="#F1C40F" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.75" />
                  <circle cx="250" cy="170" r="3" fill="#F39C12" />
                  <text x="250" y="200" textAnchor="middle" fill="#F1C40F" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">
                    Fovea
                  </text>

                  {/* Layer: Grad-CAM Heatmap */}
                  {activeLayer === "gradcam" && (
                    <circle cx="245" cy="165" r="95" fill="url(#gradcamHeat)" />
                  )}

                  {/* Layer: Lesions Overlay (Microaneurysms & Hemorrhages) */}
                  {(activeLayer === "lesions" || activeLayer === "gradcam") && (
                    <g>
                      {/* Microaneurysms (Red dots with yellow target rings) */}
                      <circle cx="210" cy="130" r="3" fill="#E74C3C" />
                      <circle cx="210" cy="130" r="7" fill="none" stroke="#0052FF" strokeWidth="1.5" />

                      <circle cx="270" cy="140" r="3" fill="#E74C3C" />
                      <circle cx="270" cy="140" r="7" fill="none" stroke="#0052FF" strokeWidth="1.5" />

                      <circle cx="280" cy="190" r="3.5" fill="#E74C3C" />
                      <circle cx="280" cy="190" r="8" fill="none" stroke="#0052FF" strokeWidth="1.5" />

                      <circle cx="220" cy="210" r="3" fill="#E74C3C" />
                      <circle cx="220" cy="210" r="7" fill="none" stroke="#0052FF" strokeWidth="1.5" />

                      {/* Hemorrhages (Blots) */}
                      <ellipse cx="295" cy="165" rx="9" ry="6" fill="#900C3F" stroke="#E74C3C" strokeWidth="1" />
                      <ellipse cx="195" cy="160" rx="7" ry="5" fill="#900C3F" stroke="#E74C3C" strokeWidth="1" />

                      {/* Hard Exudates (Bright yellow waxy spots) */}
                      <circle cx="240" cy="120" r="2.5" fill="#FFF700" />
                      <circle cx="245" cy="124" r="2.5" fill="#FFF700" />
                      <circle cx="250" cy="118" r="2" fill="#FFF700" />
                    </g>
                  )}

                  {/* Rotating Optical Calibration Reticle */}
                  <circle
                    cx="200"
                    cy="170"
                    r="142"
                    fill="none"
                    stroke="rgba(0, 82, 255, 0.4)"
                    strokeWidth="1.2"
                    strokeDasharray="6 8"
                    className="animate-rotate-slow"
                    style={{ transformOrigin: "200px 170px" }}
                  />
                </svg>

                {/* Floating Severity Callout Card */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    right: "12px",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "10px",
                    border: "1px solid rgba(0, 82, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: "#F59E0B",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      LEVEL 2
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--saas-fg)" }}>
                        Moderate NPDR
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--saas-fg-muted)" }}>
                        8 Microaneurysms • 3 Hemorrhages
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 800,
                        color: "var(--saas-accent)",
                      }}
                    >
                      91% Conf.
                    </span>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "#DC2626",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ● REFERRAL REQ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Layer Switcher Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  marginTop: "16px",
                  padding: "4px",
                  backgroundColor: "var(--saas-bg-muted)",
                  borderRadius: "10px",
                  border: "1px solid var(--saas-border)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveLayer("raw")}
                  style={{
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeLayer === "raw" ? "#FFFFFF" : "transparent",
                    color: activeLayer === "raw" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
                    boxShadow: activeLayer === "raw" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Raw Fundus
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer("enhanced")}
                  style={{
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeLayer === "enhanced" ? "#FFFFFF" : "transparent",
                    color: activeLayer === "enhanced" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
                    boxShadow: activeLayer === "enhanced" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  CLAHE Filter
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer("gradcam")}
                  style={{
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeLayer === "gradcam" ? "#FFFFFF" : "transparent",
                    color: activeLayer === "gradcam" ? "var(--saas-accent)" : "var(--saas-fg-muted)",
                    boxShadow: activeLayer === "gradcam" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Grad-CAM
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer("lesions")}
                  style={{
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeLayer === "lesions" ? "#FFFFFF" : "transparent",
                    color: activeLayer === "lesions" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
                    boxShadow: activeLayer === "lesions" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Lesion Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
