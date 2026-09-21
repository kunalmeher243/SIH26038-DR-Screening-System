import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Users, CheckCircle2, Clock, AlertTriangle, 
  User, Mail, Stethoscope, Plus, MessageSquare, ArrowRight 
} from "lucide-react";
import Upload from "./Upload";
import useAnalysisStore from "../store/useAnalysisStore";
import apiClient from "../api/client";

export default function PHCWindow() {
  const navigate = useNavigate();
  const file = useAnalysisStore((state) => state.file);
  const reset = useAnalysisStore((state) => state.reset);
  
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    reset();
    
    apiClient.get("/api/doctors")
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Failed to fetch doctors", err));
      
    apiClient.get("/api/tickets/phc/me")
      .then(res => setHistoryTickets(res.data))
      .catch(err => console.error("Failed to fetch PHC history", err));
  }, [reset]);

  const handleSubmit = async (selectedFile) => {
    if (!patientName || !patientEmail || !doctorId) {
      setError("Please fill in patient name, email, and select an ophthalmologist before starting analysis.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("patient_name", patientName);
    formData.append("patient_email", patientEmail);
    formData.append("doctor_id", doctorId);
    formData.append("file", selectedFile);

    try {
      const response = await apiClient.post("/api/tickets", formData);
      const data = response.data;
      navigate(`/phc/ticket/${data.ticket_id}`);
    } catch (err) {
      console.error(err);
      setError(err.userMessage || err.response?.data?.detail || err.message || "An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const totalPatientsCount = new Set(historyTickets.map(t => t.patient_email)).size;
  const todayScreeningsCount = historyTickets.length;
  const pendingReviewCount = historyTickets.filter(t => t.status === "pending").length;
  const highRiskCount = historyTickets.filter(t => (t.dr_level || 0) >= 2).length;

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
            PHC Screening Portal
          </h1>
          <p style={{ color: "#546E7A", fontSize: "1rem" }}>
            Perform AI-assisted diabetic retinopathy screening and triage tele-ophthalmology cases.
          </p>
        </div>

        {/* STAT CARDS (Section 17: White cards with colored icons) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "36px"
        }}>
          {/* Total Patients: Blue */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E2E8",
            boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)",
            padding: "20px",
            borderRadius: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                backgroundColor: "#E3F2FD",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Users size={22} color="#1976D2" />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#546E7A" }}>
                Total Patients
              </span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#263238" }}>
              {totalPatientsCount}
            </div>
          </div>

          {/* Today's Screening: Green */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E2E8",
            boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)",
            padding: "20px",
            borderRadius: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                backgroundColor: "#E8F8F5",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <CheckCircle2 size={22} color="#16A085" />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#546E7A" }}>
                Total Screenings
              </span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#263238" }}>
              {todayScreeningsCount}
            </div>
          </div>

          {/* Pending Analysis / Review: Amber */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E2E8",
            boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)",
            padding: "20px",
            borderRadius: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                backgroundColor: "#FEF9E7",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Clock size={22} color="#F39C12" />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#546E7A" }}>
                Pending Review
              </span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#263238" }}>
              {pendingReviewCount}
            </div>
          </div>

          {/* High Risk: Red */}
          <div className="card" style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E2E8",
            boxShadow: "0 4px 16px rgba(30, 60, 90, 0.05)",
            padding: "20px",
            borderRadius: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                backgroundColor: "#FDEDEC",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <AlertTriangle size={22} color="#E74C3C" />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#546E7A" }}>
                High Risk Cases
              </span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#263238" }}>
              {highRiskCount}
            </div>
          </div>
        </div>

        {/* PATIENT DETAILS & SCREENING FORM (Section 18) */}
        <div className="card" style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D9E2E8",
          boxShadow: "0 8px 30px rgba(30, 60, 90, 0.06)",
          padding: "28px",
          borderRadius: "16px",
          marginBottom: "32px"
        }}>
          {/* Section 1: Patient Information (Blue Icon) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #ECEFF1", paddingBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976D2" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#263238", letterSpacing: "0.02em" }}>
              PATIENT INFORMATION
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label className="input-label">Patient Full Name *</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                <input 
                  type="text" 
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Patient Email Address *</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                <input 
                  type="email" 
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="rajesh.kumar@example.com"
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Assignment (Green Icon) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #ECEFF1", paddingBottom: "12px", marginTop: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A085" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#263238", letterSpacing: "0.02em" }}>
              CLINICAL TRIAGE & ASSIGNMENT
            </h2>
          </div>

          <div>
            <label className="input-label">Assign to Ophthalmologist *</label>
            <div style={{ position: "relative" }}>
              <Stethoscope size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
              <select 
                value={doctorId} 
                onChange={(e) => setDoctorId(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px", cursor: "pointer", backgroundColor: "#FFFFFF" }}
              >
                <option value="" disabled>Select reviewing ophthalmologist...</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialization}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger)",
            color: "var(--color-danger)",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "0.925rem"
          }}>
            {error}
          </div>
        )}

        {/* IMAGE CAPTURE / UPLOAD SECTION (Section 19) */}
        <div style={{
          width: "100%",
          pointerEvents: isSubmitting ? "none" : "auto",
          opacity: isSubmitting ? 0.6 : 1,
          marginBottom: "40px"
        }}>
          <Upload onAnalyze={handleSubmit} />
        </div>

        {isSubmitting && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "24px", fontSize: "1rem", fontWeight: 600, color: "#1976D2"
          }}>
            <span className="spinner-icon">◌</span> Running AI Model Pipeline (IQA → Lesion Detection → Grad-CAM → Report)... Please wait.
          </div>
        )}

        {/* RECENT SCREENINGS SECTION */}
        <div style={{ width: "100%", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#263238" }}>
              Recent Screening Records
            </h2>
            <span style={{ fontSize: "0.875rem", color: "#546E7A" }}>
              {historyTickets.length} cases recorded
            </span>
          </div>
          
          {historyTickets.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px", color: "#90A4AE", backgroundColor: "#FFFFFF" }}>
              No screening cases recorded yet. Upload a fundus image above to begin.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {historyTickets.map(ticket => {
                const isHighRisk = (ticket.dr_level || 0) >= 2;
                const isAccepted = ticket.status === "accepted";
                
                return (
                  <Link 
                    key={ticket._id} 
                    to={`/phc/ticket/${ticket._id}`}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "18px 24px",
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
                      <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", fontWeight: 700, color: "#263238" }}>
                        Patient: {ticket.patient_name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#546E7A" }}>
                        <span>
                          AI Severity: <strong style={{ color: isHighRisk ? "#E74C3C" : "#16A085" }}>{ticket.dr_label}</strong>
                        </span>
                        <span>•</span>
                        <span>Doctor: {ticket.doctor_name}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
                        {isAccepted ? "Accepted" : "Pending Review"}
                      </div>
                      
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        backgroundColor: "#E3F2FD", color: "#1976D2",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
