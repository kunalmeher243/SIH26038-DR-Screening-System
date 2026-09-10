import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import useToastStore from "../../store/useToastStore";

export default function Toast() {
  const { message, type, visible, hideToast } = useToastStore();

  if (!visible || !message) return null;

  const isError = type === "error";
  const isWarning = type === "warning";
  const isSuccess = type === "success";

  const getBorderColor = () => {
    if (isError) return "#EF4444";
    if (isWarning) return "#F59E0B";
    if (isSuccess) return "#10B981";
    return "#0052FF";
  };

  const getBgColor = () => {
    if (isError) return "#FEF2F2";
    if (isWarning) return "#FFFBEB";
    if (isSuccess) return "#ECFDF5";
    return "#EFF6FF";
  };

  const getIcon = () => {
    if (isError) return <AlertCircle size={20} color="#DC2626" />;
    if (isWarning) return <AlertTriangle size={20} color="#D97706" />;
    if (isSuccess) return <CheckCircle2 size={20} color="#059669" />;
    return <Info size={20} color="#0052FF" />;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "92vw",
        width: "480px",
      }}
      className="animate-toast-slide"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "14px 18px",
          backgroundColor: "#FFFFFF",
          border: `1.5px solid ${getBorderColor()}`,
          borderRadius: "12px",
          boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            marginTop: "1px",
            padding: "4px",
            borderRadius: "8px",
            backgroundColor: getBgColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getIcon()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: getBorderColor(),
              fontFamily: "var(--font-mono)",
            }}
          >
            {isError ? "Validation / System Alert" : isWarning ? "Notice" : isSuccess ? "Success" : "Information"}
          </p>
          <p
            style={{
              margin: "3px 0 0 0",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#1E293B",
              lineHeight: 1.45,
            }}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss Notification"
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
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
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
