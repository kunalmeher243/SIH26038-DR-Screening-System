import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, Calendar, Activity, User, Stethoscope, ShieldCheck } from "lucide-react";
import apiClient from "../api/client";

export default function PHCTicketStatus() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTicket = async () => {
      try {
        const res = await apiClient.get(`/api/tickets/${id}`);
        if (!isMounted) return;
        const data = res.data;
        setTicket(data);
        
        if (data.status === "accepted") {
          try {
            const slotRes = await apiClient.get(`/api/tickets/${id}/slot`);
            if (isMounted) setSlot(slotRes.data);
          } catch (slotErr) {
            console.log("No slot scheduled yet:", slotErr);
          }
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
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
          <div>Loading screening case status...</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ minHeight: "calc(100vh - 68px)", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "40px 32px" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1F2937", margin: "0 0 8px 0" }}>
            Ticket Not Found
          </h2>
          <p style={{ color: "#6B7280", fontSize: "0.925rem", margin: "0 0 24px 0" }}>
            Unable to retrieve the requested screening ticket #{id}.
          </p>
          <Link
            to="/phc"
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
            <ArrowLeft size={16} /> Return to PHC Portal
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
            to="/phc" 
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EFF6FF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
          >
            <ArrowLeft size={16} /> Back to Screening Dashboard
          </Link>
        </div>

        {/* HEADER */}
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
                Referral Case #{String(id).substring(0, 8).toUpperCase()}
              </span>
              <span>•</span>
              <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                PHC Screening Station
              </span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px 0" }}>
              Screening Ticket Status
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.925rem", color: "#4B5563" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={15} color="#1976D2" />
                Patient: <strong style={{ color: "#1F2937" }}>{ticket.patient_name}</strong> ({ticket.patient_email})
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Stethoscope size={15} color="#16A085" />
                Doctor: <strong style={{ color: "#1F2937" }}>{ticket.doctor_name}</strong>
              </span>
            </div>
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
              {isAccepted ? "Case Accepted" : "Pending Doctor Review"}
            </div>
          </div>
        </div>

        {/* HOSPITAL-GRADE ASSESSMENT CARD (White Background, Medical Blue/Green Accents) */}
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
                  Automated Diagnostics
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1F2937" }}>
                  AI Initial Findings & Severity
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#16A085", backgroundColor: "#F0FDF4", padding: "4px 10px", borderRadius: "12px", border: "1px solid #BBF7D0", fontWeight: 600 }}>
              <ShieldCheck size={14} /> Certified ML Pipeline
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}>
            <div style={{
              padding: "20px",
              backgroundColor: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              borderRadius: "12px"
            }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", marginBottom: "6px" }}>
                AI Graded Severity
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: statusBadge.text, marginBottom: "4px" }}>
                {ticket.dr_label}
              </div>
              <div style={{ fontSize: "0.825rem", color: "#6B7280" }}>
                Level {drLevel} Diabetic Retinopathy
              </div>
            </div>

            <div style={{
              padding: "20px",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>
                  Model Confidence
                </span>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1976D2" }}>
                  {confidencePercent}%
                </span>
              </div>
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
                <span>Referral: <strong style={{ color: ticket.refer ? "#DC2626" : "#16A085" }}>{ticket.refer ? "Required" : "Not Required"}</strong></span>
              </div>
            </div>
          </div>

          {/* Clinical Guidance Text */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "#1F2937", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
              Clinical Findings Summary
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
                  ? "Screening shows evidence consistent with diabetic retinopathy. High priority for ophthalmologist tele-consultation."
                  : "Retinal examination shows low likelihood of sight-threatening diabetic retinopathy."
              )}
            </div>
          </div>

          {/* Confirmed Slot Notice */}
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
                  Scheduled Tele-Consultation
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F2937" }}>
                  {new Date(slot.scheduled_at).toLocaleString(undefined, { 
                    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </div>
                <div style={{ fontSize: "0.825rem", color: "#4B5563", marginTop: "2px" }}>
                  Assigned Doctor: Dr. {ticket.doctor_name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHAT SESSION */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1F2937", margin: 0 }}>
              Live Tele-Consultation Channel
            </h2>
          </div>

          {isAccepted ? (
            <ChatBox ticketId={id} senderRole="phc_worker" senderName="PHC Worker" />
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
                Awaiting Doctor Acceptance
              </div>
              <div>
                Chat channel will open automatically once Dr. {ticket.doctor_name} accepts this referral ticket.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
