import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Clock, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import apiClient from "../api/client";

export default function PatientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  
  const user = useAuthStore(state => state.user);
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

  const activeScreenings = tickets.filter(t => t.status === "pending");
  const historyScreenings = tickets.filter(t => t.status !== "pending");
  const displayedScreenings = activeTab === "active" ? activeScreenings : historyScreenings;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "36px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: "880px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#263238", marginBottom: "6px" }}>
            Patient Portal
          </h1>
          <p style={{ color: "#546E7A", fontSize: "1rem" }}>
            Track your retinal screening assessments, doctor reviews, and scheduled consultations.
          </p>
        </div>

        {/* TABS */}
        <div style={{
          display: "flex",
          gap: "24px",
          borderBottom: "1px solid #E2E8F0",
          marginBottom: "24px"
        }}>
          <button 
            onClick={() => setActiveTab("active")}
            style={{
              background: "none", border: "none", paddingBottom: "12px",
              fontSize: "1rem", fontWeight: activeTab === "active" ? 700 : 500,
              color: activeTab === "active" ? "#1976D2" : "#546E7A",
              borderBottom: activeTab === "active" ? "2.5px solid #1976D2" : "2.5px solid transparent",
              cursor: "pointer", transition: "all 0.15s ease"
            }}
          >
            Active Screenings ({activeScreenings.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            style={{
              background: "none", border: "none", paddingBottom: "12px",
              fontSize: "1rem", fontWeight: activeTab === "history" ? 700 : 500,
              color: activeTab === "history" ? "#1976D2" : "#546E7A",
              borderBottom: activeTab === "history" ? "2.5px solid #1976D2" : "2.5px solid transparent",
              cursor: "pointer", transition: "all 0.15s ease"
            }}
          >
            Past Consultations ({historyScreenings.length})
          </button>
        </div>

        {/* SCREENINGS LIST */}
        {loading ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#546E7A" }}>Loading screening records...</div>
        ) : displayedScreenings.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 24px", color: "#90A4AE", backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "#263238", marginBottom: "6px" }}>
              {activeTab === "active" ? "No active screenings pending review" : "No past consultation records"}
            </div>
            <div style={{ fontSize: "0.9rem" }}>
              {activeTab === "active" ? "Your local PHC worker will register a screening ticket after image capture." : "Completed consultation records will appear here."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedScreenings.map(ticket => {
              const isAccepted = ticket.status === "accepted";
              const isHighRisk = (ticket.dr_level || 0) >= 2;

              return (
                <Link 
                  key={ticket._id} 
                  to={`/patient/ticket/${ticket._id}`}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    textDecoration: "none",
                    color: "inherit",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D9E2E8",
                    borderRadius: "12px",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1976D2";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(30, 60, 90, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#D9E2E8";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(30, 60, 90, 0.04)";
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 700, color: "#263238" }}>
                      Retinal Screening #{String(ticket._id).substring(0, 8).toUpperCase()}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", color: "#546E7A", fontSize: "0.85rem", alignItems: "center" }}>
                      <span>Date: {new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Reviewing Doctor: {ticket.doctor_name}</span>
                      <span>•</span>
                      <span>AI Grade: <strong style={{ color: isHighRisk ? "#E74C3C" : "#16A085" }}>{ticket.dr_label}</strong></span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      backgroundColor: isAccepted ? "#E8F8F5" : "#FEF9E7",
                      color: isAccepted ? "#16A085" : "#F39C12",
                      border: `1px solid ${isAccepted ? "rgba(22, 160, 133, 0.3)" : "rgba(243, 156, 18, 0.3)"}`,
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      {isAccepted ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                      {isAccepted ? "Consultation Scheduled" : "Pending Doctor Review"}
                    </div>

                    <span className="btn btn-outline-blue" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>
                      View Status <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
