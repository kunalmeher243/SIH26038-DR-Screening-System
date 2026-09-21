import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Heart, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useToastStore from "../store/useToastStore";
import usePageMeta from "../utils/usePageMeta";
import { loginSchema, signupSchema } from "../utils/validationSchemas";

export default function Login() {
  usePageMeta({
    title: "Sign In & Register | SERIX AI Retinal Screening",
    description: "Access the SERIX healthcare screening portal for Patients, PHC Workers, and Ophthalmologists."
  });

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Patient");
  const [honeypot, setHoneypot] = useState(""); // Bot spam protection
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Honeypot spam bot protection
    if (honeypot) {
      console.warn("Spam submission blocked by honeypot filter.");
      // Silently pretend success
      return;
    }

    const payload = isLogin
      ? { email, password, role, honeypot }
      : { name, email, password, role, honeypot };

    const schema = isLogin ? loginSchema : signupSchema;
    const validation = schema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        const fieldName = err.path[0] || "form";
        fieldErrors[fieldName] = err.message;
      });
      setValidationErrors(fieldErrors);
      showToast(validation.error.errors[0]?.message || "Please fix the validation errors.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const user = await login({ email, password, role });
        showToast(`Welcome back, ${user.name}`, "success");
        navigate(`/${user.portal}`);
      } else {
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
      backgroundColor: "#F8FAFC",
      padding: "32px 20px"
    }}>
      {/* LOGIN CARD */}
      <div className="card glass-panel" style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 8px 30px rgba(30, 60, 90, 0.08)",
        borderRadius: "16px",
        padding: "36px 32px"
      }}>
        <h1 style={{
          marginBottom: "8px",
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "#0F172A",
          textAlign: "center"
        }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{
          marginBottom: "24px",
          fontSize: "0.95rem",
          color: "#475569",
          textAlign: "center"
        }}>
          {isLogin ? "Sign in to access your screening workspace" : "Register to start screening & tele-consultations"}
        </p>

        {/* Global validation banner */}
        {Object.keys(validationErrors).length > 0 && (
          <div style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#DC2626",
            fontSize: "0.85rem"
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{Object.values(validationErrors)[0]}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot field for bot/spam protection */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: "none" }}
            tabIndex="-1"
            autoComplete="off"
          />

          {!isLogin && (
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label className="input-label" style={{ color: "#334155", fontWeight: 600 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)", color: "#64748B"
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationErrors.name) setValidationErrors({ ...validationErrors, name: null });
                  }}
                  placeholder="e.g. Dr. Jane Smith"
                  className="input-field"
                  style={{
                    paddingLeft: "42px",
                    borderColor: validationErrors.name ? "#DC2626" : "#CBD5E1"
                  }}
                />
              </div>
              {validationErrors.name && (
                <span style={{ fontSize: "0.8rem", color: "#DC2626", marginTop: "4px", display: "block" }}>
                  {validationErrors.name}
                </span>
              )}
            </div>
          )}

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label className="input-label" style={{ color: "#334155", fontWeight: 600 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "#64748B"
              }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({ ...validationErrors, email: null });
                }}
                placeholder="you@hospital.org"
                className="input-field"
                style={{
                  paddingLeft: "42px",
                  borderColor: validationErrors.email ? "#DC2626" : "#CBD5E1"
                }}
              />
            </div>
            {validationErrors.email && (
              <span style={{ fontSize: "0.8rem", color: "#DC2626", marginTop: "4px", display: "block" }}>
                {validationErrors.email}
              </span>
            )}
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="input-label" style={{ marginBottom: 0, color: "#334155", fontWeight: 600 }}>Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => showToast("Demo reset instructions sent to your registered medical email.", "info")}
                  style={{
                    fontSize: "0.825rem",
                    color: "#1976D2",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "#64748B"
              }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: null });
                }}
                placeholder="••••••••"
                className="input-field"
                style={{
                  paddingLeft: "42px",
                  borderColor: validationErrors.password ? "#DC2626" : "#CBD5E1"
                }}
              />
            </div>
            {validationErrors.password && (
              <span style={{ fontSize: "0.8rem", color: "#DC2626", marginTop: "4px", display: "block" }}>
                {validationErrors.password}
              </span>
            )}
          </div>

          {/* ROLE SELECTOR */}
          <div className="input-group" style={{ marginBottom: "24px" }}>
            <label className="input-label" style={{ color: "#334155", fontWeight: 600 }}>Select Workspace Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {/* Patient */}
              <button
                type="button"
                onClick={() => setRole("Patient")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px",
                  borderRadius: "10px",
                  border: role === "Patient" ? "2px solid #1976D2" : "1px solid #CBD5E1",
                  backgroundColor: role === "Patient" ? "#EFF6FF" : "#FFFFFF",
                  boxShadow: role === "Patient" ? "0 2px 8px rgba(25, 118, 210, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease"
                }}
              >
                <Heart size={22} color={role === "Patient" ? "#1976D2" : "#64748B"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "Patient" ? 700 : 600,
                  color: role === "Patient" ? "#1976D2" : "#475569"
                }}>
                  Patient
                </span>
              </button>

              {/* PHC Worker */}
              <button
                type="button"
                onClick={() => setRole("PHC Worker")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px",
                  borderRadius: "10px",
                  border: role === "PHC Worker" ? "2px solid #16A085" : "1px solid #CBD5E1",
                  backgroundColor: role === "PHC Worker" ? "#ECFDF5" : "#FFFFFF",
                  boxShadow: role === "PHC Worker" ? "0 2px 8px rgba(22, 160, 133, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease"
                }}
              >
                <ShieldCheck size={22} color={role === "PHC Worker" ? "#16A085" : "#64748B"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "PHC Worker" ? 700 : 600,
                  color: role === "PHC Worker" ? "#16A085" : "#475569"
                }}>
                  PHC Worker
                </span>
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => setRole("Ophthalmologist")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px",
                  borderRadius: "10px",
                  border: role === "Ophthalmologist" ? "2px solid #1976D2" : "1px solid #CBD5E1",
                  backgroundColor: role === "Ophthalmologist" ? "#EFF6FF" : "#FFFFFF",
                  boxShadow: role === "Ophthalmologist" ? "0 2px 8px rgba(25, 118, 210, 0.15)" : "none",
                  cursor: "pointer", transition: "all 0.18s ease"
                }}
              >
                <Stethoscope size={22} color={role === "Ophthalmologist" ? "#1976D2" : "#64748B"} />
                <span style={{
                  fontSize: "0.825rem",
                  fontWeight: role === "Ophthalmologist" ? 700 : 600,
                  color: role === "Ophthalmologist" ? "#1976D2" : "#475569"
                }}>
                  Doctor
                </span>
              </button>
            </div>
          </div>

          {/* SIGN IN / CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: "10px",
              backgroundColor: "#1976D2",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)"
            }}
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In to Workspace" : "Create Clinical Account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem", color: "#475569" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setValidationErrors({});
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1976D2",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
