import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, Calendar, FileText } from "lucide-react";
import apiClient from "../api/client";
import useAuthStore from "../store/useAuthStore";

export default function PatientTicketStatus() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await apiClient.get(`/api/tickets/${id}`);
        const data = res.data;
        setTicket(data);
        
        if (data.status === "accepted") {
          const slotRes = await apiClient.get(`/api/tickets/${id}/slot`);
          setSlot(slotRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div style={{ padding: "60px 24px", textAlign: "center", color: "#546E7A" }}>Loading screening record...</div>;
  if (!ticket) return <div style={{ padding: "60px 24px", textAlign: "center", color: "#E74C3C" }}>Ticket not found</div>;

  const isAccepted = ticket.status === "accepted";
  const isHighRisk = (ticket.dr_level || 0) >= 2;

  const getRiskBadge = () => {
    if (ticket.dr_level === 0) {
      return (
        <div style={{
          padding: "8px 16px", borderRadius: "20px",
          backgroundColor: "#E8F8F5", color: "#16A085",
          border: "1px solid rgba(22, 160, 133, 0.3)",
          fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
        }}>
          <CheckCircle2 size={16} /> LOW RISK
        </div>
      );
    }
    if (ticket.dr_level === 1) {
      return (
        <div style={{
          padding: "8px 16px", borderRadius: "20px",
          backgroundColor: "#FEF9E7", color: "#F39C12",
          border: "1px solid rgba(243, 156, 18, 0.3)",
          fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
        }}>
          <Clock size={16} /> MODERATE RISK
        </div>
      );
    }
    return (
      <div style={{
        padding: "8px 16px", borderRadius: "20px",
        backgroundColor: "#FDEDEC", color: "#E74C3C",
        border: "1px solid rgba(231, 76, 60, 0.3)",
        fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
      }}>
        <AlertTriangle size={16} /> HIGH RISK
      </div>
    );
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "32px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: "880px" }}>
        
        {/* BACK BUTTON (Section 9: White bg, Blue border, Blue text, Blue arrow icon) */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/patient"
            className="btn btn-outline-blue"
            style={{
              padding: "8px 18px",
              fontSize: "0.875rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px"
        }}>
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#263238", margin: "0 0 6px 0" }}>
              Screening Status & Consultation
            </h1>
            <p style={{ color: "#546E7A", fontSize: "0.95rem", margin: 0 }}>
              Assigned Specialist: <strong>{ticket.doctor_name}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {getRiskBadge()}
            <div style={{
              padding: "8px 16px", borderRadius: "20px",
              backgroundColor: isAccepted ? "#E8F8F5" : "#FEF9E7",
              color: isAccepted ? "#16A085" : "#F39C12",
              border: `1px solid ${isAccepted ? "rgba(22, 160, 133, 0.3)" : "rgba(243, 156, 18, 0.3)"}`,
              fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
            }}>
              {isAccepted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              {isAccepted ? "Doctor Scheduled" : "Doctor Reviewing"}
            </div>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="card" style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D9E2E8",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976D2" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#263238", margin: 0 }}>
              AI ASSESSMENT SUMMARY
            </h2>
          </div>

          {/* Key Metric Blocks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div style={{ padding: "16px", backgroundColor: "#FAFAFA", borderRadius: "10px", border: "1px solid #D9E2E8" }}>
              <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                AI Findings
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: isHighRisk ? "#E74C3C" : "#16A085" }}>
                {ticket.dr_label}
              </div>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#FAFAFA", borderRadius: "10px", border: "1px solid #D9E2E8" }}>
              <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                Confidence Score
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1976D2" }}>
                {Math.round((ticket.confidence || 0.95) * 100)}%
              </div>
            </div>
          </div>

          {/* Recommendation / Clinical Summary */}
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#263238", marginBottom: "8px" }}>
              Clinical Guidance
            </h3>
            <p style={{
              fontSize: "0.925rem", color: "#546E7A", lineHeight: 1.6,
              backgroundColor: "#FAFAFA", padding: "14px 16px",
              borderRadius: "10px", border: "1px solid #D9E2E8"
            }}>
              {ticket.clinical_summary || ticket.evidence_statement || "Your retinal screening scan has been processed. Please attend your scheduled tele-consultation for personal clinical review."}
            </p>
          </div>

          {/* Scheduled Slot Notice */}
          {slot && (
            <div style={{
              marginTop: "20px", padding: "16px",
              backgroundColor: "#E8F8F5", borderRadius: "10px",
              border: "1px solid rgba(22, 160, 133, 0.3)",
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <Calendar size={22} color="#16A085" />
              <div>
                <div style={{ fontSize: "0.85rem", color: "#16A085", fontWeight: 700 }}>
                  Confirmed Consultation Appointment
                </div>
                <div style={{ fontSize: "1rem", color: "#263238", fontWeight: 700 }}>
                  {new Date(slot.scheduled_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIVE CHAT */}
        {isAccepted ? (
          <div>
            <ChatBox ticketId={id} senderRole="patient" senderName={user?.name || "Patient"} />
          </div>
        ) : (
          <div className="card" style={{
            textAlign: "center", padding: "32px 20px", color: "#90A4AE",
            backgroundColor: "#FFFFFF", border: "1px dashed #D9E2E8", borderRadius: "16px", fontSize: "0.9rem"
          }}>
            Consultation chat will activate once Dr. {ticket.doctor_name} confirms your appointment.
          </div>
        )}

      </div>
    </div>
  );
}
