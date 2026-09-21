import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle } from "lucide-react";
import apiClient from "../api/client";

export default function DoctorWindow() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcode doctor ID 1 for demo
  const DOCTOR_ID = 1;

  useEffect(() => {
    apiClient.get(`/api/tickets/doctor/${DOCTOR_ID}`)
      .then(res => setTickets(res.data))
      .catch(err => console.error("Failed to fetch tickets", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading cases...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--saas-fg)' }}>Doctor Workspace</h1>
        <p style={{ color: 'var(--saas-fg-muted)' }}>Review assigned cases and schedule consultations.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '900px' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--saas-border)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--saas-fg)', marginBottom: '8px' }}>No cases assigned</div>
            <div style={{ color: 'var(--saas-fg-muted)' }}>You're all caught up!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tickets.map(ticket => (
              <Link 
                key={ticket._id} 
                to={`/doctor/${ticket._id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--saas-border)',
                  textDecoration: 'none', color: 'inherit', transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Patient: {ticket.patient_name}</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--saas-fg-muted)' }}>
                    <span>AI Grade: <strong style={{ color: ticket.dr_level >= 2 ? '#ef4444' : 'var(--saas-fg)' }}>{ticket.dr_label}</strong></span>
                    <span>•</span>
                    <span>Confidence: {Math.round(ticket.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: ticket.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: ticket.status === 'accepted' ? '#22c55e' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                  {ticket.status === 'accepted' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  {ticket.status === 'accepted' ? "Accepted" : "Needs Review"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
