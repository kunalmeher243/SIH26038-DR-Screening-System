import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ShieldCheck, Stethoscope } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // Determine portal route
  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "PHC Worker" || user.portal === "phc") return "/phc";
    if (user.role === "Ophthalmologist" || user.portal === "doctor") return "/doctor";
    return "/patient";
  };

  const dashboardPath = getDashboardPath();

  const handleLogout = () => {
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
        padding: "0 24px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* BRAND LOGO: SERIX with retinal.png */}
        <Link to={dashboardPath} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <img 
            src="/retinal.png" 
            alt="SERIX Logo" 
            style={{ 
              height: "40px", 
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

        {/* ROLE-SPECIFIC LOGIN STATUS & ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthenticated && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {getRoleBadge()}
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  {user.name}
                </span>
              </div>
              <span style={{ color: "#D1D5DB", fontWeight: 300 }}>|</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  color: "#4B5563",
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
                  e.currentTarget.style.color = "#4B5563";
                }}
                title="Log out"
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
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#1976D2",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1565C0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1976D2"; }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
