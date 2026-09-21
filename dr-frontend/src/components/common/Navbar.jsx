import { useState, useRef, useEffect } from "react";
import {
  Eye,
  LogOut,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Globe,
  Menu,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

import useAuthStore from "../../store/useAuthStore";
import useLanguageStore, {
  availableLanguages,
} from "../../store/useLanguageStore";

export default function Navbar({
  currentView,
  setCurrentView,
}) {
  const {
    user,
    isAuthenticated,
    logout,
    openLogin,
    openSignUp,
  } = useAuthStore();

  const {
    language,
    setLanguage,
    t,
  } = useLanguageStore();

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const [
    isLangDropdownOpen,
    setIsLangDropdownOpen,
  ] = useState(false);

  const langDropdownRef = useRef(null);

  const isDoctor = user?.role === "Ophthalmologist";
  const isPHCWorker = user?.role === "PHC Worker";

  const roleClass = isDoctor
    ? "doctor"
    : isPHCWorker
      ? "phc"
      : "patient";

  const roleLabel = isDoctor
    ? t("roleDoctor")
    : isPHCWorker
      ? "PHC Worker"
      : t("rolePatient");

  const portalLabel = isDoctor
    ? t("navDoctorPortal")
    : isPHCWorker
      ? "PHC Worker Portal"
      : t("navPatientPortal");

  /* =========================================================
     CLOSE LANGUAGE DROPDOWN WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target)
      ) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     CLOSE MOBILE MENU ON RESIZE
     ========================================================= */

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 900) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /* =========================================================
     NAVIGATION / SCROLL
     ========================================================= */

  const handleScroll = (id) => {
    setIsMobileMenuOpen(false);
    setIsLangDropdownOpen(false);

    if (currentView !== "landing") {
      if (setCurrentView) {
        setCurrentView("landing");

        setTimeout(() => {
          const element =
            document.getElementById(id);

          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 150);
      }

      return;
    }

    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================================
     LANGUAGE
     ========================================================= */

  const currentLangObj =
    availableLanguages.find(
      (l) => l.code === language
    ) || availableLanguages[0];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <header className="rt-liquid-header">
        <div className="rt-liquid-header-inner">

          {/* =================================================
              BRAND
              ================================================= */}

          <button
            type="button"
            className="rt-liquid-brand"
            onClick={() => {
              if (setCurrentView) {
                setCurrentView("landing");
              }

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span className="rt-liquid-brand-icon">
              <img src="../../../dist/assets/Retina.png" alt="Logo" width={30} height={30} />
            </span>

            <span className="rt-liquid-brand-text">
              <span className="rt-liquid-brand-name">
                <span>
                  SERIX
                </span>
              </span>

              <span className="rt-liquid-brand-subtitle">
                {t("brandSubtitle")}
              </span>
            </span>
          </button>


          {/* =================================================
              DESKTOP NAVIGATION
              ================================================= */}

          <nav className="rt-liquid-nav">
            <button
              type="button"
              className={
                "rt-liquid-nav-item " +
                (currentView === "landing"
                  ? "active"
                  : "")
              }
              onClick={() =>
                handleScroll("hero")
              }
            >
              {t("navHome")}
            </button>

            <button
              type="button"
              className="rt-liquid-nav-item"
              onClick={() =>
                handleScroll("about")
              }
            >
              {t("navAbout")}
            </button>

            <button
              type="button"
              className="rt-liquid-nav-item"
              onClick={() =>
                handleScroll("features")
              }
            >
              {t("navFeatures")}
            </button>
          </nav>


          {/* =================================================
              DESKTOP RIGHT CONTROLS
              ================================================= */}

          <div className="rt-liquid-actions">

            {/* ---------------------------------------------
                LANGUAGE
                --------------------------------------------- */}

            <div
              ref={langDropdownRef}
              className="rt-liquid-language-wrapper"
            >
              <button
                type="button"
                className="rt-liquid-language-button"
                onClick={() =>
                  setIsLangDropdownOpen(
                    (previous) => !previous
                  )
                }
              >
                <Globe
                  size={15}
                  strokeWidth={2.2}
                />

                <span>
                  {currentLangObj.nativeName}
                </span>

                <ChevronDown
                  size={14}
                  className={
                    isLangDropdownOpen
                      ? "rt-chevron-open"
                      : ""
                  }
                />
              </button>


              {/* -------------------------------------------
                  LANGUAGE DROPDOWN
                  ------------------------------------------- */}

              {isLangDropdownOpen && (
                <div className="rt-liquid-language-menu">
                  {availableLanguages.map(
                    (lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        className={
                          "rt-liquid-language-option " +
                          (language === lang.code
                            ? "selected"
                            : "")
                        }
                        onClick={() => {
                          setLanguage(
                            lang.code
                          );

                          setIsLangDropdownOpen(
                            false
                          );
                        }}
                      >
                        <span>
                          {lang.nativeName}
                        </span>

                        {language ===
                          lang.code && (
                            <Check
                              size={14}
                            />
                          )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>


            {/* ---------------------------------------------
                AUTHENTICATION
                --------------------------------------------- */}

            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="rt-liquid-login-button"
                  onClick={() =>
                    openLogin()
                  }
                >
                  {t("navLogin")}
                </button>

                <button
                  type="button"
                  className="rt-liquid-signup-button"
                  onClick={() =>
                    openSignUp()
                  }
                >
                  {t("navSignUp")}
                </button>
              </>
            ) : (
              <div className="rt-liquid-authenticated">

                {/* Portal button */}

                {currentView ===
                  "landing" ? (
                  <button
                    type="button"
                    className="rt-liquid-portal-button"
                    onClick={() => {
                      if (
                        setCurrentView
                      ) {
                        setCurrentView(
                          "dashboard"
                        );
                      }
                    }}
                  >
                    <span>
                      {portalLabel}
                    </span>

                    <ChevronRight
                      size={16}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rt-liquid-back-button"
                    onClick={() => {
                      if (
                        setCurrentView
                      ) {
                        setCurrentView(
                          "landing"
                        );
                      }
                    }}
                  >
                    {t("navLandingPage")}
                  </button>
                )}


                {/* User information */}

                <div className="rt-liquid-user">

                  <span
                    className={
                      "rt-liquid-user-icon " + roleClass
                    }
                  >
                    {isDoctor ? (
                      <Stethoscope size={16} />
                    ) : isPHCWorker ? (
                      <ShieldCheck size={16} />
                    ) : (
                      <UserCheck size={16} />
                    )}
                  </span>

                  <span className="rt-liquid-user-info">
                    <span className="rt-liquid-user-name">
                      {user?.name ||
                        "User"}
                    </span>

                    <span
                      className={
                        "rt-liquid-user-role " + roleClass
                      }
                    >
                      {roleLabel}
                    </span>
                  </span>
                </div>
                {/* Logout */}

                <button
                  type="button"
                  className="rt-liquid-logout"
                  title={t("navLogout")}
                  onClick={() => logout()}
                >
                  <LogOut size={16} />
                </button>

              </div>
            )}
          </div>


          {/* =================================================
              MOBILE MENU BUTTON
              ================================================= */}

          <button
            type="button"
            className="rt-liquid-mobile-toggle"
            onClick={() =>
              setIsMobileMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle navigation menu"
            aria-expanded={
              isMobileMenuOpen
            }
          >
            {isMobileMenuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>


        {/* ===================================================
            MOBILE MENU
            =================================================== */}

        {isMobileMenuOpen && (
          <div className="rt-liquid-mobile-panel">

            {/* -----------------------------------------------
                MOBILE NAVIGATION
                ----------------------------------------------- */}

            <div className="rt-liquid-mobile-nav">

              <button
                type="button"
                className={
                  "rt-liquid-mobile-nav-item " +
                  (currentView ===
                    "landing"
                    ? "active"
                    : "")
                }
                onClick={() =>
                  handleScroll(
                    "hero"
                  )
                }
              >
                {t("navHome")}
              </button>

              <button
                type="button"
                className="rt-liquid-mobile-nav-item"
                onClick={() =>
                  handleScroll(
                    "about"
                  )
                }
              >
                {t("navAbout")}
              </button>

              <button
                type="button"
                className="rt-liquid-mobile-nav-item"
                onClick={() =>
                  handleScroll(
                    "features"
                  )
                }
              >
                {t("navFeatures")}
              </button>
            </div>


            {/* -----------------------------------------------
                MOBILE LANGUAGE
                ----------------------------------------------- */}

            <div className="rt-liquid-mobile-language">

              <div className="rt-liquid-mobile-label">
                <Globe
                  size={14}
                />

                <span>
                  {t("language")}
                </span>
              </div>

              <div className="rt-liquid-mobile-languages">
                {availableLanguages.map(
                  (lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={
                        "rt-liquid-mobile-language-option " +
                        (language ===
                          lang.code
                          ? "selected"
                          : "")
                      }
                      onClick={() =>
                        setLanguage(
                          lang.code
                        )
                      }
                    >
                      {lang.nativeName}

                      {language ===
                        lang.code && (
                          <Check
                            size={13}
                          />
                        )}
                    </button>
                  )
                )}
              </div>
            </div>


            {/* -----------------------------------------------
                MOBILE AUTH
                ----------------------------------------------- */}

            <div className="rt-liquid-mobile-auth">

              {!isAuthenticated ? (
                <div className="rt-liquid-mobile-auth-grid">

                  <button
                    type="button"
                    className="rt-liquid-login-button"
                    onClick={() => {
                      setIsMobileMenuOpen(
                        false
                      );

                      openLogin();
                    }}
                  >
                    {t(
                      "navLogin"
                    )}
                  </button>

                  <button
                    type="button"
                    className="rt-liquid-signup-button"
                    onClick={() => {
                      setIsMobileMenuOpen(
                        false
                      );

                      openSignUp();
                    }}
                  >
                    {t(
                      "navSignUp"
                    )}
                  </button>

                </div>
              ) : (
                <div className="rt-liquid-mobile-auth-stack">

                  <button
                    type="button"
                    className="rt-liquid-portal-button"
                    onClick={() => {
                      setIsMobileMenuOpen(
                        false
                      );

                      if (
                        setCurrentView
                      ) {
                        setCurrentView(
                          currentView ===
                            "landing"
                            ? "dashboard"
                            : "landing"
                        );
                      }
                    }}
                  >
                    <span>
                      {currentView ===
                        "landing"
                        ? portalLabel
                        : t(
                          "navLandingPage"
                        )}
                    </span>

                    {currentView ===
                      "landing" && (
                        <ChevronRight
                          size={16}
                        />
                      )}
                  </button>


                  <button
                    type="button"
                    className="rt-liquid-mobile-logout"
                    onClick={() => {
                      setIsMobileMenuOpen(
                        false
                      );

                      logout();
                    }}
                  >
                    <LogOut
                      size={16}
                    />

                    <span>
                      {t(
                        "navLogout"
                      )}
                    </span>
                  </button>

                </div>
              )}
            </div>
          </div>
        )}
      </header>


      {/* =====================================================
          SCOPED LIQUID GLASS NAVBAR STYLES
          ===================================================== */}

      <style>{`

        /* ===================================================
           HEADER
           =================================================== */

        .rt-liquid-header {
          position: sticky;
          top: 14px;
          z-index: 100;

          width: calc(100% - 32px);
          max-width: 1440px;

          margin: 0 auto;

          border:
            1px solid rgba(255, 255, 255, 0.20);

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(18, 27, 36, 0.76),
              rgba(38, 40, 48, 0.63)
            );

          backdrop-filter:
            blur(26px)
            saturate(155%);

          -webkit-backdrop-filter:
            blur(26px)
            saturate(155%);

          box-shadow:
            0 18px 45px
              rgba(0, 0, 0, 0.25),

            0 3px 12px
              rgba(0, 0, 0, 0.12),

            inset 0 1px 0
              rgba(255, 255, 255, 0.24),

            inset 0 -1px 0
              rgba(255, 255, 255, 0.05);

          overflow: visible;
        }


        .rt-liquid-header::before {
          content: "";

          position: absolute;
          inset: 0;

          border-radius: inherit;

          background:
            linear-gradient(
              115deg,
              rgb(251, 251, 251),
              rgba(255,255,255,0.02) 30%,
              transparent 60%,
              rgb(255, 255, 255)
            );

          pointer-events: none;

          z-index: -1;
        }


        /* ===================================================
           HEADER INNER
           =================================================== */

        .rt-liquid-header-inner {
          position: relative;

          min-height: 72px;

          padding:
            6px 8px 6px 14px;

          display: flex;
          align-items: center;

          gap: 14px;
        }


        /* ===================================================
           BRAND
           =================================================== */

        .rt-liquid-brand {
          flex-shrink: 0;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 5px 9px;

          border: none;

          background: transparent;

          color: white;

          cursor: pointer;

          font-family: inherit;

          text-align: left;
        }


        .rt-liquid-brand-icon {
          width: 39px;
          height: 39px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: var(--color-surface);

          background:
            linear-gradient(
              135deg,
              #2f7cff,
              #1255e8
            );

          border:
            1px solid
              rgba(255,255,255,0.30);

          box-shadow:
            0 7px 20px
              rgba(31, 105, 255, 0.34),

            inset 0 1px 0
              rgba(255,255,255,0.35);
        }


        .rt-liquid-brand-text {
          display: flex;

          flex-direction: column;

          gap: 1px;

          min-width: 0;
        }


        .rt-liquid-brand-name {
          color:
            rgba(255,255,255,0.96);

          font-size:
            1.08rem;

          line-height: 1.1;

          font-weight: 800;

          letter-spacing:
            -0.025em;

          white-space: nowrap;
        }


        .rt-liquid-brand-accent {
          color: #62a0ff;
        }


        .rt-liquid-brand-subtitle {
          color:
            rgba(255,255,255,0.50);

          font-size:
            0.63rem;

          line-height: 1.2;

          font-weight: 500;

          white-space: nowrap;
        }


        /* ===================================================
           CENTER NAVIGATION PILL
           =================================================== */

        .rt-liquid-nav {
          position: absolute;

          left: 50%;

          transform:
            translateX(-50%);

          display: flex;
          align-items: center;

          gap: 2px;

          padding: 5px;

          min-width: 350px;

          border:
            1px solid
              rgba(255,255,255,0.18);

          border-radius: 34px;

          background:
            linear-gradient(
              135deg,
              rgba(7, 15, 22, 0.58),
              rgba(40, 42, 49, 0.46)
            );

          backdrop-filter:
            blur(22px)
            saturate(155%);

          -webkit-backdrop-filter:
            blur(22px)
            saturate(155%);

          box-shadow:
            0 8px 24px
              rgba(0,0,0,0.20),

            inset 0 1px 0
              rgba(255,255,255,0.18);
        }


        .rt-liquid-nav-item {
          position: relative;

          height: 52px;

          min-width: 100px;

          padding:
            0 22px;

          border:
            1px solid transparent;

          border-radius: 28px;

          background: transparent;

          color:
            rgba(255,255,255,0.62);

          font-family: inherit;

          font-size:
            0.88rem;

          font-weight: 650;

          cursor: pointer;

          transition:
            all 180ms ease;
        }


        .rt-liquid-nav-item:hover {
          color:
            rgba(255,255,255,0.96);

          background:
            rgba(255,255,255,0.07);

          border-color:
            rgba(255,255,255,0.08);
        }


        .rt-liquid-nav-item.active {
          color: var(--color-surface);

          background:
            linear-gradient(
              135deg,
              rgba(8,18,27,0.88),
              rgba(30,35,43,0.74)
            );

          border-color:
            rgba(255,255,255,0.28);

          box-shadow:
            0 4px 14px
              rgba(0,0,0,0.25),

            inset 0 1px 0
              rgba(255,255,255,0.20);
        }


        .rt-liquid-nav-item.active::before {
          content: "";

          position: absolute;

          inset: 1px;

          border-radius:
            inherit;

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,0.08),
              transparent 52%
            );

          pointer-events: none;
        }


        /* ===================================================
           RIGHT ACTIONS
           =================================================== */

        .rt-liquid-actions {
          margin-left: auto;

          display: flex;
          align-items: center;

          gap: 8px;
        }


        /* ===================================================
           LANGUAGE
           =================================================== */

        .rt-liquid-language-wrapper {
          position: relative;
        }


        .rt-liquid-language-button {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          height: 40px;

          padding:
            0 12px;

          border:
            1px solid
              rgba(255,255,255,0.16);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.055);

          color:
            rgba(255,255,255,0.84);

          font-family: inherit;

          font-size:
            0.78rem;

          font-weight: 600;

          cursor: pointer;

          backdrop-filter:
            blur(14px);

          -webkit-backdrop-filter:
            blur(14px);

          transition:
            all 180ms ease;
        }


        .rt-liquid-language-button:hover {
          background:
            rgba(255,255,255,0.10);

          border-color:
            rgba(255,255,255,0.27);
        }


        .rt-liquid-language-button > svg:first-child {
          color:
            #65a2ff;
        }


        .rt-chevron-open {
          transform:
            rotate(180deg);
        }


        /* ===================================================
           LANGUAGE DROPDOWN
           =================================================== */

        .rt-liquid-language-menu {
          position: absolute;

          right: 0;

          top:
            calc(100% + 9px);

          width: 170px;

          padding: 6px;

          border:
            1px solid
              rgba(255,255,255,0.20);

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              rgba(22,29,37,0.92),
              rgba(42,43,51,0.88)
            );

          backdrop-filter:
            blur(24px)
            saturate(150%);

          -webkit-backdrop-filter:
            blur(24px)
            saturate(150%);

          box-shadow:
            0 18px 40px
              rgba(0,0,0,0.30),

            inset 0 1px 0
              rgba(255,255,255,0.17);
        }


        .rt-liquid-language-option {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            10px 11px;

          border: none;

          border-radius: 10px;

          background: transparent;

          color:
            rgba(255,255,255,0.72);

          font-family: inherit;

          font-size:
            0.80rem;

          font-weight: 550;

          cursor: pointer;

          text-align: left;

          transition:
            all 150ms ease;
        }


        .rt-liquid-language-option:hover {
          color: var(--color-surface);

          background:
            rgba(255,255,255,0.08);
        }


        .rt-liquid-language-option.selected {
          color: var(--color-surface);

          background:
            rgba(60,130,255,0.18);

          font-weight: 700;
        }


        .rt-liquid-language-option.selected svg {
          color: #69a5ff;
        }


        /* ===================================================
           LOGIN BUTTON
           =================================================== */

        .rt-liquid-login-button {
          height: 40px;

          padding:
            0 16px;

          border:
            1px solid
              rgba(255,255,255,0.17);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.055);

          color:
            rgba(255,255,255,0.87);

          font-family: inherit;

          font-size:
            0.80rem;

          font-weight: 650;

          cursor: pointer;

          backdrop-filter:
            blur(14px);

          -webkit-backdrop-filter:
            blur(14px);

          transition:
            all 180ms ease;
        }


        .rt-liquid-login-button:hover {
          background:
            rgba(255,255,255,0.10);

          border-color:
            rgba(255,255,255,0.27);

          color: var(--color-surface);
        }


        /* ===================================================
           SIGN UP
           =================================================== */

        .rt-liquid-signup-button {
          height: 40px;

          padding:
            0 17px;

          border:
            1px solid
              rgba(112,163,255,0.52);

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #317cff,
              #1658eb
            );

          color: var(--color-surface);

          font-family: inherit;

          font-size:
            0.80rem;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 7px 20px
              rgba(35,105,255,0.30),

            inset 0 1px 0
              rgba(255,255,255,0.30);

          transition:
            all 180ms ease;
        }


        .rt-liquid-signup-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 10px 26px
              rgba(35,105,255,0.38),

            inset 0 1px 0
              rgba(255,255,255,0.34);
        }


        /* ===================================================
           AUTHENTICATED AREA
           =================================================== */

        .rt-liquid-authenticated {
          display: flex;
          align-items: center;

          gap: 7px;
        }


        .rt-liquid-portal-button {
          height: 40px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          padding:
            0 13px;

          border:
            1px solid
              rgba(86,151,255,0.42);

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              rgba(49,124,255,0.85),
              rgba(22,88,235,0.78)
            );

          color: var(--color-surface);

          font-family: inherit;

          font-size:
            0.78rem;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 6px 18px
              rgba(35,105,255,0.26),

            inset 0 1px 0
              rgba(255,255,255,0.26);

          transition:
            all 180ms ease;
        }


        .rt-liquid-portal-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 9px 23px
              rgba(35,105,255,0.34);
        }


        .rt-liquid-back-button {
          height: 40px;

          padding:
            0 13px;

          border:
            1px solid
              rgba(255,255,255,0.17);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.055);

          color:
            rgba(255,255,255,0.84);

          font-family: inherit;

          font-size:
            0.78rem;

          font-weight: 650;

          cursor: pointer;

          transition:
            all 180ms ease;
        }


        .rt-liquid-back-button:hover {
          background:
            rgba(255,255,255,0.10);

          border-color:
            rgba(255,255,255,0.27);
        }


        /* ===================================================
           USER
           =================================================== */

        .rt-liquid-user {
          display: flex;
          align-items: center;

          gap: 7px;

          min-width: 0;

          padding:
            3px 9px 3px 4px;

          border:
            1px solid
              rgba(255,255,255,0.13);

          border-radius: 999px;

          background:
            rgba(255,255,255,0.045);
        }


        .rt-liquid-user-icon {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.09);

          color:
            #76adff;

          border:
            1px solid
              rgba(255,255,255,0.12);
        }


        .rt-liquid-user-icon.patient {
          color:
            #4adea1;
        }


        .rt-liquid-user-icon.phc {
          color:
            #fbbf24;
        }


        .rt-liquid-user-info {
          display: flex;
          flex-direction: column;

          min-width: 0;

          line-height: 1.15;
        }


        .rt-liquid-user-name {
          max-width: 100px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color:
            rgba(255,255,255,0.92);

          font-size:
            0.74rem;

          font-weight: 650;
        }


        .rt-liquid-user-role {
          color:
            #76adff;

          font-size:
            0.59rem;

          font-weight: 650;
        }


        .rt-liquid-user-role.patient {
          color:
            #4adea1;
        }


        .rt-liquid-user-role.phc {
          color:
            #fbbf24;
        }


        /* ===================================================
           LOGOUT
           =================================================== */

        .rt-liquid-logout {
          width: 39px;
          height: 39px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(255, 100, 100, 0.38);
          border-radius: 12px;

          background: rgba(255, 70, 70, 0.10);

          color: #ff6b6b;

          cursor: pointer;

          transition: all 180ms ease;
        }

        .rt-liquid-logout:hover {
          color: #ff8b8b;

          border-color: rgba(255, 110, 110, 0.55);

          background: rgba(255, 70, 70, 0.17);

          box-shadow:
            0 6px 18px rgba(255, 70, 70, 0.16);
        }


          /* ===================================================
           MOBILE TOGGLE
           =================================================== */

        .rt-liquid-mobile-toggle {
          display: none;

          width: 43px;
          height: 43px;

          margin-left: auto;

          align-items: center;
          justify-content: center;

          border:
            1px solid
              rgba(255,255,255,0.18);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.06);

          color:
            rgba(255,255,255,0.90);

          cursor: pointer;

          backdrop-filter:
            blur(15px);

          -webkit-backdrop-filter:
            blur(15px);
        }


        /* ===================================================
           MOBILE PANEL
           =================================================== */

        .rt-liquid-mobile-panel {
          display: none;

          margin:
            0 8px 8px;

          padding:
            12px;

          border:
            1px solid
              rgba(255,255,255,0.13);

          border-radius: 18px;

          background:
            rgba(10,18,26,0.55);

          backdrop-filter:
            blur(25px)
            saturate(150%);

          -webkit-backdrop-filter:
            blur(25px)
            saturate(150%);

          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,0.10);
        }


        .rt-liquid-mobile-nav {
          display: flex;
          flex-direction: column;

          gap: 4px;

          padding-bottom: 12px;

          border-bottom:
            1px solid
              rgba(255,255,255,0.10);
        }


        .rt-liquid-mobile-nav-item {
          width: 100%;

          padding:
            12px 14px;

          border:
            1px solid transparent;

          border-radius: 12px;

          background: transparent;

          color:
            rgba(255,255,255,0.68);

          font-family: inherit;

          font-size:
            0.92rem;

          font-weight: 600;

          text-align: left;

          cursor: pointer;

          transition:
            all 150ms ease;
        }


        .rt-liquid-mobile-nav-item:hover,
        .rt-liquid-mobile-nav-item.active {
          color: var(--color-surface);

          background:
            rgba(255,255,255,0.08);

          border-color:
            rgba(255,255,255,0.10);
        }


        /* ===================================================
           MOBILE LANGUAGE
           =================================================== */

        .rt-liquid-mobile-language {
          padding:
            14px 0;

          border-bottom:
            1px solid
              rgba(255,255,255,0.10);
        }


        .rt-liquid-mobile-label {
          display: flex;
          align-items: center;

          gap: 6px;

          margin-bottom: 9px;

          color:
            rgba(255,255,255,0.50);

          font-size:
            0.70rem;

          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            0.06em;
        }


        .rt-liquid-mobile-label svg {
          color:
            #69a5ff;
        }


        .rt-liquid-mobile-languages {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 6px;
        }


        .rt-liquid-mobile-language-option {
          min-height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 4px;

          padding:
            5px 4px;

          border:
            1px solid
              rgba(255,255,255,0.12);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.04);

          color:
            rgba(255,255,255,0.65);

          font-family: inherit;

          font-size:
            0.72rem;

          font-weight: 600;

          cursor: pointer;
        }


        .rt-liquid-mobile-language-option.selected {
          color: var(--color-surface);

          border-color:
            rgba(75,140,255,0.48);

          background:
            rgba(55,125,255,0.16);
        }


        /* ===================================================
           MOBILE AUTH
           =================================================== */

        .rt-liquid-mobile-auth {
          padding-top: 13px;
        }


        .rt-liquid-mobile-auth-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 8px;
        }


        .rt-liquid-mobile-auth-stack {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }


        .rt-liquid-mobile-logout {
          width: 100%;

          min-height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border:
            1px solid
              rgba(255,100,100,0.28);

          border-radius: 12px;

          background:
            rgba(255,70,70,0.07);

          color:
            #ff8585;

          font-family: inherit;

          font-size:
            0.80rem;

          font-weight: 650;

          cursor: pointer;
        }


        /* ===================================================
           TABLET
           =================================================== */

        @media (max-width: 1180px) {

          .rt-liquid-brand-subtitle {
            display: none;
          }

          .rt-liquid-brand-name {
            font-size:
              1rem;
          }

          .rt-liquid-nav {
            min-width:
              315px;
          }

          .rt-liquid-nav-item {
            min-width:
              90px;

            padding:
              0 15px;
          }

          .rt-liquid-user-info {
            display: none;
          }

          .rt-liquid-user {
            padding:
              4px;
          }
        }


        /* ===================================================
           MOBILE / TABLET
           =================================================== */

        @media (max-width: 899px) {

          .rt-liquid-header {
            top: 8px;

            width:
              calc(100% - 16px);

            border-radius:
              19px;
          }


          .rt-liquid-header-inner {
            min-height:
              62px;

            padding:
              5px 7px 5px 10px;
          }


          .rt-liquid-brand {
            padding:
              4px 6px;
          }


          .rt-liquid-brand-icon {
            width: 37px;
            height: 37px;
          }


          .rt-liquid-brand-name {
            font-size:
              0.98rem;
          }


          .rt-liquid-nav,
          .rt-liquid-actions {
            display: none;
          }


          .rt-liquid-mobile-toggle {
            display: flex;
          }


          .rt-liquid-mobile-panel {
            display: block;
          }
        }


        /* ===================================================
           SMALL MOBILE
           =================================================== */

        @media (max-width: 480px) {

          .rt-liquid-header {
            width:
              calc(100% - 10px);

            top: 5px;

            border-radius:
              17px;
          }


          .rt-liquid-brand-subtitle {
            display: none;
          }


          .rt-liquid-brand-name {
            font-size:
              0.92rem;
          }


          .rt-liquid-brand-icon {
            width: 35px;
            height: 35px;

            border-radius:
              10px;
          }


          .rt-liquid-mobile-panel {
            margin:
              0 5px 5px;

            padding:
              10px;
          }
        }


        /* ===================================================
           REDUCED MOTION
           =================================================== */

        @media (prefers-reduced-motion: reduce) {

          .rt-liquid-nav-item,
          .rt-liquid-language-button,
          .rt-liquid-language-option,
          .rt-liquid-login-button,
          .rt-liquid-signup-button,
          .rt-liquid-portal-button,
          .rt-liquid-back-button,
          .rt-liquid-logout {
            transition: none;
          }

          .rt-liquid-signup-button:hover,
          .rt-liquid-portal-button:hover {
            transform: none;
          }
        }

      `}</style>
    </>
  );
}