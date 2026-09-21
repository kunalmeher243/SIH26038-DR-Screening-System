import { Loader2 } from "lucide-react";

export default function LoadingFallback({ message = "Loading clinical workspace..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: "16px",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          size={24}
          color="#1976D2"
          style={{
            animation: "spin 1s linear infinite",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#64748B",
          margin: 0,
        }}
      >
        {message}
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
