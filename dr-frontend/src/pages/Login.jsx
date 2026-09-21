import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Heart, Lock, Mail, Eye, ShieldCheck } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useToastStore from "../store/useToastStore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Patient");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const signup = useAuthStore(state => state.signup);
  const showToast = useToastStore(state => state.showToast);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login({ email, password, role });
        showToast(`Welcome back, ${user.name}`, "success");
        navigate(`/${user.portal}`);
      } else {
        if (!name) throw new Error("Name is required");
        const user = await signup({ name, email, password, role });
        showToast(`Account created successfully`, "success");
        navigate(`/${user.portal}`);
      }
    } catch (err) {
      showToast(err.userMessage || err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "32px 24px"
    }}>
      {/* BRAND LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          backgroundColor: "#E3F2FD",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(25, 118, 210, 0.25)"
        }}>
          <Eye size={26} color="#1976D2" strokeWidth={2.5} />
        </div>
        <div>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1976D2", letterSpacing: "-0.02em" }}>
            RetinaTrack
          </span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16A085", marginLeft: "4px" }}>
            AI
          </span>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="card glass-panel" style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #D9E2E8",
        boxShadow: "0 8px 30px rgba(30, 60, 90, 0.08)",
        borderRadius: "16px",
        padding: "36px 32px"
      }}>
        <h1 style={{
          marginBottom: "8px",
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "#263238",
          textAlign: "center"
        }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{
          marginBottom: "28px",
          fontSize: "0.95rem",
          color: "#546E7A",
          textAlign: "center"
        }}>
          {isLogin ? "Sign in to access your screening workspace" : "Register to start screening & consultations"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)", color: "#90A4AE"
                }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "#90A4AE"
              }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              {isLogin && (
                <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast("Demo reset link: use password 'password'", "info"); }} style={{ fontSize: "0.825rem", color: "#1976D2", fontWeight: 600 }}>
                  Forgot password?
                </a>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "#90A4AE"
              }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* ROLE SELECTOR (Section 15 & 16) */}
          <div className="input-group" style={{ marginBottom: "24px" }}>
            <label className="input-label">Select Workspace Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {/* Patient: Blue Accent */}
              <button 
                type="button"
                onClick={() => setRole("Patient")}
                style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px", 
                  borderRadius: "10px", 
                  border: role === "Patient" ? "2px solid #1976D2" : "1px solid #D9E2E8", 
                  backgroundColor: role === "Patient" ? "#E3F2FD" : "#FFFFFF", 
                  boxShadow: role === "Patient" ? "0 2px 8px rgba(25, 118, 210, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease" 
                }}
              >
                <Heart size={22} color={role === "Patient" ? "#1976D2" : "#90A4AE"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "Patient" ? 700 : 500,
                  color: role === "Patient" ? "#1976D2" : "#546E7A"
                }}>
                  Patient
                </span>
              </button>
              
              {/* PHC Worker: Green Accent */}
              <button 
                type="button"
                onClick={() => setRole("PHC Worker")}
                style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px", 
                  borderRadius: "10px", 
                  border: role === "PHC Worker" ? "2px solid #16A085" : "1px solid #D9E2E8", 
                  backgroundColor: role === "PHC Worker" ? "#E8F8F5" : "#FFFFFF", 
                  boxShadow: role === "PHC Worker" ? "0 2px 8px rgba(22, 160, 133, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease" 
                }}
              >
                <ShieldCheck size={22} color={role === "PHC Worker" ? "#16A085" : "#90A4AE"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "PHC Worker" ? 700 : 500,
                  color: role === "PHC Worker" ? "#16A085" : "#546E7A"
                }}>
                  PHC Worker
                </span>
              </button>

              {/* Doctor: Blue + Green Medical Accent */}
              <button 
                type="button"
                onClick={() => setRole("Ophthalmologist")}
                style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px", 
                  borderRadius: "10px", 
                  border: role === "Ophthalmologist" ? "2px solid #1976D2" : "1px solid #D9E2E8", 
                  backgroundColor: role === "Ophthalmologist" ? "#F0FDF4" : "#FFFFFF", 
                  boxShadow: role === "Ophthalmologist" ? "0 2px 8px rgba(22, 160, 133, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease" 
                }}
              >
                <Stethoscope size={22} color={role === "Ophthalmologist" ? "#16A085" : "#90A4AE"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "Ophthalmologist" ? 700 : 500,
                  color: role === "Ophthalmologist" ? "#1976D2" : "#546E7A"
                }}>
                  Doctor
                </span>
              </button>
            </div>
          </div>

          {/* SIGN IN BUTTON: BLUE FILLED */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: 700, borderRadius: "10px" }}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem", color: "#546E7A" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: "none", border: "none", color: "#1976D2", fontWeight: 700, cursor: "pointer", padding: 0 }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
