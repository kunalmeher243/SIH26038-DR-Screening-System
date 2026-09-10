import { Eye, LogOut, User, Stethoscope, UserCheck, Shield, ChevronRight } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function Navbar({ onNavigateSection, currentView, setCurrentView }) {
  const { user, isAuthenticated, logout, openLogin, openSignUp, switchRole } = useAuthStore();

  const isDoctor = user?.role === "Ophthalmologist";

  const handleScroll = (id) => {
    if (currentView !== "landing") {
      if (setCurrentView) {
        setCurrentView("landing");
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--saas-border)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => {
            if (setCurrentView) setCurrentView("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--saas-accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "var(--shadow-saas-accent)",
            }}
          >
            <Eye size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "1.18rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--saas-fg)",
                }}
              >
                RetinaTrack<span style={{ color: "var(--saas-accent)" }}>.AI</span>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(0, 82, 255, 0.08)",
                  color: "var(--saas-accent)",
                  border: "1px solid rgba(0, 82, 255, 0.2)",
                  textTransform: "uppercase",
                }}
              >
                Rural Triage
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                color: "var(--saas-fg-muted)",
                fontWeight: 500,
              }}
            >
              Intelligent Fundus Screening
            </p>
          </div>
        </div>

        {/* Center Anchor Navigation Tabs */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "32px",
          }}
          className="md-nav-block"
        >
          <button
            type="button"
            onClick={() => handleScroll("hero")}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: currentView === "landing" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
              cursor: "pointer",
              transition: "color 0.15s ease",
              padding: "8px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--saas-accent)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color =
                currentView === "landing" ? "var(--saas-fg)" : "var(--saas-fg-muted)")
            }
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleScroll("about")}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--saas-fg-muted)",
              cursor: "pointer",
              transition: "color 0.15s ease",
              padding: "8px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--saas-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--saas-fg-muted)")}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleScroll("features")}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--saas-fg-muted)",
              cursor: "pointer",
              transition: "color 0.15s ease",
              padding: "8px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--saas-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--saas-fg-muted)")}
          >
            Features
          </button>
        </nav>

        {/* Right Section: Auth State */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => openLogin()}
                className="saas-btn-secondary"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openSignUp()}
                className="saas-btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Portal Toggle Button */}
              {currentView === "landing" ? (
                <button
                  type="button"
                  onClick={() => setCurrentView && setCurrentView("dashboard")}
                  className="saas-btn-primary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{isDoctor ? "Doctor Portal" : "Patient Portal"}</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentView && setCurrentView("landing")}
                  className="saas-btn-secondary"
                  style={{
                    padding: "8px 14px",
                    fontSize: "0.875rem",
                  }}
                >
                  Landing Page
                </button>
              )}

              {/* User Badge & Role indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "4px 10px 4px 6px",
                  backgroundColor: "var(--saas-bg-subtle)",
                  border: "1px solid var(--saas-border)",
                  borderRadius: "999px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: isDoctor ? "rgba(0, 82, 255, 0.12)" : "rgba(16, 185, 129, 0.12)",
                    color: isDoctor ? "var(--saas-accent)" : "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isDoctor ? <Stethoscope size={16} /> : <UserCheck size={16} />}
                </div>

                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--saas-fg)",
                      display: "block",
                    }}
                  >
                    {user?.name || "User"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: isDoctor ? "var(--saas-accent)" : "#059669",
                      textTransform: "uppercase",
                    }}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Log Out"
                style={{
                  background: "none",
                  border: "1px solid var(--saas-border)",
                  borderRadius: "8px",
                  padding: "8px",
                  color: "var(--saas-fg-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                  backgroundColor: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#EF4444";
                  e.currentTarget.style.borderColor = "#FCA5A5";
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--saas-fg-muted)";
                  e.currentTarget.style.borderColor = "var(--saas-border)";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-nav-block {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
