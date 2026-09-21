import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, MessageSquare } from "lucide-react";
import apiClient from "../api/client";

export default function DoctorWindow() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"

  // Hardcode doctor ID 1 for demo
  const DOCTOR_ID = 1;

  useEffect(() => {
    apiClient.get(`/api/tickets/doctor/${DOCTOR_ID}`)
      .then(res => setTickets(res.data))
      .catch(err => console.error("Failed to fetch tickets", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading cases...</div>;

  const activeCases = tickets.filter(t => t.status === "pending");
  const historyCases = tickets.filter(t => t.status !== "pending");
  const displayedCases = activeTab === "active" ? activeCases : historyCases;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>Doctor Workspace</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Review assigned cases and schedule consultations.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '24px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab("active")}
          style={{
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700,
            color: activeTab === "active" ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer', transition: 'var(--transition)'
          }}
        >
          Active Cases ({activeCases.length})
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          style={{
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700,
            color: activeTab === "history" ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer', transition: 'var(--transition)'
          }}
        >
          Case History ({historyCases.length})
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '900px' }}>
        {displayedCases.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>No cases found</div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === "active" ? "You're all caught up!" : "No history available."}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayedCases.map(ticket => (
              <Link 
                key={ticket._id} 
                to={`/doctor/${ticket._id}`}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', color: 'inherit', padding: '24px', transition: 'var(--transition)'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Patient: {ticket.patient_name}</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>AI Grade: <strong style={{ color: ticket.dr_level >= 2 ? 'var(--color-danger)' : 'var(--color-text)' }}>{ticket.dr_label}</strong></span>
                    <span>•</span>
                    <span>Confidence: {Math.round(ticket.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: ticket.status === 'accepted' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: ticket.status === 'accepted' ? 'var(--color-success)' : 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                    {ticket.status === 'accepted' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    {ticket.status === 'accepted' ? "Accepted" : "Needs Review"}
                  </div>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
