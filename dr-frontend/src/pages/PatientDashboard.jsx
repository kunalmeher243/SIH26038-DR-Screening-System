import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, ArrowRight, ShieldCheck, FileSearch, Calendar, AlertCircle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import apiClient from "../api/client";

export default function PatientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [fetchError, setFetchError] = useState("");
  
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    const fetchTickets = async () => {
      try {
        setFetchError("");
        const res = await apiClient.get("/api/tickets/patient/me");
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching patient tickets:", err);
        setFetchError("Unable to load your screening records. Please check your connection.");
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
      <div style={{ width: "100%", maxWidth: "920px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "16px",
              backgroundColor: "#E3F2FD",
              color: "#1976D2",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>
              <ShieldCheck size={13} /> Secure Patient Portal
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px 0" }}>
            My Retinal Screenings
          </h1>
          <p style={{ color: "#4B5563", fontSize: "0.975rem", margin: 0 }}>
            Welcome, <strong>{user?.name || "Patient"}</strong>. Access your personal diabetic retinopathy assessments, specialist reviews, and scheduled tele-ophthalmology consultations.
          </p>
        </div>

        {/* TABS */}
        <div style={{
          display: "flex",
          gap: "24px",
          borderBottom: "1px solid #E5E7EB",
          marginBottom: "24px"
        }}>
          <button 
            type="button"
            onClick={() => setActiveTab("active")}
            style={{
              background: "none",
              border: "none",
              paddingBottom: "12px",
              fontSize: "0.95rem",
              fontWeight: activeTab === "active" ? 700 : 500,
              color: activeTab === "active" ? "#1976D2" : "#6B7280",
              borderBottom: activeTab === "active" ? "2.5px solid #1976D2" : "2.5px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Active Cases ({activeScreenings.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("history")}
            style={{
              background: "none",
              border: "none",
              paddingBottom: "12px",
              fontSize: "0.95rem",
              fontWeight: activeTab === "history" ? 700 : 500,
              color: activeTab === "history" ? "#1976D2" : "#6B7280",
              borderBottom: activeTab === "history" ? "2.5px solid #1976D2" : "2.5px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Past Consultations ({historyScreenings.length})
          </button>
        </div>

        {/* ERROR NOTICE */}
        {fetchError && (
          <div style={{
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            fontSize: "0.9rem",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={18} />
            {fetchError}
          </div>
        )}

        {/* SCREENINGS LIST */}
        {loading ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#6B7280", fontSize: "0.95rem" }}>
            Loading your screening records...
          </div>
        ) : displayedScreenings.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "54px 28px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#EFF6FF",
              color: "#1976D2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}>
              <FileSearch size={28} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1F2937", margin: "0 0 8px 0" }}>
              {activeTab === "active" ? "No Active Screenings" : "No Past Consultations"}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#6B7280", maxWidth: "480px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
              {activeTab === "active"
                ? "You have no active diabetic retinopathy cases under review. When a retinal photograph is uploaded by your local PHC worker, your full assessment and specialist consultation status will appear here."
                : "Any past or finalized tele-ophthalmology consultations will be safely stored here for your reference."
              }
            </p>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#16A085",
              fontSize: "0.825rem",
              fontWeight: 600
            }}>
              <ShieldCheck size={15} /> All patient records are encrypted and strictly isolated to your account.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {displayedScreenings.map(ticket => {
              const isAccepted = ticket.status === "accepted";
              const isHighRisk = (ticket.dr_level || 0) >= 2;

              return (
                <Link 
                  key={ticket._id} 
                  to={`/patient/ticket/${ticket._id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    textDecoration: "none",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1976D2";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(25, 118, 210, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.03)";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1F2937" }}>
                        Retinal Screening #{String(ticket._id).substring(0, 8).toUpperCase()}
                      </h3>
                      <span style={{
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: isHighRisk ? "#FEF2F2" : "#F0FDF4",
                        color: isHighRisk ? "#DC2626" : "#16A085",
                        border: `1px solid ${isHighRisk ? "#FECACA" : "#BBF7D0"}`
                      }}>
                        {ticket.dr_label || "Graded"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "#6B7280", fontSize: "0.85rem", alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} />
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recently"}
                      </span>
                      <span>•</span>
                      <span>Assigned Specialist: <strong style={{ color: "#374151" }}>{ticket.doctor_name || "Specialist Ophthalmologist"}</strong></span>
                      {ticket.confidence != null && (
                        <>
                          <span>•</span>
                          <span>Confidence: <strong>{(ticket.confidence * 100).toFixed(1)}%</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      backgroundColor: isAccepted ? "#F0FDF4" : "#FFFBEB",
                      color: isAccepted ? "#16A085" : "#D97706",
                      border: `1px solid ${isAccepted ? "#BBF7D0" : "#FDE68A"}`,
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      {isAccepted ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                      {isAccepted ? "Consultation Scheduled" : "Pending Doctor Review"}
                    </div>

                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: "#EFF6FF",
                      color: "#1976D2",
                      border: "1px solid #BFDBFE",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      transition: "all 0.15s ease"
                    }}>
                      View Assessment <ArrowRight size={14} />
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
