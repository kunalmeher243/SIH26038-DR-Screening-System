import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ShieldCheck, Stethoscope, Menu, X, Shield, FileText } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine portal route
  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "PHC Worker" || user.portal === "phc") return "/phc";
    if (user.role === "Ophthalmologist" || user.portal === "doctor") return "/doctor";
    return "/patient";
  };

  const dashboardPath = getDashboardPath();

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/");
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const isDoctor = user.role === "Ophthalmologist" || user.portal === "doctor";
    const isPHC = user.role === "PHC Worker" || user.portal === "phc";

    if (isDoctor) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 12px", borderRadius: "16px",
          backgroundColor: "#F0FDF4", color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontSize: "0.8rem", fontWeight: 700
        }}>
          <Stethoscope size={14} /> Doctor
        </span>
      );
    }

    if (isPHC) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 12px", borderRadius: "16px",
          backgroundColor: "#E8F8F5", color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontSize: "0.8rem", fontWeight: 700
        }}>
          <ShieldCheck size={14} /> PHC Worker
        </span>
      );
    }

    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "5px 12px", borderRadius: "16px",
        backgroundColor: "#E3F2FD", color: "#1976D2",
        border: "1px solid rgba(25, 118, 210, 0.3)",
        fontSize: "0.8rem", fontWeight: 700
      }}>
        <User size={14} /> Patient
      </span>
    );
  };

  return (
    <header style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(30, 60, 90, 0.04)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 20px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* BRAND LOGO: SERIX with retinal.png */}
        <Link 
          to={dashboardPath} 
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
          onClick={() => setMobileMenuOpen(false)}
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

        {/* DESKTOP ROLE-SPECIFIC LOGIN STATUS & ACTIONS */}
        <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {isAuthenticated && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {getRoleBadge()}
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  {user.name}
                </span>
              </div>
              <span style={{ color: "#E2E8F0", fontWeight: 300 }}>|</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  color: "#475569",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                  e.currentTarget.style.borderColor = "#FCA5A5";
                  e.currentTarget.style.color = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#D1D5DB";
                  e.currentTarget.style.color = "#475569";
                }}
                title="Log out of session"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/" 
              style={{ 
                padding: "8px 18px", 
                fontSize: "0.875rem", 
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#1976D2",
                borderRadius: "8px",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1565C0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1976D2"; }}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
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

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "16px 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)"
          }}
        >
          {isAuthenticated && user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>
                  {user.name}
                </span>
                {getRoleBadge()}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#EFF6FF",
                    color: "#1976D2",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: "0.875rem"
                  }}
                >
                  Workspace
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #FCA5A5",
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#1976D2",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem"
              }}
            >
              Sign In to Workspace
            </Link>
          )}

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "10px", display: "flex", gap: "16px" }}>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "0.8125rem", color: "#64748B", textDecoration: "none", fontWeight: 500 }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "0.8125rem", color: "#64748B", textDecoration: "none", fontWeight: 500 }}
            >
              Terms of Use
            </Link>
          </div>
        </div>
      )}

      <style>{`
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
