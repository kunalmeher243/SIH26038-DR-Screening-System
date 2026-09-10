import { useState, useRef, useEffect } from "react";
import {
  Eye,
  LogOut,
  Stethoscope,
  UserCheck,
  ChevronRight,
  Globe,
  Menu,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useLanguageStore, { availableLanguages } from "../../store/useLanguageStore";

export default function Navbar({ currentView, setCurrentView }) {
  const { user, isAuthenticated, logout, openLogin, openSignUp } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const isDoctor = user?.role === "Ophthalmologist";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = (id) => {
    setIsMobileMenuOpen(false);
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

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(255, 255, 255, 0.94)",
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
        {/* Brand Logo - Badge completely removed */}
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
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--saas-fg)",
                }}
              >
                {t("brandName")}<span style={{ color: "var(--saas-accent)" }}>.AI</span>
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
              {t("brandSubtitle")}
            </p>
          </div>
        </div>

        {/* Center Anchor Navigation Tabs (Desktop) */}
        <nav
          className="desktop-nav"
          style={{
            display: "none",
            alignItems: "center",
            gap: "32px",
          }}
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
            {t("navHome")}
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
            {t("navAbout")}
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
            {t("navFeatures")}
          </button>
        </nav>

        {/* Right Controls: Language Selector + Auth Actions (Desktop) */}
        <div
          className="desktop-nav"
          style={{
            display: "none",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Language Selector Dropdown */}
          <div ref={langDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid var(--saas-border)",
                backgroundColor: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--saas-fg)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--saas-accent)";
                e.currentTarget.style.backgroundColor = "var(--saas-bg-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--saas-border)";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <Globe size={15} color="var(--saas-accent)" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown size={14} color="var(--saas-fg-muted)" />
            </button>

            {isLangDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid var(--saas-border)",
                  boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
                  padding: "6px",
                  width: "160px",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: language === l.code ? "rgba(0, 82, 255, 0.08)" : "transparent",
                      color: language === l.code ? "var(--saas-accent)" : "var(--saas-fg)",
                      fontWeight: language === l.code ? 700 : 500,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (language !== l.code) e.currentTarget.style.backgroundColor = "var(--saas-bg-subtle)";
                    }}
                    onMouseLeave={(e) => {
                      if (language !== l.code) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{l.nativeName}</span>
                    {language === l.code && <Check size={14} color="var(--saas-accent)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => openLogin()}
                className="saas-btn-secondary"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                {t("navLogin")}
              </button>
              <button
                type="button"
                onClick={() => openSignUp()}
                className="saas-btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                {t("navSignUp")}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                  <span>{isDoctor ? t("navDoctorPortal") : t("navPatientPortal")}</span>
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
                  {t("navLandingPage")}
                </button>
              )}

              {/* User Avatar & Name */}
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
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: isDoctor ? "var(--saas-accent)" : "#059669",
                    }}
                  >
                    {isDoctor ? t("roleDoctor") : t("rolePatient")}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                title={t("navLogout")}
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

        {/* Mobile / Tablet Hamburger Toggle Button */}
        <div className="mobile-menu-toggle" style={{ display: "none", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--saas-border)",
              borderRadius: "8px",
              padding: "8px",
              color: "var(--saas-fg)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid var(--saas-border)",
            padding: "18px 24px 24px",
            boxShadow: "0 12px 24px -4px rgba(15, 23, 42, 0.08)",
          }}
          className="mobile-drawer"
        >
          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
            <button
              type="button"
              onClick={() => handleScroll("hero")}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--saas-fg)",
                padding: "8px 0",
                cursor: "pointer",
              }}
            >
              {t("navHome")}
            </button>
            <button
              type="button"
              onClick={() => handleScroll("about")}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--saas-fg-muted)",
                padding: "8px 0",
                cursor: "pointer",
              }}
            >
              {t("navAbout")}
            </button>
            <button
              type="button"
              onClick={() => handleScroll("features")}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--saas-fg-muted)",
                padding: "8px 0",
                cursor: "pointer",
              }}
            >
              {t("navFeatures")}
            </button>
          </div>

          {/* Language Selector (Mobile Segmented) */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--saas-fg-muted)",
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Globe size={14} color="var(--saas-accent)" />
              <span>{t("language")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "8px",
                    border: language === l.code ? "1.5px solid var(--saas-accent)" : "1px solid var(--saas-border)",
                    backgroundColor: language === l.code ? "rgba(0, 82, 255, 0.08)" : "#FFFFFF",
                    color: language === l.code ? "var(--saas-accent)" : "var(--saas-fg)",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Actions in Mobile Menu */}
          <div style={{ paddingTop: "12px", borderTop: "1px solid var(--saas-border-subtle)" }}>
            {!isAuthenticated ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="saas-btn-secondary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  {t("navLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openSignUp();
                  }}
                  className="saas-btn-primary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  {t("navSignUp")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (setCurrentView) {
                      setCurrentView(currentView === "landing" ? "dashboard" : "landing");
                    }
                  }}
                  className="saas-btn-primary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  {currentView === "landing"
                    ? isDoctor
                      ? t("navDoctorPortal")
                      : t("navPatientPortal")
                    : t("navLandingPage")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="saas-btn-secondary"
                  style={{ width: "100%", padding: "10px", color: "#DC2626", borderColor: "#FCA5A5" }}
                >
                  <LogOut size={16} />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
