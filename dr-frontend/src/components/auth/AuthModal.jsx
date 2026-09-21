import { useEffect, useState } from "react";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from "lucide-react";

import useAuthStore from "../../store/useAuthStore";
import useToastStore from "../../store/useToastStore";
import useLanguageStore from "../../store/useLanguageStore";
import { loginSchema, signupSchema } from "./authSchema";

const ROLES = [
  {
    id: "Patient",
    label: "Patient",
    icon: User,
    description: "View screening results and care options.",
  },
  {
    id: "PHC Worker",
    label: "PHC Worker",
    icon: ShieldCheck,
    description: "Capture retinal images and create screening cases.",
  },
  {
    id: "Ophthalmologist",
    label: "Ophthalmologist",
    icon: Stethoscope,
    description: "Review AI-assisted cases and record clinical decisions.",
  },
];

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

  useEffect(() => {
    if (isAuthModalOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const selectedRole =
    ROLES.find((role) => role.id === selectedModalRole) || ROLES[0];

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...(isLogin ? {} : { name: formData.name }),
        email: formData.email,
        password: formData.password,
        role: selectedModalRole,
      };

      const schema = isLogin ? loginSchema : signupSchema;
      const validationResult = schema.safeParse(payload);

      if (!validationResult.success) {
        const firstError =
          validationResult.error.errors?.[0]?.message ||
          "Please check the entered information.";

        showToast(firstError, "error");
        return;
      }

      const user = isLogin
        ? await login(payload)
        : await signup(payload);

      showToast(
        isLogin
          ? `Welcome back, ${user.name}.`
          : `Account created. Welcome, ${user.name}.`,
        "success"
      );

      onAuthSuccess?.(user);
    } catch (error) {
      showToast(
        error?.message || "Authentication failed. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(15, 23, 42, 0.48)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div
        className="animate-modal-pop"
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D9E2E8",
          borderRadius: "22px",
          boxShadow: "0 20px 50px rgba(30, 60, 90, 0.15)",
        }}
      >
        <div
          style={{
            padding: "24px 28px 18px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--color-text)",
              }}
            >
              {isLogin
                ? t("authLoginTitle")
                : t("authSignupTitle")}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "0.82rem",
                lineHeight: 1.45,
                color: "var(--color-text-muted)",
              }}
            >
              {isLogin
                ? "Choose your role to access the appropriate SERIX workspace."
                : "Create an account for the SERIX healthcare workflow."}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close authentication dialog"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              flexShrink: 0,
              border: "none",
              borderRadius: "9px",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={19} />
          </button>
        </div>

        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                marginBottom: "9px",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Account role
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              {ROLES.map((role) => {
                const Icon = role.icon;
                const active = selectedModalRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedModalRole(role.id)}
                    style={{
                      minHeight: "88px",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      borderRadius: "12px",
                      border: active
                        ? "1.5px solid #1976D2"
                        : "1px solid #D9E2E8",
                      backgroundColor: active
                        ? "rgba(25, 118, 210, 0.08)"
                        : "#FFFFFF",
                      color: active
                        ? "#1976D2"
                        : "#263238",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <Icon size={19} />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        lineHeight: 1.2,
                        fontWeight: 750,
                        textAlign: "center",
                      }}
                    >
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p
              style={{
                margin: "9px 2px 0",
                fontSize: "0.76rem",
                lineHeight: 1.4,
                color: "var(--color-text-muted)",
              }}
            >
              {selectedRole.description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {!isLogin && (
              <Field
                label={t("fullNameLabel")}
                icon={<User size={18} />}
              >
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={
                    selectedModalRole === "Ophthalmologist"
                      ? "Dr. Priya Patel"
                      : selectedModalRole === "PHC Worker"
                      ? "Asha Kumari"
                      : "Priya Patel"
                  }
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                />
              </Field>
            )}

            <Field label={t("emailLabel")} icon={<Mail size={18} />}>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={(event) =>
                  handleInputChange("email", event.target.value)
                }
              />
            </Field>

            <Field
              label={t("passwordLabel")}
              icon={<Lock size={18} />}
            >
              <input
                type="password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={(event) =>
                  handleInputChange("password", event.target.value)
                }
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: "100%",
                height: "46px",
                marginTop: "4px",
                fontSize: "0.92rem",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <span>
                {isSubmitting
                  ? t("processing")
                  : isLogin
                  ? `Sign in as ${selectedRole.label}`
                  : `Create ${selectedRole.label} account`}
              </span>
              <ArrowRight size={17} />
            </button>
          </form>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop: "1px solid var(--color-border)",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
            }}
          >
            {isLogin ? (
              <>
                {t("noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalMode("signup")}
                  style={linkStyle}
                >
                  {t("linkSignUp")}
                </button>
              </>
            ) : (
              <>
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  style={linkStyle}
                >
                  {t("linkLogIn")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "0.8125rem",
          fontWeight: 650,
          color: "var(--color-text)",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            color: "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>

        {children}

        <style>{`
          input {
            width: 100%;
            box-sizing: border-box;
            height: 46px;
            padding: 0 14px 0 40px;
            border-radius: 10px;
            border: 1px solid #D9E2E8;
            background: #FFFFFF;
            color: #263238;
            font-size: 0.9375rem;
            outline: none;
            transition: all 0.2s ease;
          }

          input:focus {
            border-color: #1976D2;
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.10);
          }
        `}</style>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: 0,
  border: "none",
  background: "transparent",
  color: "var(--color-primary)",
  fontWeight: 750,
  cursor: "pointer",
  textDecoration: "underline",
};
