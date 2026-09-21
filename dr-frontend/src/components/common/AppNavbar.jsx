import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  User,
  ShieldCheck,
  Stethoscope,
  Menu,
  X,
  Globe,
  ChevronDown,
  LayoutDashboard,
  Home,
  Shield,
  FileText,
  Check
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useLanguageStore, { availableLanguages } from "../../store/useLanguageStore";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Track active section on scroll when on landing page
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("workspace");
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      const featuresEl = document.getElementById("features");
      const aboutEl = document.getElementById("about");

      const aboutTop = aboutEl ? aboutEl.offsetTop : Infinity;
      const featuresTop = featuresEl ? featuresEl.offsetTop : Infinity;

      // Landing page sequence: Hero (home) -> Features -> About
      if (aboutEl && scrollPos >= aboutTop) {
        setActiveSection("about");
      } else if (featuresEl && scrollPos >= featuresTop) {
        setActiveSection("features");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  // Determine portal route based on user role
  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "PHC Worker" || user.portal === "phc") return "/phc";
    if (user.role === "Ophthalmologist" || user.portal === "doctor") return "/doctor";
    return "/patient";
  };

  const dashboardPath = getDashboardPath();

  const handleLogout = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/");
  };

  // Get user initial letter in capital
  const getUserInitial = () => {
    if (!user?.name) return "U";
    const cleanName = user.name.replace(/^Dr\.\s*/i, "").trim();
    return cleanName ? cleanName.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();
  };

  // Role Badge Component
  const renderRoleBadge = (size = "small") => {
    if (!user) return null;
    const isDoctor = user.role === "Ophthalmologist" || user.portal === "doctor";
    const isPHC = user.role === "PHC Worker" || user.portal === "phc";

    if (isDoctor) {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: size === "small" ? "4px 10px" : "6px 12px",
          borderRadius: "16px",
          backgroundColor: "#F0FDF4",
          color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontSize: size === "small" ? "0.75rem" : "0.825rem",
          fontWeight: 700
        }}>
          <Stethoscope size={size === "small" ? 13 : 15} /> Ophthalmologist
        </span>
      );
    }

    if (isPHC) {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: size === "small" ? "4px 10px" : "6px 12px",
          borderRadius: "16px",
          backgroundColor: "#E8F8F5",
          color: "#0D9488",
          border: "1px solid rgba(13, 148, 136, 0.3)",
          fontSize: size === "small" ? "0.75rem" : "0.825rem",
          fontWeight: 700
        }}>
          <ShieldCheck size={size === "small" ? 13 : 15} /> PHC Worker
        </span>
      );
    }

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: size === "small" ? "4px 10px" : "6px 12px",
        borderRadius: "16px",
        backgroundColor: "#EFF6FF",
        color: "#1976D2",
        border: "1px solid rgba(25, 118, 210, 0.3)",
        fontSize: size === "small" ? "0.75rem" : "0.825rem",
        fontWeight: 700
      }}>
        <User size={size === "small" ? 13 : 15} /> Patient
      </span>
    );
  };

  // Avatar gradient based on role
  const getAvatarGradient = () => {
    if (!user) return "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)";
    if (user.role === "Ophthalmologist" || user.portal === "doctor") {
      return "linear-gradient(135deg, #16A085 0%, #0F766E 100%)";
    }
    if (user.role === "PHC Worker" || user.portal === "phc") {
      return "linear-gradient(135deg, #0D9488 0%, #0369A1 100%)";
    }
    return "linear-gradient(135deg, #1976D2 0%, #0284C7 100%)";
  };

  const handleNavScroll = (elementId) => {
    setMobileMenuOpen(false);
    setActiveSection(elementId);
    if (location.pathname !== "/") {
      navigate(`/#${elementId}`);
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection("home");
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <header style={{
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid rgba(226, 232, 240, 0.75)",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      transition: "all 0.2s ease"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative"
      }}>
        {/* =========================================================
            1. LEFT: BRAND LOGO
            ========================================================= */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("home");
            }}
          >
            <img
              src="/retinal.png"
              alt="SERIX Health Logo"
              style={{
                height: "38px",
                width: "auto",
                objectFit: "contain",
                display: "block"
              }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#1976D2",
                letterSpacing: "-0.03em"
              }}>
                SERIX
              </span>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#16A085",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}>
                Health
              </span>
            </div>
          </Link>
        </div>

        {/* =========================================================
            2. CENTER: DESKTOP NAV LINKS (Home, Features, About)
            ========================================================= */}
        <nav
          className="hidden-mobile"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "rgba(241, 245, 249, 0.65)",
            padding: "4px 6px",
            borderRadius: "12px",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {/* Home Tab */}
          <button
            type="button"
            onClick={handleHomeClick}
            style={{
              background: "none",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: location.pathname === "/" && activeSection === "home" ? 700 : 550,
              color: location.pathname === "/" && activeSection === "home" ? "#1976D2" : "#475569",
              backgroundColor: location.pathname === "/" && activeSection === "home" ? "#FFFFFF" : "transparent",
              boxShadow: location.pathname === "/" && activeSection === "home" ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/" || activeSection !== "home") {
                e.currentTarget.style.color = "#1976D2";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/" || activeSection !== "home") {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {t("navHome")}
          </button>

          {/* Features Tab */}
          <button
            type="button"
            onClick={() => handleNavScroll("features")}
            style={{
              background: "none",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: location.pathname === "/" && activeSection === "features" ? 700 : 550,
              color: location.pathname === "/" && activeSection === "features" ? "#1976D2" : "#475569",
              backgroundColor: location.pathname === "/" && activeSection === "features" ? "#FFFFFF" : "transparent",
              boxShadow: location.pathname === "/" && activeSection === "features" ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/" || activeSection !== "features") {
                e.currentTarget.style.color = "#1976D2";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/" || activeSection !== "features") {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {t("navFeatures")}
          </button>

          {/* About Tab */}
          <button
            type="button"
            onClick={() => handleNavScroll("about")}
            style={{
              background: "none",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: location.pathname === "/" && activeSection === "about" ? 700 : 550,
              color: location.pathname === "/" && activeSection === "about" ? "#1976D2" : "#475569",
              backgroundColor: location.pathname === "/" && activeSection === "about" ? "#FFFFFF" : "transparent",
              boxShadow: location.pathname === "/" && activeSection === "about" ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/" || activeSection !== "about") {
                e.currentTarget.style.color = "#1976D2";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/" || activeSection !== "about") {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {t("navAbout")}
          </button>

          {/* Workspace Tab */}
          {isAuthenticated && (() => {
            const isDashboardActive = location.pathname === dashboardPath || 
              location.pathname.startsWith("/phc") || 
              location.pathname.startsWith("/doctor") || 
              location.pathname.startsWith("/patient");
            return (
              <Link
                to={dashboardPath}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: isDashboardActive ? 700 : 550,
                  color: isDashboardActive ? "#1976D2" : "#475569",
                  backgroundColor: isDashboardActive ? "#FFFFFF" : "transparent",
                  boxShadow: isDashboardActive ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
                  border: "none",
                  textDecoration: "none",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isDashboardActive) {
                    e.currentTarget.style.color = "#1976D2";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDashboardActive) {
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <LayoutDashboard size={14} />
                <span>{t("navWorkspace")}</span>
              </Link>
            );
          })()}
        </nav>

        {/* =========================================================
            3. RIGHT: LANGUAGE SELECTOR & AUTHENTICATION
            ========================================================= */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          
          {/* LANGUAGE SELECTOR */}
          <div ref={langMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#CBD5E1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
            >
              <Globe size={15} color="#1976D2" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown size={14} style={{ transform: langDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
            </button>

            {langDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "160px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                padding: "6px",
                zIndex: 1001,
                animation: "menuPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: language === lang.code ? "#EFF6FF" : "transparent",
                      color: language === lang.code ? "#1976D2" : "#334155",
                      fontSize: "0.825rem",
                      fontWeight: language === lang.code ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <span>{lang.nativeName}</span>
                    {language === lang.code && <Check size={14} color="#1976D2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              AUTH STATE: LOGIN BUTTON OR USER INITIAL CIRCLE WITH MENU
              ------------------------------------------------------------- */}
          {!isAuthenticated || !user ? (
            /* WHEN NOT LOGGED IN: Sleek Login Button */
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#1976D2",
                borderRadius: "10px",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1565C0";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(25, 118, 210, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1976D2";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(25, 118, 210, 0.25)";
              }}
            >
              <User size={15} />
              <span>{t("navLogin")}</span>
            </Link>
          ) : (
            /* WHEN LOGGED IN: Capitalized User Initial Circle + Animated Dropdown */
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: getAvatarGradient(),
                  color: "#FFFFFF",
                  border: userDropdownOpen ? "2px solid #1976D2" : "2px solid #FFFFFF",
                  boxShadow: userDropdownOpen
                    ? "0 0 0 4px rgba(25, 118, 210, 0.2), 0 4px 12px rgba(0, 0, 0, 0.12)"
                    : "0 2px 8px rgba(30, 60, 90, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={user.name}
              >
                {getUserInitial()}
              </button>

              {/* USER PROFILE DROPDOWN MENU */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "290px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
                    padding: "16px",
                    zIndex: 1002,
                    animation: "dropdownSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformOrigin: "top right"
                  }}
                >
                  {/* User Profile Header Card */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #F1F5F9"
                  }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: getAvatarGradient(),
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.12)"
                    }}>
                      {getUserInitial()}
                    </div>

                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <h4 style={{
                        fontSize: "0.95rem",
                        fontWeight: 750,
                        color: "#0F172A",
                        margin: "0 0 2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {user.name}
                      </h4>
                      <p style={{
                        fontSize: "0.775rem",
                        color: "#64748B",
                        margin: "0 0 6px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {user.email || "Clinical Member"}
                      </p>
                      {renderRoleBadge("small")}
                    </div>
                  </div>

                  {/* Quick Action Navigation Links */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "10px 0 8px" }}>
                    <Link
                      to={dashboardPath}
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        color: "#1E293B",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        backgroundColor: "#F8FAFC",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EFF6FF"; e.currentTarget.style.color = "#1976D2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = "#1E293B"; }}
                    >
                      <LayoutDashboard size={16} color="#1976D2" />
                      <span>{t("myWorkspace")}</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: 550,
                        textDecoration: "none",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = "#1976D2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
                    >
                      <Home size={16} />
                      <span>{t("publicPortal")}</span>
                    </Link>

                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: 550,
                        textDecoration: "none",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = "#1976D2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
                    >
                      <Shield size={16} />
                      <span>{t("privacySecurity")}</span>
                    </Link>

                    <Link
                      to="/terms"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: 550,
                        textDecoration: "none",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = "#1976D2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
                    >
                      <FileText size={16} />
                      <span>{t("termsDisclaimer")}</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", backgroundColor: "#F1F5F9", margin: "4px 0 8px" }} />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #FEE2E2",
                      backgroundColor: "#FEF2F2",
                      color: "#DC2626",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEE2E2";
                      e.currentTarget.style.borderColor = "#FCA5A5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                      e.currentTarget.style.borderColor = "#FEE2E2";
                    }}
                  >
                    <LogOut size={16} />
                    <span>{t("signOut")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE HAMBURGER TOGGLE */}
          <button
            type="button"
            className="show-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              color: "#334155",
              cursor: "pointer"
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* =========================================================
          4. MOBILE DRAWER MENU
          ========================================================= */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "16px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            animation: "drawerSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {isAuthenticated && user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: getAvatarGradient(),
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.15rem",
                  fontWeight: 800
                }}>
                  {getUserInitial()}
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 750, color: "#1E293B" }}>
                    {user.name}
                  </div>
                  {renderRoleBadge("small")}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: "10px",
                    backgroundColor: "#1976D2",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: "0.875rem"
                  }}
                >
                  {t("myWorkspace")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "11px 18px",
                    borderRadius: "10px",
                    border: "1px solid #FCA5A5",
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  <LogOut size={15} /> {t("signOut")}
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#1976D2",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem"
              }}
            >
              {t("navLogin")}
            </Link>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "8px" }}>
            <button
              type="button"
              onClick={handleHomeClick}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "0.9rem",
                color: location.pathname === "/" && activeSection === "home" ? "#1976D2" : "#334155",
                fontWeight: location.pathname === "/" && activeSection === "home" ? 700 : 600,
                padding: "8px 0",
                cursor: "pointer"
              }}
            >
              {t("navHome")}
            </button>
            <button
              type="button"
              onClick={() => handleNavScroll("features")}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "0.9rem",
                color: location.pathname === "/" && activeSection === "features" ? "#1976D2" : "#334155",
                fontWeight: location.pathname === "/" && activeSection === "features" ? 700 : 600,
                padding: "8px 0",
                cursor: "pointer"
              }}
            >
              {t("navFeatures")}
            </button>
            <button
              type="button"
              onClick={() => handleNavScroll("about")}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "0.9rem",
                color: location.pathname === "/" && activeSection === "about" ? "#1976D2" : "#334155",
                fontWeight: location.pathname === "/" && activeSection === "about" ? 700 : 600,
                padding: "8px 0",
                cursor: "pointer"
              }}
            >
              {t("navAbout")}
            </button>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "0.85rem", color: "#64748B", textDecoration: "none", fontWeight: 500, padding: "6px 0" }}
            >
              {t("privacySecurity")}
            </Link>
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "0.85rem", color: "#64748B", textDecoration: "none", fontWeight: 500, padding: "6px 0" }}
            >
              {t("termsDisclaimer")}
            </Link>
          </div>
        </div>
      )}

      {/* STYLES & ANIMATIONS */}
      <style>{`
        @keyframes dropdownSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes menuPop {
          0% {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes drawerSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
