import { useState, useEffect } from "react";
import { Shield, ShieldCheck, X, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_PREF_KEY = "serix_storage_pref";

export default function StorageNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREF_KEY);
      if (!stored) {
        // Show banner after brief initial delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_PREF_KEY, "accepted");
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_PREF_KEY, "essential_only");
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Storage and privacy notice"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        zIndex: 9999,
        maxWidth: "420px",
        width: "calc(100vw - 32px)",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #D1D5DB",
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.16)",
        padding: "20px 22px",
        animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          backgroundColor: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <ShieldCheck size={20} color="#1976D2" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <h4 style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1E293B",
              margin: 0
            }}>
              Privacy & Storage Notice
            </h4>
            <button
              type="button"
              onClick={handleDecline}
              aria-label="Close notice"
              style={{
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px"
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            color: "#64748B",
            margin: "0 0 14px"
          }}>
            We use essential local storage to securely maintain your clinician/patient login session and interface language settings. No commercial tracking cookies are deployed.{" "}
            <Link to="/privacy" style={{ color: "#1976D2", fontWeight: 600, textDecoration: "underline" }}>
              Learn more
            </Link>.
          </p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleAccept}
              style={{
                flex: 1,
                padding: "8px 14px",
                backgroundColor: "#1976D2",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1565C0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1976D2"; }}
            >
              Accept All
            </button>

            <button
              type="button"
              onClick={handleDecline}
              style={{
                flex: 1,
                padding: "8px 14px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; }}
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
