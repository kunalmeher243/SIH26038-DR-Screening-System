import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import { ArrowLeft, Clock, Calendar, CheckCircle } from "lucide-react";
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
      alert(err.userMessage || "Error scheduling.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading case details...</div>;
  if (!ticket) return <div style={{ padding: '40px', textAlign: 'center' }}>Ticket not found</div>;

  const isAccepted = ticket.status === "accepted";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '24px' }}>
        <Link to="/doctor" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--saas-accent)', textDecoration: 'none', fontWeight: 600, marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to List
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--saas-fg)', margin: 0 }}>Case Review</h1>
        <p style={{ color: 'var(--saas-fg-muted)' }}>Patient: {ticket.patient_name}</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '1000px', alignItems: 'flex-start' }}>
        
        {/* Left Column: AI Findings & Images */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--saas-border)', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0' }}>AI Initial Findings</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>DR Level</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: ticket.dr_level >= 2 ? '#ef4444' : 'var(--saas-fg)' }}>
                  {ticket.dr_label}
                </div>
              </div>
              <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>Confidence</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--saas-fg)' }}>
                  {Math.round(ticket.confidence * 100)}%
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>Image Quality</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: ticket.quality_label === 'REJECT' ? '#ef4444' : ticket.quality_label === 'BORDERLINE' ? '#d97706' : '#22c55e' }}>
                  {ticket.quality_label || "GOOD"} ({Math.round((ticket.quality_score || 1) * 100)}%)
                </div>
                {ticket.quality_issues && ticket.quality_issues.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>
                    Issues: {ticket.quality_issues.join(", ")}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>Clinical Action</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: ticket.refer ? '#ef4444' : '#22c55e' }}>
                  {ticket.refer ? 'Referral Recommended' : 'No Referral Needed'}
                </div>
                {ticket.refer && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginTop: '4px' }}>
                    Routing: {ticket.routing || "STANDARD_REFERRAL"}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 12px 0' }}>Evidence Summary</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--saas-fg-muted)', lineHeight: 1.5, backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
              {ticket.clinical_summary || ticket.evidence_statement || "No detailed summary available."}
            </p>
            
            {ticket.gradcam_b64 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 12px 0' }}>Grad-CAM Explanation</h3>
                <img 
                  src={`data:image/png;base64,${ticket.gradcam_b64}`} 
                  alt="Grad-CAM" 
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--saas-border)' }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Chat */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--saas-border)', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0' }}>Consultation</h2>
            
            {isAccepted && slot ? (
              <div style={{ padding: '16px', backgroundColor: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>
                  <CheckCircle size={18} /> Scheduled
                </div>
                <div style={{ color: 'var(--saas-fg)', fontWeight: 500 }}>
                  {new Date(slot.scheduled_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--saas-fg-muted)', marginBottom: '16px' }}>
                  Review the AI findings and schedule a consultation with the patient at the PHC.
                </p>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--saas-border)' }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--saas-border)' }}
                  />
                </div>

                <button 
                  onClick={handleAcceptAndSchedule}
                  disabled={isScheduling}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0052FF', color: '#fff',
                    border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <Calendar size={18} />
                  {isScheduling ? "Scheduling..." : "Accept & Schedule"}
                </button>
              </div>
            )}
          </div>

          {isAccepted ? (
            <ChatBox ticketId={id} senderRole="doctor" senderName="Dr. Demo" />
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--saas-fg-muted)', backgroundColor: '#fff', border: '1px dashed var(--saas-border)', borderRadius: '16px' }}>
              Accept and schedule to unlock chat with the PHC worker.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
