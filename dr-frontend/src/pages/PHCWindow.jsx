import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset any existing analysis when mounting PHC Window
    reset();
    
    // Fetch doctors
    apiClient.get("/api/doctors")
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Failed to fetch doctors", err));
  }, [reset]);

  const handleSubmit = async (selectedFile) => {
    if (!patientName || !patientEmail || !doctorId) {
      setError("Please fill out all patient and doctor details.");
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
      // Navigate to ticket status page
      navigate(`/phc/ticket/${data.ticket_id}`);
    } catch (err) {
      console.error(err);
      setError(err.userMessage || err.response?.data?.detail || err.message || "An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>PHC Worker Portal</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Upload retinal images and assign to an ophthalmologist.</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '800px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>Patient Details</h2>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Patient Name</label>
            <input 
              type="text" 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-field"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Patient Email</label>
            <input 
              type="email" 
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="patient@example.com"
              className="input-field"
            />
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Assign to Doctor</label>
          <select 
            value={doctorId} 
            onChange={(e) => setDoctorId(e.target.value)}
            className="input-field"
          >
            <option value="" disabled>Select a doctor...</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Upload Component handles the image selection, eye detection, etc. */}
      {/* We pass onAnalyze to hijack the "Start Analysis" button */}
      <div style={{ width: '100%', maxWidth: '800px', pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.6 : 1 }}>
        <Upload onAnalyze={handleSubmit} />
      </div>

      {isSubmitting && (
        <div style={{ marginTop: '24px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          Processing and running ML pipeline... Please wait.
        </div>
      )}
    </div>
  );
}
