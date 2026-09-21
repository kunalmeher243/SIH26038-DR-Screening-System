import { Link } from "react-router-dom";
import { EyeOff, Home, ArrowLeft } from "lucide-react";
import usePageMeta from "../utils/usePageMeta";

export default function NotFound() {
  usePageMeta({
    title: "404 - Page Not Found | SERIX AI Retinal Screening",
    description: "The requested clinical route or page does not exist on the SERIX screening platform."
  });

  return (
    <div style={{
      minHeight: "calc(100vh - 140px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      padding: "48px 24px",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Eye Graphic Container */}
        <div style={{
          width: "88px",
          height: "88px",
          borderRadius: "24px",
          backgroundColor: "#EFF6FF",
          border: "1px solid #DBEAFE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.12)"
        }}>
          <EyeOff size={44} color="#1976D2" />
        </div>

        {/* 404 Badge */}
        <div style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "16px",
          backgroundColor: "#FEF2F2",
          color: "#DC2626",
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          marginBottom: "12px"
        }}>
          HTTP 404 ERROR
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#1E293B",
          marginBottom: "12px",
          letterSpacing: "-0.02em"
        }}>
          Retinal Path Not Found
        </h1>

        <p style={{
          fontSize: "0.95rem",
          lineHeight: 1.6,
          color: "#64748B",
          marginBottom: "32px"
        }}>
          The medical workspace or patient route you are looking for has been moved, archived, or is currently unavailable.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              backgroundColor: "#1976D2",
              color: "#FFFFFF",
              fontSize: "0.925rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1565C0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1976D2"; }}
          >
            <Home size={18} /> Back to Home / Login
          </Link>
        </div>
      </div>
    </div>
  );
}
