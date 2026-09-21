import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, LogOut, User, ShieldCheck, Stethoscope } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
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

  // Nav items configuration
  const navItems = [
    { label: "Dashboard", path: dashboardPath },
    { label: "Screenings", path: dashboardPath },
    { label: "Patients", path: dashboardPath },
    { label: "Reports", path: dashboardPath },
  ];

  const isCurrentActive = (itemPath) => {
    if (location.pathname === "/" && itemPath === "/") return true;
    if (itemPath !== "/" && location.pathname.startsWith(itemPath)) return true;
    return false;
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const isDoctor = user.role === "Ophthalmologist" || user.portal === "doctor";
    const isPHC = user.role === "PHC Worker" || user.portal === "phc";

    if (isDoctor) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "4px 10px", borderRadius: "16px",
          backgroundColor: "#F0FDF4", color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontSize: "0.75rem", fontWeight: 700
        }}>
          <Stethoscope size={13} /> Doctor
        </span>
      );
    }

    if (isPHC) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "4px 10px", borderRadius: "16px",
          backgroundColor: "#E8F8F5", color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontSize: "0.75rem", fontWeight: 700
        }}>
          <ShieldCheck size={13} /> PHC Worker
        </span>
      );
    }

    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 10px", borderRadius: "16px",
        backgroundColor: "#E3F2FD", color: "#1976D2",
        border: "1px solid rgba(25, 118, 210, 0.3)",
        fontSize: "0.75rem", fontWeight: 700
      }}>
        <User size={13} /> Patient
      </span>
    );
  };

  return (
    <header style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 2px 10px rgba(30, 60, 90, 0.04)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* LOGO: Blue + Green */}
        <Link to={dashboardPath} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            backgroundColor: "#E3F2FD",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(25, 118, 210, 0.2)"
          }}>
            <Eye size={22} color="#1976D2" strokeWidth={2.4} />
          </div>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1976D2", letterSpacing: "-0.02em" }}>
              RetinaTrack
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#16A085", marginLeft: "4px" }}>
              AI
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        {isAuthenticated && (
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {navItems.map((item, idx) => {
              const active = idx === 0 && isCurrentActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    position: "relative",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.925rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#1976D2" : "#546E7A",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    backgroundColor: active ? "rgba(25, 118, 210, 0.06)" : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "rgba(25, 118, 210, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {item.label}
                  {active && (
                    <span style={{
                      position: "absolute",
                      bottom: "-10px",
                      left: "14px",
                      right: "14px",
                      height: "3px",
                      backgroundColor: "#1976D2",
                      borderRadius: "2px"
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* USER PROFILE & ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {isAuthenticated && user ? (
            <>
              {getRoleBadge()}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#263238" }}>
                  {user.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#90A4AE" }}>
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline-gray"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "6px"
                }}
                title="Log out"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link to="/" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem" }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
