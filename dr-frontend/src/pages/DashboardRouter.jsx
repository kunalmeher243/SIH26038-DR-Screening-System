import useAuthStore from "../store/useAuthStore";
import useLanguageStore from "../store/useLanguageStore";

import PHCWorkerDashboard from "../components/phc/PHCWorkerDashboard";
import DoctorDashboard from "../components/doctor/DoctorDashboard";
import PatientDashboard from "../components/patient/PatientDashboard";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import AuthModal from "../components/auth/AuthModal";

import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function DashboardRouter({
  currentView,
  setCurrentView,
}) {
  const {
    user,
    isAuthenticated,
    switchRole,
    openLogin,
  } = useAuthStore();

  const { t } = useLanguageStore();

  /*
   * =========================================================
   * AUTHENTICATION / ROLE
   * =========================================================
   */

  const role = user?.role || null;

  const isPHCWorker = role === "PHC Worker";
  const isDoctor = role === "Ophthalmologist";
  const isPatient = role === "Patient";

  /*
   * =========================================================
   * AUTHENTICATION REQUIRED
   * =========================================================
   */

  if (!isAuthenticated) {
    return (
      <div style={pageShellStyle}>
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        <div style={authRequiredWrapStyle}>
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
            <div style={authIconStyle}>
              <ShieldCheck size={28} />
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--saas-fg)",
              }}
            >
              {t("authRequiredTitle")}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
                lineHeight: 1.5,
                margin: "0 0 24px",
              }}
            >
              {t("authRequiredDesc")}
            </p>

            <button
              type="button"
              onClick={() => openLogin("Patient")}
              className="saas-btn-primary"
              style={{
                width: "100%",
                padding: "12px",
              }}
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

  /*
   * =========================================================
   * ROLE-SPECIFIC TITLES
   * =========================================================
   */

  const roleTitle = isPHCWorker
    ? "PHC Worker Workspace"
    : isDoctor
    ? "Ophthalmologist Review Workspace"
    : "Patient Portal";

  /*
   * =========================================================
   * DEVELOPMENT ROLE SWITCHER
   *
   * This button exists ONLY inside the dashboard.
   * There is NO role-switch button in the Navbar.
   * =========================================================
   */

  const nextRole = isPHCWorker
    ? "Ophthalmologist"
    : isDoctor
    ? "Patient"
    : "PHC Worker";

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <div style={pageShellStyle}>
      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* =====================================================
          DASHBOARD SUBHEADER
          ===================================================== */}

      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom:
            "1px solid var(--saas-border)",
          padding: "12px 24px",
        }}
      >
        <div style={subheaderInnerStyle}>
          {/* -----------------------------------------------
              LEFT SIDE
              ----------------------------------------------- */}

          <div style={subheaderLeftStyle}>
            <button
              type="button"
              onClick={() =>
                setCurrentView?.("landing")
              }
              style={backButtonStyle}
            >
              <ArrowLeft size={14} />

              <span>
                {t("backToLanding")}
              </span>
            </button>

            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 750,
                color: "var(--saas-fg)",
              }}
            >
              {roleTitle}
            </span>
          </div>

          {/* -----------------------------------------------
              RIGHT SIDE
              ROLE SWITCH
              ----------------------------------------------- */}

          <div style={subheaderRightStyle}>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--saas-fg-muted)",
              }}
            >
              Active role
            </span>

            <button
              type="button"
              onClick={() =>
                switchRole(nextRole)
              }
              title={`Switch to ${nextRole}`}
              style={roleSwitchButtonStyle}
            >
              <RefreshCw size={12} />

              <span>
                Switch to {nextRole}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          ROLE-SPECIFIC WORKSPACE
          ===================================================== */}

      <main style={{ flex: 1 }}>
        {isPatient && (
          <PatientDashboard />
        )}

        {isPHCWorker && (
          <PHCWorkerDashboard />
        )}

        {isDoctor && (
          <DoctorDashboard />
        )}

        {/* Safety fallback */}
        {!isPatient &&
          !isPHCWorker &&
          !isDoctor && (
            <PatientDashboard />
          )}
      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <Footer />

      {/* =====================================================
          AUTH MODAL
          ===================================================== */}

      <AuthModal />
    </div>
  );
}

/* =========================================================
   PAGE SHELL
   ========================================================= */

const pageShellStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#FAFAFA",
};

/* =========================================================
   AUTH REQUIRED
   ========================================================= */

const authRequiredWrapStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
};

const authIconStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "14px",
  background: "var(--saas-accent-gradient)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};

/* =========================================================
   DASHBOARD SUBHEADER
   ========================================================= */

const subheaderInnerStyle = {
  maxWidth: "1280px",
  margin: "0 auto",

  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  flexWrap: "wrap",
  gap: "12px",
};

const subheaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const subheaderRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

/* =========================================================
   BACK TO LANDING
   ========================================================= */

const backButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",

  padding: "6px 12px",

  borderRadius: "8px",

  border:
    "1px solid var(--saas-border)",

  backgroundColor:
    "var(--saas-bg-subtle)",

  fontSize: "0.8125rem",
  fontWeight: 600,

  color: "var(--saas-fg)",

  cursor: "pointer",
};

/* =========================================================
   ROLE SWITCH BUTTON
   ========================================================= */

const roleSwitchButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",

  gap: "6px",

  padding: "5px 10px",

  borderRadius: "7px",

  border:
    "1px solid rgba(0, 82, 255, 0.3)",

  backgroundColor:
    "rgba(0, 82, 255, 0.06)",

  color: "var(--saas-accent)",

  fontSize: "0.75rem",
  fontWeight: 700,

  cursor: "pointer",

  transition:
    "all 160ms ease",
};