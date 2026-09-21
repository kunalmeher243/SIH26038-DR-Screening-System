import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import { ArrowLeft, Clock, Calendar, CheckCircle2, AlertCircle, FileText, Check } from "lucide-react";
import apiClient from "../api/client";

export default function DoctorCaseDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For scheduling
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

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
  }, [id]);

  const handleAcceptAndSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please select a date and time for the consultation.");
      return;
    }
    
    setIsScheduling(true);
    const datetime = `${scheduleDate}T${scheduleTime}:00`;
    
    try {
      const res = await apiClient.post(`/api/tickets/${id}/schedule`, {
        scheduled_at: datetime
      });
      
      setTicket({ ...ticket, status: "accepted" });
      setSlot(res.data);
    } catch (err) {
      console.error(err);
      alert(err.userMessage || "Error scheduling consultation.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) return <div style={{ padding: "60px 24px", textAlign: "center", color: "#546E7A" }}>Loading clinical case details...</div>;
  if (!ticket) return <div style={{ padding: "60px 24px", textAlign: "center", color: "#E74C3C" }}>Ticket not found</div>;

  const isAccepted = ticket.status === "accepted";
  const isHighRisk = (ticket.dr_level || 0) >= 2;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "32px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: "1040px" }}>
        
        {/* BACK BUTTON (Section 9: White bg, Blue border, Blue text, Blue arrow icon) */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/doctor"
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
            <ArrowLeft size={16} /> Back to Cases
          </Link>
        </div>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          borderBottom: "1px solid #ECEFF1",
          paddingBottom: "18px"
        }}>
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#263238", margin: "0 0 6px 0" }}>
              Case Review: {ticket.patient_name}
            </h1>
            <p style={{ color: "#546E7A", fontSize: "0.95rem", margin: 0 }}>
              Referred by: <strong>{ticket.phc_email}</strong> • Assigned: {ticket.doctor_name}
            </p>
          </div>

          <div style={{
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: isAccepted ? "#E8F8F5" : "#FEF9E7",
            color: isAccepted ? "#16A085" : "#F39C12",
            border: `1px solid ${isAccepted ? "rgba(22, 160, 133, 0.3)" : "rgba(243, 156, 18, 0.3)"}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            fontSize: "0.85rem"
          }}>
            {isAccepted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
            {isAccepted ? "Accepted & Scheduled" : "Pending Review"}
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "flex-start" }}>
          
          {/* LEFT COLUMN: AI Findings, Evidence, & Grad-CAM */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* AI Findings Card */}
            <div className="card" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D9E2E8",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976D2" }} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#263238", margin: 0 }}>
                  AI SCREENING FINDINGS
                </h2>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div style={{
                  padding: "16px", backgroundColor: "#FFFFFF",
                  borderRadius: "10px", border: "1px solid #D9E2E8"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                    DR Severity Grade
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: isHighRisk ? "#E74C3C" : "#16A085" }}>
                    {ticket.dr_label}
                  </div>
                </div>

                <div style={{
                  padding: "16px", backgroundColor: "#FFFFFF",
                  borderRadius: "10px", border: "1px solid #D9E2E8"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                    Model Confidence
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1976D2" }}>
                    {Math.round((ticket.confidence || 0.95) * 100)}%
                  </div>
                </div>

                <div style={{
                  padding: "16px", backgroundColor: "#FFFFFF",
                  borderRadius: "10px", border: "1px solid #D9E2E8"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                    Image Quality
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: ticket.quality_label === "REJECT" ? "#E74C3C" : ticket.quality_label === "BORDERLINE" ? "#F39C12" : "#16A085" }}>
                    {ticket.quality_label || "GOOD"} ({Math.round((ticket.quality_score || 1) * 100)}%)
                  </div>
                </div>

                <div style={{
                  padding: "16px", backgroundColor: "#FFFFFF",
                  borderRadius: "10px", border: "1px solid #D9E2E8"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#546E7A", fontWeight: 600, marginBottom: "4px" }}>
                    Triage Recommendation
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: ticket.refer ? "#E74C3C" : "#16A085" }}>
                    {ticket.refer ? "Referral Required" : "Routine Follow-up"}
                  </div>
                </div>
              </div>

              {/* Evidence Statement */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#263238", marginBottom: "8px" }}>
                  Clinical Evidence Summary
                </h3>
                <p style={{
                  fontSize: "0.925rem", color: "#546E7A", lineHeight: 1.6,
                  backgroundColor: "#FAFAFA", padding: "14px 16px",
                  borderRadius: "10px", border: "1px solid #D9E2E8"
                }}>
                  {ticket.clinical_summary || ticket.evidence_statement || "Fundus examination shows characteristic microvascular patterns evaluated by deep learning ensemble."}
                </p>
              </div>
              
              {/* Grad-CAM Viewer */}
              {ticket.gradcam_b64 && (
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#263238", marginBottom: "8px" }}>
                    Explainability Heatmap (Grad-CAM)
                  </h3>
                  <div style={{ backgroundColor: "#0F172A", borderRadius: "10px", padding: "8px", display: "flex", justifyContent: "center" }}>
                    <img 
                      src={`data:image/png;base64,${ticket.gradcam_b64}`} 
                      alt="Grad-CAM Retina Explanation" 
                      style={{ maxWidth: "100%", maxHeight: "420px", borderRadius: "6px", objectFit: "contain" }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Consultation Scheduling & Chat */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Consultation Action Card */}
            <div className="card" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D9E2E8",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A085" }} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#263238", margin: 0 }}>
                  CONSULTATION
                </h2>
              </div>
              
              {isAccepted && slot ? (
                <div style={{
                  padding: "16px",
                  backgroundColor: "#E8F8F5",
                  borderRadius: "10px",
                  border: "1px solid rgba(22, 160, 133, 0.3)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16A085", fontWeight: 700, marginBottom: "6px" }}>
                    <CheckCircle2 size={18} /> Tele-Consultation Confirmed
                  </div>
                  <div style={{ color: "#263238", fontWeight: 600, fontSize: "0.95rem" }}>
                    {new Date(slot.scheduled_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#546E7A", marginBottom: "18px", lineHeight: 1.5 }}>
                    Confirm review and set an appointment for the patient and PHC worker.
                  </p>
                  
                  <div className="input-group" style={{ marginBottom: "14px" }}>
                    <label className="input-label">Date</label>
                    <input 
                      type="date" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group" style={{ marginBottom: "20px" }}>
                    <label className="input-label">Time</label>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* GREEN CONFIRMATION BUTTON (Section 3: Healthcare Confirmation) */}
                  <button 
                    type="button"
                    onClick={handleAcceptAndSchedule}
                    disabled={isScheduling}
                    className="btn btn-success"
                    style={{
                      width: "100%", padding: "13px", borderRadius: "10px",
                      fontWeight: 700, fontSize: "0.95rem"
                    }}
                  >
                    <Check size={18} />
                    {isScheduling ? "Confirming..." : "✓ Schedule Consultation"}
                  </button>
                </div>
              )}
            </div>

            {/* Chat Box with PHC Worker */}
            {isAccepted ? (
              <ChatBox ticketId={id} senderRole="doctor" senderName={ticket.doctor_name || "Doctor"} />
            ) : (
              <div className="card" style={{
                textAlign: "center",
                padding: "28px 20px",
                color: "#90A4AE",
                backgroundColor: "#FFFFFF",
                border: "1px dashed #D9E2E8",
                borderRadius: "16px",
                fontSize: "0.875rem"
              }}>
                Schedule consultation above to initiate live tele-chat with the PHC worker.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
