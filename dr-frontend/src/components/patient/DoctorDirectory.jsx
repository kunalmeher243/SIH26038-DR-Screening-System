import { useState } from "react";
import { Stethoscope, MapPin, Calendar, Star, Award, Clock, Send } from "lucide-react";
import useToastStore from "../../store/useToastStore";
import useLanguageStore from "../../store/useLanguageStore";

export default function DoctorDirectory() {
  const { showToast } = useToastStore();
  const { t } = useLanguageStore();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState("Standard");

  const doctors = [
    {
      id: "doc_1",
      name: "Dr. Ananya Sharma",
      credentials: "MBBS, MS (Ophthalmology), FMRF (Vitreoretina)",
      specialization: "Vitreoretinal Specialist & Retinal Vascular Disease",
      center: "AIIMS Regional Tele-Ophthalmology Hub",
      location: "New Delhi & Rural Outreach Network",
      experience: "14+ Years",
      rating: "4.95",
      availability: "Available Today for Rural Triage",
      avatarBg: "#EFF6FF",
      avatarColor: "#0052FF",
    },
    {
      id: "doc_2",
      name: "Dr. Rajeshwar Kulkarni",
      credentials: "MBBS, DO, DNB (Ophthalmology)",
      specialization: "Diabetic Retinopathy & Laser Photocoagulation",
      center: "Aravind Rural Eye Care Tele-Network",
      location: "Madurai & Southern PHC Cluster",
      experience: "18+ Years",
      rating: "4.92",
      availability: "Next Tele-Slot: Tomorrow 10:00 AM",
      avatarBg: "#ECFDF5",
      avatarColor: "#059669",
    },
    {
      id: "doc_3",
      name: "Dr. Sangeeta Mukherjee",
      credentials: "MBBS, MD (Ophthalmic Medicine)",
      specialization: "Surgical Retina & Microaneurysm Management",
      center: "Sankara Nethralaya Tele-Triage Division",
      location: "Chennai & East India PHC Portal",
      experience: "11+ Years",
      rating: "4.89",
      availability: "Available for Emergency Referral",
      avatarBg: "#FFFBEB",
      avatarColor: "#D97706",
    },
  ];

  const handleRequestClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsFollowUpModalOpen(true);
  };

  const handleConfirmFollowUp = (e) => {
    e.preventDefault();
    setIsFollowUpModalOpen(false);
    showToast(
      `Tele-consultation request sent to ${selectedDoctor.name}. Your PHC health worker will contact you within 24 hours.`,
      "success"
    );
    setNotes("");
  };

  return (
    <div style={{ marginTop: "40px" }}>
      {/* Header - Badge removed */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
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
              color: "var(--color-text)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("specialistsDirectoryTitle")}
          </h3>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}
          >
            {t("specialistsDirectorySub")}
          </p>
        </div>
      </div>

      {/* Grid of Specialists */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div>
              {/* Top Row: Avatar & Rating */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: doc.avatarBg,
                      color: doc.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--color-text)",
                      }}
                    >
                      {doc.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.2,
                        display: "block",
                      }}
                    >
                      {doc.credentials}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#D97706",
                  }}
                >
                  <Star size={12} fill="#D97706" color="#D97706" />
                  <span>{doc.rating}</span>
                </div>
              </div>

              {/* Specialization & Hospital */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {doc.specialization}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "2px",
                  }}
                >
                  <MapPin size={13} color="var(--color-text-muted)" />
                  <span>{doc.center}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--saas-fg-light)",
                    paddingLeft: "19px",
                  }}
                >
                  {doc.location}
                </div>
              </div>

              {/* Experience and Availability info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--saas-bg-subtle)",
                  fontSize: "0.75rem",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={14} color="var(--color-text-muted)" />
                  <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                    {doc.experience}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                  <Clock size={13} />
                  <span style={{ fontWeight: 600 }}>{doc.availability}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => handleRequestClick(doc)}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "9px 14px",
                fontSize: "0.875rem",
              }}
            >
              <Calendar size={16} />
              <span>{t("specialistCardBtn")}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Follow-up Request Modal */}
      {isFollowUpModalOpen && selectedDoctor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(6px)",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFollowUpModalOpen(false);
          }}
        >
          <div
            className="animate-modal-pop"
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "20px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text)" }}>
                  {t("reqSpecialistModalTitle")}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                  {t("connectingWith")} {selectedDoctor.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmFollowUp} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--color-text)",
                  }}
                >
                  {t("consultationUrgency")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setUrgency("Standard")}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: urgency === "Standard" ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
                      backgroundColor: urgency === "Standard" ? "var(--saas-accent-light)" : "var(--color-surface)",
                      color: urgency === "Standard" ? "var(--color-primary)" : "var(--color-text)",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    {t("routineFollowUp")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency("Priority")}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: urgency === "Priority" ? "1.5px solid #EF4444" : "1px solid var(--color-border)",
                      backgroundColor: urgency === "Priority" ? "#FEF2F2" : "var(--color-surface)",
                      color: urgency === "Priority" ? "#DC2626" : "var(--color-text)",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    {t("priorityRisk")}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--color-text)",
                  }}
                >
                  {t("symptomsNotesLabel")}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("symptomsPlaceholder")}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    padding: "10px 12px",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-body)",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "10px" }}
              >
                <Send size={16} />
                <span>{t("submitTeleConsultBtn")}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
