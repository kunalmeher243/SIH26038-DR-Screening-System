import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
import LiquidGlass from "../components/LiquidGlass";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import apiClient from "../api/client";

export default function PHCTicketStatus() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // Refresh status every 10 seconds
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!ticket) return <div style={{ padding: '40px', textAlign: 'center' }}>Ticket not found</div>;

  const isAccepted = ticket.status === "accepted";

  const getSeverityClass = () => {
    if (ticket.dr_level === 0) return "normal";
    if (ticket.dr_level === 1) return "mild";
    if (ticket.dr_level >= 2) return "severe";
    return "moderate";
  };

  const severityClass = getSeverityClass();

  const severityText =
    severityClass === "normal"
      ? "Normal / Low Risk"
      : severityClass === "mild"
      ? "Mild / Low Risk"
      : severityClass === "moderate"
      ? "Moderate Risk"
      : "High Risk";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '24px' }}>
        <Link to="/phc" className="btn-outline-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> [ ← Back to Portal ]
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Ticket Status</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Ticket ID: {id}</p>
      </div>

      <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Patient: {ticket.patient_name}</h2>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Email: {ticket.patient_email}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Assigned Doctor: {ticket.doctor_name}</div>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: isAccepted ? 'rgba(22,160,133,0.1)' : 'rgba(245,158,11,0.1)', color: isAccepted ? '#16A085' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            {isAccepted ? <CheckCircle size={18} /> : <Clock size={18} />}
            {isAccepted ? "Accepted" : "Pending Doctor Review"}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>AI Initial Findings</h3>
          <LiquidGlass
            className={`assessment-card severity-${severityClass}`}
            variant="strong"
          >
            <div className="assessment-content">
              <div className="assessment-text">
                <span className="assessment-label">FINAL ASSESSMENT</span>
                <h1 style={{ margin: '8px 0', fontSize: '25px', color: 'white' }}>{ticket.dr_label}</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>AI-based retinal image screening result</p>
              </div>
              <div className={`confidence-card confidence-${severityClass}`}>
                <span>Confidence</span>
                <strong>{Math.round(ticket.confidence * 100)}%</strong>
                <div className="confidence-severity" style={{ marginTop: 'auto' }}>
                  <span className="severity-dot" />
                  <span>{severityText}</span>
                </div>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {slot && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>Scheduled Consultation</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(0,82,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,82,255,0.2)', color: 'var(--color-primary)' }}>
              <Clock size={20} />
              <span style={{ fontWeight: 600 }}>{new Date(slot.scheduled_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {isAccepted ? (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <ChatBox ticketId={id} senderRole="phc_worker" senderName="PHC Worker" />
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '800px', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
          Chat will be available once the doctor accepts the ticket and schedules a consultation.
        </div>
      )}
    </div>
  );
}
