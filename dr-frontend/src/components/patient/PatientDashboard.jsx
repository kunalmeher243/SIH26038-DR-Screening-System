import { useState } from "react";
import {
  FileText,
  User,
  Printer,
  ExternalLink,
  X,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import DoctorDirectory from "./DoctorDirectory";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [selectedReport, setSelectedReport] = useState(null);

  // Sample historical screening reports for the patient
  const reports = [
    {
      id: "REP-2026-0891",
      date: "Sep 08, 2026",
      center: "District Sub-Center PHC, Ward 4",
      eye: "Right Eye (OD)",
      drLevel: 2,
      drLabel: "Moderate Non-Proliferative DR",
      referable: true,
      confidence: "91.4%",
      qualityScore: "0.89 (Gradable)",
      doctorRemarks:
        "Microaneurysms and flame hemorrhages localized in posterior pole. Recommended dilated fundus follow-up within 4 weeks.",
      doctorName: "Dr. Ananya Sharma",
      lesionsFound: "8 Microaneurysms, 3 Hemorrhages, 2 Exudates",
      urgency: "Priority Referral",
    },
    {
      id: "REP-2026-0412",
      date: "Mar 14, 2026",
      center: "Community Health Center Triage Unit",
      eye: "Left Eye (OS)",
      drLevel: 1,
      drLabel: "Mild Non-Proliferative DR",
      referable: false,
      confidence: "94.2%",
      qualityScore: "0.94 (Gradable)",
      doctorRemarks:
        "Isolated microaneurysm detected. No macular involvement. Maintain strict glycemic control and repeat screening in 6 months.",
      doctorName: "Dr. Rajeshwar Kulkarni",
      lesionsFound: "2 Microaneurysms",
      urgency: "Routine Screening",
    },
    {
      id: "REP-2025-1108",
      date: "Nov 20, 2025",
      center: "District Mobile Retinal Camp",
      eye: "Both Eyes (OU)",
      drLevel: 0,
      drLabel: "No Apparent Diabetic Retinopathy",
      referable: false,
      confidence: "98.1%",
      qualityScore: "0.92 (Gradable)",
      doctorRemarks:
        "Retina clear. Healthy vasculature with distinct optic disc and macula. Annual rescreening advised.",
      doctorName: "Dr. Sangeeta Mukherjee",
      lesionsFound: "None",
      urgency: "Annual Follow-up",
    },
  ];

  const getLevelBadge = (level) => {
    switch (level) {
      case 0:
        return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Level 0 • No DR" };
      case 1:
        return { bg: "#EFF6FF", color: "#0052FF", border: "#BFDBFE", label: "Level 1 • Mild NPDR" };
      case 2:
        return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Level 2 • Moderate NPDR" };
      case 3:
        return { bg: "#FFF1F2", color: "#E11D48", border: "#FECDD3", label: "Level 3 • Severe NPDR" };
      case 4:
        return { bg: "#FEF2F2", color: "#DC2626", border: "#FCA5A5", label: "Level 4 • Proliferative DR" };
      default:
        return { bg: "#F1F5F9", color: "#475569", border: "#E2E8F0", label: `Level ${level}` };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}
    >
      {/* Patient Profile Card */}
      <div
        className="saas-card"
        style={{
          padding: "28px 32px",
          marginBottom: "36px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          borderLeft: "5px solid var(--saas-accent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--saas-accent-gradient)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.35rem",
              boxShadow: "var(--shadow-saas-accent)",
            }}
          >
            <User size={28} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "var(--saas-fg)",
                  letterSpacing: "-0.01em",
                }}
              >
                {user?.name || "Patient Record"}
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0, 82, 255, 0.08)",
                  color: "var(--saas-accent)",
                }}
              >
                ID: PT-892410
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px",
                fontSize: "0.84rem",
                color: "var(--saas-fg-muted)",
              }}
            >
              <span>Email: {user?.email || "patient@ruralphc.in"}</span>
              <span>•</span>
              <span>Primary PHC: Ward 4 Community Center</span>
              <span>•</span>
              <span>Age/Gender: 54 / M</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "var(--saas-bg-subtle)",
              border: "1px solid var(--saas-border)",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "var(--saas-fg-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
              Last Screening
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--saas-fg)" }}>
              Sep 08, 2026
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Screening History Section */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--saas-fg)",
                letterSpacing: "-0.01em",
              }}
            >
              Diagnostic Screening History & Reports
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.875rem",
                color: "var(--saas-fg-muted)",
              }}
            >
              Official clinical triage records validated by accredited ophthalmologists
            </p>
          </div>

          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--saas-fg-muted)",
            }}
          >
            {reports.length} Reports Found
          </span>
        </div>

        {/* Reports Table / Card List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reports.map((rep) => {
            const badge = getLevelBadge(rep.drLevel);
            return (
              <div
                key={rep.id}
                className="saas-card patient-report-row"
                style={{
                  padding: "22px 26px",
                  backgroundColor: "#FFFFFF",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.5fr 1fr auto",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                {/* Column 1: Date & Center */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--saas-fg-light)",
                      marginBottom: "4px",
                    }}
                  >
                    <FileText size={14} color="var(--saas-accent)" />
                    <span>{rep.id}</span>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--saas-fg)" }}>
                    {rep.date}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--saas-fg-muted)" }}>
                    {rep.eye} • {rep.center}
                  </div>
                </div>

                {/* Column 2: Severity & Remarks */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                      }}
                    >
                      {badge.label}
                    </span>
                    {rep.referable ? (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#DC2626",
                          backgroundColor: "#FEF2F2",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ● REFERRAL REQUIRED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#059669",
                          backgroundColor: "#ECFDF5",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ● NON-REFERABLE
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8125rem",
                      color: "var(--saas-fg-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    {rep.doctorRemarks}
                  </p>
                </div>

                {/* Column 3: Reviewer */}
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--saas-fg-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    Reviewing Clinician
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--saas-fg)" }}>
                    {rep.doctorName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--saas-fg-muted)" }}>
                    AI Confidence: {rep.confidence}
                  </div>
                </div>

                {/* Column 4: Action */}
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(rep)}
                    className="saas-btn-secondary"
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <span>View Full Report</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Specialists Directory for Follow-up */}
      <DoctorDirectory />

      {/* Printable / Viewable Clinical Report Modal */}
      {selectedReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(6px)",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null);
          }}
        >
          <div
            className="animate-modal-pop"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid var(--saas-border)",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--saas-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--saas-bg-subtle)",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--saas-accent)",
                    textTransform: "uppercase",
                  }}
                >
                  Clinical Screening Summary • {selectedReport.id}
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "1.25rem", fontWeight: 800, color: "var(--saas-fg)" }}>
                  Diabetic Retinopathy Screening Report
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="saas-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#94A3B8",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }}>
              {/* Report Header Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  padding: "16px",
                  backgroundColor: "var(--saas-bg-subtle)",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  fontSize: "0.84rem",
                }}
              >
                <div>
                  <strong>Patient Name:</strong> {user?.name || "Ramesh Patil"}<br />
                  <strong>Patient ID:</strong> PT-892410<br />
                  <strong>Screening Date:</strong> {selectedReport.date}
                </div>
                <div>
                  <strong>Eye Examined:</strong> {selectedReport.eye}<br />
                  <strong>PHC Center:</strong> {selectedReport.center}<br />
                  <strong>Reviewing Doctor:</strong> {selectedReport.doctorName}
                </div>
              </div>

              {/* Assessment Severity Box */}
              <div
                style={{
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1.5px solid var(--saas-border)",
                  backgroundColor: "#FFFFFF",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--saas-fg-muted)" }}>
                      Assigned ICDR Severity
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--saas-fg)" }}>
                      {selectedReport.drLabel}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "0.8125rem",
                      fontWeight: 800,
                      backgroundColor: selectedReport.referable ? "#FEF2F2" : "#ECFDF5",
                      color: selectedReport.referable ? "#DC2626" : "#059669",
                      border: `1px solid ${selectedReport.referable ? "#FCA5A5" : "#A7F3D0"}`,
                    }}
                  >
                    {selectedReport.referable ? "Referral Required" : "Routine Follow-up"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "0.8125rem", color: "var(--saas-fg-secondary)" }}>
                  <div><strong>Quality:</strong> {selectedReport.qualityScore}</div>
                  <div><strong>Model Conf:</strong> {selectedReport.confidence}</div>
                  <div><strong>Lesions:</strong> {selectedReport.lesionsFound}</div>
                </div>
              </div>

              {/* Clinical Remarks */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9375rem", fontWeight: 700, color: "var(--saas-fg)" }}>
                  Ophthalmologist Clinical Note & Recommendation:
                </h4>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(0, 82, 255, 0.04)",
                    border: "1px solid rgba(0, 82, 255, 0.15)",
                    fontSize: "0.875rem",
                    lineHeight: 1.55,
                    color: "var(--saas-fg)",
                  }}
                >
                  {selectedReport.doctorRemarks}
                </div>
              </div>

              {/* Triage Disclaimer */}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--saas-fg-muted)",
                  lineHeight: 1.4,
                  borderTop: "1px solid var(--saas-border-subtle)",
                  paddingTop: "16px",
                }}
              >
                ⚠️ <em>AI-Assisted Rural Triage Notice:</em> This report was generated through deep learning fundus analysis and signed off by a qualified tele-ophthalmologist. It does not replace dilated slit-lamp ophthalmic evaluation.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 800px) {
          .patient-report-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
