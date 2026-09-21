import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Activity, MessageSquare } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import apiClient from "../api/client";

export default function PatientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  
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

  const activeScreenings = tickets.filter(t => t.status === "pending");
  const historyScreenings = tickets.filter(t => t.status !== "pending");
  const displayedScreenings = activeTab === "active" ? activeScreenings : historyScreenings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Activity size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Patient Portal</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{user?.name}</span>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px', color: 'var(--color-text)' }}>Your Screenings</h2>
        
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab("active")}
            style={{
              background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700,
              color: activeTab === "active" ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
          >
            Active Screenings ({activeScreenings.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            style={{
              background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700,
              color: activeTab === "history" ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
          >
            History ({historyScreenings.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : displayedScreenings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            {activeTab === "active" ? "You have no active screenings. A PHC worker will create a ticket for you when you are screened." : "No screening history found."}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {displayedScreenings.map(ticket => (
              <Link 
                key={ticket._id} 
                to={`/patient/ticket/${ticket._id}`}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', textDecoration: 'none', color: 'inherit', transition: 'var(--transition)' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700 }}>Ticket #{String(ticket._id).substring(0,8)}</h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Doctor: {ticket.doctor_name}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '8px 16px', borderRadius: '24px', backgroundColor: ticket.status === 'accepted' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: ticket.status === 'accepted' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {ticket.status === 'accepted' ? 'Doctor Assigned & Scheduled' : 'Pending Review'}
                  </div>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
