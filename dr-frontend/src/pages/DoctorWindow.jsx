import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2, AlertTriangle, Stethoscope, ArrowRight, User } from "lucide-react";
import apiClient from "../api/client";
import useAuthStore from "../store/useAuthStore";
import usePageMeta from "../utils/usePageMeta";

export default function DoctorWindow() {
  usePageMeta({
    title: "Ophthalmologist Workspace | SERIX Health",
    description: "Review AI-triaged diabetic retinopathy cases, confirm clinical severity, and provide tele-consultation feedback."
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Dynamically fetch tickets assigned to the logged-in doctor
    apiClient.get("/api/tickets/doctor/me")
      .then(res => setTickets(res.data))
      .catch(err => {
        console.warn("Could not fetch /api/tickets/doctor/me, attempting fallback:", err);
        const doctorKey = user?.id || user?._id || user?.email;
        if (doctorKey) {
          apiClient.get(`/api/tickets/doctor/${doctorKey}`)
            .then(res => setTickets(res.data))
            .catch(fallbackErr => console.error("Doctor tickets fallback failed", fallbackErr));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: "60px 24px", textAlign: "center", color: "#546E7A" }}>Loading assigned clinical cases...</div>;

  const activeCases = tickets.filter(t => t.status === "pending");
  const historyCases = tickets.filter(t => t.status !== "pending");
  const displayedCases = activeTab === "active" ? activeCases : historyCases;

  // Stats
  const assignedCount = tickets.length;
  const reviewedCount = historyCases.length;
  const pendingCount = activeCases.length;
  const highRiskCount = tickets.filter(t => (t.dr_level || 0) >= 2).length;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "calc(100vh - 68px)",
      backgroundColor: "#FFFFFF",
      padding: "36px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: "960px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#263238", marginBottom: "6px" }}>
            Ophthalmologist Workspace {user?.name ? `• ${user.name}` : ""}
          </h1>
          <p style={{ color: "#546E7A", fontSize: "1rem" }}>
            Review AI screening explanations, validate findings, and schedule patient tele-consultations.
          </p>
        </div>

        {/* METRICS (Section 22: Blue=Assigned, Green=Reviewed, Amber=Pending, Red=High-Risk) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          {/* Blue: Assigned */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF", border: "1px solid #D9E2E8",
            borderRadius: "14px", padding: "18px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stethoscope size={18} color="#1976D2" />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#546E7A" }}>Assigned Cases</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1976D2" }}>{assignedCount}</div>
          </div>

          {/* Green: Reviewed */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF", border: "1px solid #D9E2E8",
            borderRadius: "14px", padding: "18px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#E8F8F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#16A085" />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#546E7A" }}>Reviewed</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16A085" }}>{reviewedCount}</div>
          </div>

          {/* Amber: Pending */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF", border: "1px solid #D9E2E8",
            borderRadius: "14px", padding: "18px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#FEF9E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={18} color="#F39C12" />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#546E7A" }}>Pending Review</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F39C12" }}>{pendingCount}</div>
          </div>

          {/* Red: High-Risk */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF", border: "1px solid #D9E2E8",
            borderRadius: "14px", padding: "18px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#FDEDEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={18} color="#E74C3C" />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#546E7A" }}>High Risk</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#E74C3C" }}>{highRiskCount}</div>
          </div>
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
            Pending Reviews ({activeCases.length})
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
            Completed Consultations ({historyCases.length})
          </button>
        </div>

        {/* CASE LIST */}
        {displayedCases.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 24px", color: "#90A4AE", backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "#263238", marginBottom: "6px" }}>
              No cases in this view
            </div>
            <div style={{ fontSize: "0.9rem" }}>
              {activeTab === "active" ? "All assigned screening cases have been reviewed." : "No previous consultation records found."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {displayedCases.map(ticket => {
              const isHighRisk = (ticket.dr_level || 0) >= 2;
              const isAccepted = ticket.status === "accepted";
              
              return (
                <Link 
                  key={ticket._id} 
                  to={`/doctor/${ticket._id}`}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textDecoration: "none",
                    color: "inherit",
                    padding: "20px 24px",
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#263238" }}>
                        {ticket.patient_name}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "#90A4AE" }}>
                        {ticket.patient_email}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#546E7A" }}>
                      <span>
                        AI Finding: <strong style={{ color: isHighRisk ? "#E74C3C" : "#16A085" }}>{ticket.dr_label}</strong>
                      </span>
                      <span>•</span>
                      <span>Confidence: {Math.round((ticket.confidence || 0.95) * 100)}%</span>
                      <span>•</span>
                      <span>From: {ticket.phc_email}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Status Badge */}
                    <div style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      backgroundColor: isAccepted ? "#E8F8F5" : "#FEF9E7",
                      color: isAccepted ? "#16A085" : "#F39C12",
                      border: `1px solid ${isAccepted ? "rgba(22, 160, 133, 0.3)" : "rgba(243, 156, 18, 0.3)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                      fontSize: "0.825rem"
                    }}>
                      {isAccepted ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                      {isAccepted ? "Reviewed & Scheduled" : "Review Needed"}
                    </div>

                    {/* Action button */}
                    <span className="btn btn-outline-blue" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>
                      Open Case <ArrowRight size={15} />
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
