import { useState, useEffect } from "react";
import { X, Stethoscope, User, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useToastStore from "../../store/useToastStore";
import useLanguageStore from "../../store/useLanguageStore";
import { loginSchema, signupSchema } from "./authSchema";

export default function AuthModal({ onAuthSuccess }) {
  const {
    isAuthModalOpen,
    authModalMode,
    selectedModalRole,
    closeAuthModal,
    setAuthModalMode,
    setSelectedModalRole,
    login,
    signup,
  } = useAuthStore();

  const { showToast } = useToastStore();
  const { t } = useLanguageStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Validate with Zod
        const validationResult = loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
          role: selectedModalRole,
        });

        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0]?.message || "Invalid input data";
          showToast(firstError, "error");
          setIsSubmitting(false);
          return;
        }

        const user = await login({
          email: formData.email,
          password: formData.password,
          role: selectedModalRole,
        });

        showToast(`Welcome back, ${user.name}! Accessing ${user.role} portal.`, "success");
        if (onAuthSuccess) onAuthSuccess(user);
      } else {
        // Validate Signup with Zod
        const validationResult = signupSchema.safeParse({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedModalRole,
        });

        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0]?.message || "Invalid registration data";
          showToast(firstError, "error");
          setIsSubmitting(false);
          return;
        }

        const user = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedModalRole,
        });

        showToast(`Account created! Welcome, ${user.name}.`, "success");
        if (onAuthSuccess) onAuthSuccess(user);
      }
    } catch (err) {
      showToast(err.message || "Authentication failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoDoctor = () => {
    setSelectedModalRole("Ophthalmologist");
    setFormData({
      name: "Dr. Ananya Sharma",
      email: "dr.sharma@aims-hospital.org",
      password: "password123",
    });
  };

  const fillDemoPatient = () => {
    setSelectedModalRole("Patient");
    setFormData({
      name: "Ramesh Patil",
      email: "ramesh.patil@ruralphc.in",
      password: "password123",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="animate-modal-pop"
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid var(--saas-border)",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header with Title & Close button */}
        <div
          style={{
            padding: "24px 28px 18px",
            borderBottom: "1px solid var(--saas-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.28rem",
                fontWeight: 800,
                color: "var(--saas-fg)",
                letterSpacing: "-0.01em",
              }}
            >
              {isLogin ? t("authLoginTitle") : t("authSignupTitle")}
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.8125rem",
                color: "var(--saas-fg-muted)",
              }}
            >
              {isLogin ? t("authLoginSubtitle") : t("authSignupSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            style={{
              background: "transparent",
              border: "none",
              padding: "6px",
              borderRadius: "8px",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0F172A";
              e.currentTarget.style.backgroundColor = "#F1F5F9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94A3B8";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px 28px 28px" }}>
          {/* Role Switcher Segmented Tab */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--saas-fg-muted)",
                marginBottom: "8px",
              }}
            >
              {t("authRoleLabel")}
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                padding: "4px",
                backgroundColor: "var(--saas-bg-muted)",
                borderRadius: "12px",
                border: "1px solid var(--saas-border)",
                gap: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedModalRole("Patient")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  backgroundColor: selectedModalRole === "Patient" ? "#FFFFFF" : "transparent",
                  color: selectedModalRole === "Patient" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
                  boxShadow:
                    selectedModalRole === "Patient"
                      ? "0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                      : "none",
                }}
              >
                <User size={16} color={selectedModalRole === "Patient" ? "#0052FF" : "#64748B"} />
                <span>{t("rolePatient")}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModalRole("Ophthalmologist")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  backgroundColor: selectedModalRole === "Ophthalmologist" ? "#FFFFFF" : "transparent",
                  color: selectedModalRole === "Ophthalmologist" ? "var(--saas-fg)" : "var(--saas-fg-muted)",
                  boxShadow:
                    selectedModalRole === "Ophthalmologist"
                      ? "0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                      : "none",
                }}
              >
                <Stethoscope
                  size={16}
                  color={selectedModalRole === "Ophthalmologist" ? "#0052FF" : "#64748B"}
                />
                <span>{t("roleDoctor")}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {!isLogin && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--saas-fg)",
                    marginBottom: "6px",
                  }}
                >
                  {t("fullNameLabel")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder={selectedModalRole === "Ophthalmologist" ? "Dr. Priya Patel" : "Priya Patel"}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      height: "46px",
                      padding: "0 14px 0 40px",
                      borderRadius: "10px",
                      border: "1px solid var(--saas-border)",
                      fontSize: "0.9375rem",
                      backgroundColor: "var(--saas-bg-subtle)",
                      outline: "none",
                      color: "var(--saas-fg)",
                    }}
                  />
                  <User
                    size={18}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--saas-fg)",
                  marginBottom: "6px",
                }}
              >
                {t("emailLabel")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "46px",
                    padding: "0 14px 0 40px",
                    borderRadius: "10px",
                    border: "1px solid var(--saas-border)",
                    fontSize: "0.9375rem",
                    backgroundColor: "var(--saas-bg-subtle)",
                    outline: "none",
                    color: "var(--saas-fg)",
                  }}
                />
                <Mail
                  size={18}
                  color="#94A3B8"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--saas-fg)",
                  marginBottom: "6px",
                }}
              >
                {t("passwordLabel")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  placeholder={t("passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "46px",
                    padding: "0 14px 0 40px",
                    borderRadius: "10px",
                    border: "1px solid var(--saas-border)",
                    fontSize: "0.9375rem",
                    backgroundColor: "var(--saas-bg-subtle)",
                    outline: "none",
                    color: "var(--saas-fg)",
                  }}
                />
                <Lock
                  size={18}
                  color="#94A3B8"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="saas-btn-primary"
              style={{
                width: "100%",
                height: "46px",
                marginTop: "8px",
                fontSize: "0.9375rem",
              }}
            >
              <span>
                {isSubmitting
                  ? t("processing")
                  : isLogin
                  ? `${t("btnSignIn")} ${selectedModalRole === "Ophthalmologist" ? t("roleDoctor") : t("rolePatient")}`
                  : `${t("btnRegister")} ${selectedModalRole === "Ophthalmologist" ? t("roleDoctor") : t("rolePatient")}`}
              </span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick 1-Click Demo Fillers */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 82, 255, 0.04)",
              border: "1px dashed rgba(0, 82, 255, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--saas-accent)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={13} />
              <span>{t("demoCredentialsTitle")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={fillDemoDoctor}
                style={{
                  padding: "6px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--saas-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--saas-fg)",
                  textAlign: "center",
                }}
              >
                {t("fillDoctorDemo")}
              </button>
              <button
                type="button"
                onClick={fillDemoPatient}
                style={{
                  padding: "6px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--saas-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--saas-fg)",
                  textAlign: "center",
                }}
              >
                {t("fillPatientDemo")}
              </button>
            </div>
          </div>

          {/* Mode Switcher Link */}
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--saas-fg-muted)",
            }}
          >
            {isLogin ? (
              <span>
                {t("noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalMode("signup")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--saas-accent)",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {t("linkSignUp")}
                </button>
              </span>
            ) : (
              <span>
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--saas-accent)",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {t("linkLogIn")}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
