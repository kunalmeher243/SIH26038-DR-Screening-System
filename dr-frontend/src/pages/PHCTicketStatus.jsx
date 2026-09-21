import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatBox from "../components/chat/ChatBox";
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '24px' }}>
        <Link to="/phc" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--saas-accent)', textDecoration: 'none', fontWeight: 600, marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Upload
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--saas-fg)', margin: 0 }}>Ticket Status</h1>
        <p style={{ color: 'var(--saas-fg-muted)' }}>Ticket ID: {id}</p>
      </div>

      <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--saas-border)', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Patient: {ticket.patient_name}</h2>
            <div style={{ color: 'var(--saas-fg-muted)', fontSize: '0.9rem' }}>Email: {ticket.patient_email}</div>
            <div style={{ color: 'var(--saas-fg-muted)', fontSize: '0.9rem' }}>Assigned Doctor: {ticket.doctor_name}</div>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: isAccepted ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: isAccepted ? '#22c55e' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            {isAccepted ? <CheckCircle size={18} /> : <Clock size={18} />}
            {isAccepted ? "Accepted" : "Pending Doctor Review"}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>AI Initial Findings</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>DR Level</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--saas-fg)' }}>{ticket.dr_label} (Level {ticket.dr_level})</div>
            </div>
            <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--saas-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--saas-fg-muted)', marginBottom: '4px' }}>Confidence</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--saas-fg)' }}>{Math.round(ticket.confidence * 100)}%</div>
            </div>
          </div>
        </div>

        {slot && (
          <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>Scheduled Consultation</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(0,82,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,82,255,0.2)', color: 'var(--saas-accent)' }}>
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
        <div style={{ width: '100%', maxWidth: '800px', textAlign: 'center', padding: '40px', color: 'var(--saas-fg-muted)', backgroundColor: '#fff', border: '1px dashed var(--saas-border)', borderRadius: '16px' }}>
          Chat will be available once the doctor accepts the ticket and schedules a consultation.
        </div>
      )}
    </div>
  );
}
