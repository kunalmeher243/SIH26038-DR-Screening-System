import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import { 
  ArrowLeft, Clock, CheckCircle2, AlertTriangle, Calendar, 
  ShieldCheck, ShieldAlert, Activity, User, Stethoscope, FileText 
} from "lucide-react";
import apiClient from "../api/client";
import useAuthStore from "../store/useAuthStore";
import usePageMeta from "../utils/usePageMeta";

export default function PatientTicketStatus() {
  const { id } = useParams();

  usePageMeta({
    title: `Consultation Status #${id ? id.slice(-6).toUpperCase() : ""} | SERIX Health`,
    description: "View doctor appointment schedule, clinical notes, and interactive ophthalmologist chat."
  });

  const [ticket, setTicket] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    let isMounted = true;

    const fetchTicket = async () => {
      try {
        const res = await apiClient.get(`/api/tickets/${id}`);
        if (!isMounted) return;
        setTicket(res.data);
        setErrorStatus(null);
        
        if (res.data.status === "accepted") {
          try {
            const slotRes = await apiClient.get(`/api/tickets/${id}/slot`);
            if (isMounted) setSlot(slotRes.data);
          } catch (slotErr) {
            console.log("No slot scheduled yet:", slotErr);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching ticket:", err);
        if (err?.response?.status === 403) {
          setErrorStatus(403);
        } else if (err?.response?.status === 404) {
          setErrorStatus(404);
        } else {
          setErrorStatus(500);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 68px)", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
        <div style={{ textAlign: "center" }}>
          <Activity size={32} color="#1976D2" style={{ animation: "spin 2s linear infinite", marginBottom: "12px" }} />
          <div>Retrieving verified screening record...</div>
        </div>
      </div>
    );
  }

  if (errorStatus === 403) {
    return (
      <div style={{ minHeight: "calc(100vh - 68px)", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          backgroundColor: "#FFFFFF",
          border: "1px solid #FECACA",
          borderRadius: "16px",
          padding: "40px 32px",
          boxShadow: "0 4px 20px rgba(220, 38, 38, 0.08)"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#FEF2F2",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px auto"
          }}>
            <ShieldAlert size={30} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1F2937", margin: "0 0 8px 0" }}>
            Access Restricted
          </h2>
          <p style={{ color: "#4B5563", fontSize: "0.925rem", lineHeight: 1.6, margin: "0 0 24px 0" }}>
            You do not have authorization to view this clinical case. For patient privacy, screenings are strictly isolated to the authenticated owner.
          </p>
          <Link
            to="/patient"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              backgroundColor: "#1976D2",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={16} /> Return to My Screenings
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === 404 || !ticket) {
    return (
      <div style={{ minHeight: "calc(100vh - 68px)", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "40px 32px"
        }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1F2937", margin: "0 0 8px 0" }}>
            Case Not Found
          </h2>
          <p style={{ color: "#6B7280", fontSize: "0.925rem", margin: "0 0 24px 0" }}>
            The requested screening record could not be found or has expired.
          </p>
          <Link
            to="/patient"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              backgroundColor: "#1976D2",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={16} /> Return to My Screenings
          </Link>
        </div>
      </div>
    );
  }

  const isAccepted = ticket.status === "accepted";
  const drLevel = ticket.dr_level || 0;
  const isHighRisk = drLevel >= 2;
  const confidencePercent = Math.round((ticket.confidence || 0.92) * 100);

  const getStatusColor = () => {
    if (drLevel === 0) return { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A085", label: "LOW RISK / NORMAL" };
    if (drLevel === 1) return { bg: "#FFFBEB", border: "#FDE68A", text: "#D97706", label: "MILD RETINOPATHY" };
    if (drLevel === 2) return { bg: "#FFF7ED", border: "#FED7AA", text: "#EA580C", label: "MODERATE DR" };
    if (drLevel === 3) return { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", label: "SEVERE DR" };
    return { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", label: "PROLIFERATIVE DR" };
  };

  const statusBadge = getStatusColor();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "32px 24px 60px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: "920px" }}>
        
        {/* BACK NAVIGATION */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/patient"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #1976D2",
              color: "#1976D2",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <ArrowLeft size={16} /> Back to My Screenings
          </Link>
        </div>

        {/* TOP STATUS HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Case File #{String(ticket._id).substring(0, 8).toUpperCase()}
              </span>
              <span>•</span>
              <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Screened Today"}
              </span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px 0" }}>
              Diabetic Retinopathy Screening Report
            </h1>
            <p style={{ color: "#4B5563", fontSize: "0.95rem", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <Stethoscope size={16} color="#16A085" />
              Assigned Specialist: <strong style={{ color: "#1F2937" }}>{ticket.doctor_name || "Specialist Ophthalmologist"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: statusBadge.bg,
              color: statusBadge.text,
              border: `1px solid ${statusBadge.border}`,
              fontWeight: 700,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              {isHighRisk ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              {statusBadge.label}
            </div>

            <div style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: isAccepted ? "#F0FDF4" : "#FFFBEB",
              color: isAccepted ? "#16A085" : "#D97706",
              border: `1px solid ${isAccepted ? "#BBF7D0" : "#FDE68A"}`,
              fontWeight: 700,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              {isAccepted ? <CheckCircle2 size={15} /> : <Clock size={15} />}
              {isAccepted ? "Doctor Confirmed" : "Specialist Reviewing"}
            </div>
          </div>
        </div>

        {/* HOSPITAL-GRADE FINAL ASSESSMENT CARD */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
          marginBottom: "28px"
        }}>
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6", paddingBottom: "18px", marginBottom: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={20} color="#1976D2" />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1976D2", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  AI Clinical Assessment
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1F2937" }}>
                  Final Graded Assessment
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#16A085", backgroundColor: "#F0FDF4", padding: "4px 10px", borderRadius: "12px", border: "1px solid #BBF7D0", fontWeight: 600 }}>
              <ShieldCheck size={14} /> ISO Quality Certified
            </div>
          </div>

          {/* Assessment Core Metrics Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}>
            {/* Finding Box */}
            <div style={{
              padding: "20px",
              backgroundColor: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              borderRadius: "12px"
            }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", marginBottom: "6px" }}>
                Graded Diagnostic Finding
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: statusBadge.text, marginBottom: "4px" }}>
                {ticket.dr_label}
              </div>
              <div style={{ fontSize: "0.825rem", color: "#6B7280" }}>
                Level {drLevel} of 4 Diabetic Retinopathy Scale
              </div>
            </div>

            {/* Confidence & Severity Indicator */}
            <div style={{
              padding: "20px",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>
                  AI Confidence Level
                </span>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1976D2" }}>
                  {confidencePercent}%
                </span>
              </div>
              
              {/* Visual Progress Meter */}
              <div style={{ width: "100%", height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  width: `${confidencePercent}%`,
                  height: "100%",
                  backgroundColor: "#1976D2",
                  borderRadius: "4px"
                }} />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6B7280", display: "flex", justifyContent: "space-between" }}>
                <span>Quality: <strong>{ticket.quality_label || "GOOD"}</strong></span>
                <span>Referral: <strong style={{ color: ticket.refer ? "#DC2626" : "#16A085" }}>{ticket.refer ? "Recommended" : "Routine Followup"}</strong></span>
              </div>
            </div>
          </div>

          {/* Clinical Guidance Text */}
          <div style={{ marginBottom: "22px" }}>
            <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "#1F2937", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
              Clinical Summary & Guidance
            </h3>
            <div style={{
              padding: "16px 18px",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              fontSize: "0.925rem",
              color: "#374151",
              lineHeight: 1.6
            }}>
              {ticket.clinical_summary || ticket.evidence_statement || (
                isHighRisk 
                  ? "Screening shows evidence consistent with advanced diabetic retinopathy. Prompt clinical review and specialized ophthalmology management are recommended to preserve vision."
                  : "Retinal photograph evaluation shows low likelihood of sight-threatening diabetic retinopathy. Continue annual screening and maintain glycemic monitoring."
              )}
            </div>
          </div>

          {/* Confirmed Tele-Consultation Banner (if booked) */}
          {slot && (
            <div style={{
              padding: "18px 20px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#16A085",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16A085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Confirmed Appointment Slot
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F2937" }}>
                  {new Date(slot.scheduled_at).toLocaleString(undefined, { 
                    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </div>
                <div style={{ fontSize: "0.825rem", color: "#4B5563", marginTop: "2px" }}>
                  Dr. {ticket.doctor_name} will be online at this time for live consultation.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECURE TELE-CONSULTATION CHAT */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1F2937", margin: 0 }}>
              Specialist Consultation Channel
            </h2>
          </div>

          {isAccepted ? (
            <ChatBox ticketId={id} senderRole="patient" senderName={user?.name || "Patient"} />
          ) : (
            <div style={{
              textAlign: "center",
              padding: "36px 24px",
              backgroundColor: "#FFFFFF",
              border: "1px dashed #D1D5DB",
              borderRadius: "16px",
              color: "#6B7280",
              fontSize: "0.925rem"
            }}>
              <Clock size={28} color="#9CA3AF" style={{ marginBottom: "10px" }} />
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Awaiting Specialist Acceptance
              </div>
              <div>
                The secure consultation chat will activate once Dr. {ticket.doctor_name || "your ophthalmologist"} accepts this screening case and reserves an appointment slot.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
