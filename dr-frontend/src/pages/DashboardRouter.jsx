import useAuthStore from "../store/useAuthStore";
import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";
import Upload from "./Upload";
import Analysis from "./Analysis";
import PatientDashboard from "../components/patient/PatientDashboard";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import AuthModal from "../components/auth/AuthModal";
import { RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";

export default function DashboardRouter({ currentView, setCurrentView }) {
  const { user, isAuthenticated, switchRole, openLogin } = useAuthStore();
  const { t } = useLanguageStore();
  const stage = useAnalysisStore((state) => state.stage);

  const isDoctor = user?.role === "Ophthalmologist";

  const analysisStages = [
    "quality",
    "enhance",
    "grade",
    "report",
    "done",
    "error",
  ];

  const isAnalyzing = analysisStages.includes(stage);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA", display: "flex", flexDirection: "column" }}>
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
          }}
        >
          <div
            className="saas-card"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "36px 28px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "var(--saas-accent-gradient)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.35rem", fontWeight: 800, color: "var(--saas-fg)" }}>
              {t("authRequiredTitle")}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--saas-fg-muted)", lineHeight: 1.5, margin: "0 0 24px 0" }}>
              {t("authRequiredDesc")}
            </p>
            <button
              type="button"
              onClick={() => openLogin()}
              className="saas-btn-primary"
              style={{ width: "100%", padding: "12px" }}
            >
              {t("signInToContinue")}
            </button>
          </div>
        </div>
        <Footer />
        <AuthModal />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#FAFAFA" }}>
      {/* Global Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Role Workspace Subheader */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--saas-border)",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setCurrentView && setCurrentView("landing")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--saas-border)",
                backgroundColor: "var(--saas-bg-subtle)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--saas-fg)",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} />
              <span>{t("backToLanding")}</span>
            </button>

            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--saas-fg)" }}>
              {isDoctor ? t("doctorEngineTitle") : t("patientPortalTitle")}
            </span>
          </div>

          {/* Quick Role Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--saas-fg-muted)",
              }}
            >
              {t("activeRole")}
            </span>
            <button
              type="button"
              onClick={() => switchRole(isDoctor ? "Patient" : "Ophthalmologist")}
              title="Toggle role between Ophthalmologist and Patient"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(0, 82, 255, 0.3)",
                backgroundColor: "rgba(0, 82, 255, 0.06)",
                color: "var(--saas-accent)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} />
              <span>{isDoctor ? t("switchToPatient") : t("switchToDoctor")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main style={{ flex: 1 }}>
        {isDoctor ? (
          <div>
            {isAnalyzing ? <Analysis /> : <Upload />}
          </div>
        ) : (
          <PatientDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal for any secondary triggers */}
      <AuthModal />
    </div>
  );
}
