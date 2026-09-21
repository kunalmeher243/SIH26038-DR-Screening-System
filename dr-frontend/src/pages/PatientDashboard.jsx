import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Activity, Calendar } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import apiClient from "../api/client";

export default function PatientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    const fetchTickets = async () => {
      try {
        const res = await apiClient.get("/api/tickets/patient/me");
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid var(--saas-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0, 82, 255, 0.1)', color: 'var(--saas-accent)' }}>
            <Activity size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--saas-fg)' }}>Patient Portal</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontWeight: 600, color: 'var(--saas-fg)' }}>{user?.name}</span>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--saas-border)', cursor: 'pointer', color: 'var(--saas-fg-muted)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px', color: 'var(--saas-fg)' }}>Your Screenings</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--saas-fg-muted)' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed var(--saas-border)', color: 'var(--saas-fg-muted)' }}>
            No screenings found. A PHC worker will create a ticket for you when you are screened.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {tickets.map(ticket => (
              <Link 
                key={ticket.id} 
                to={`/patient/ticket/${ticket.id}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--saas-border)', textDecoration: 'none', color: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700 }}>Ticket #{ticket.id.substring(0,8)}</h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--saas-fg-muted)', fontSize: '0.9rem' }}>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Doctor: {ticket.doctor_name}</span>
                  </div>
                </div>
                
                <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: ticket.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: ticket.status === 'accepted' ? '#22c55e' : '#d97706', fontWeight: 600, fontSize: '0.9rem' }}>
                  {ticket.status === 'accepted' ? 'Doctor Assigned & Scheduled' : 'Pending Review'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
