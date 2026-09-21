import { Shield, Lock, FileText, CheckCircle2, ArrowLeft, Heart, Database, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta";

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy | SERIX AI Retinal Screening",
    description: "Read about how SERIX safeguards retinal imaging data, patient confidentiality, and adheres to medical data protection standards."
  });

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F8FAFC",
      color: "#334155",
      padding: "40px 20px 80px"
    }}>
      <div style={{
        maxWidth: "880px",
        margin: "0 auto"
      }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#1976D2",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#EFF6FF",
              transition: "background-color 0.15s ease"
            }}
          >
            <ArrowLeft size={16} /> Back to Screening Portal
          </Link>
        </div>

        {/* Header Hero */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "36px 32px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          marginBottom: "32px"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "20px",
            backgroundColor: "#EFF6FF",
            color: "#1976D2",
            fontSize: "0.825rem",
            fontWeight: 700,
            marginBottom: "16px"
          }}>
            <Shield size={15} /> CLINICAL DATA GOVERNANCE & PRIVACY
          </div>
          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.25,
            marginBottom: "12px",
            letterSpacing: "-0.02em"
          }}>
            Privacy Policy & Data Security
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#64748B",
            lineHeight: 1.6,
            margin: 0
          }}>
            Effective Date: September 2026 | Compliant with IEC 62304, HIPAA Security Rule, and Good Machine Learning Practice (GMLP).
          </p>
        </div>

        {/* Content Body */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "36px 32px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "36px"
        }}>
          {/* Section 1 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Eye size={18} color="#0284C7" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                1. Information We Collect
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: "0 0 12px" }}>
              SERIX collects information necessary to execute AI-assisted retinal screening and tele-ophthalmology triage:
            </p>
            <ul style={{ paddingLeft: "24px", lineHeight: 1.7, color: "#475569", margin: 0 }}>
              <li><strong>Retinal Fundus Photography:</strong> High-resolution digital images of the retina uploaded via Primary Health Centres (PHC) or screening clinics.</li>
              <li><strong>De-Identified Clinical Metadata:</strong> Age, systemic history (e.g., duration of diabetes, HbA1c brackets), and image quality metrics.</li>
              <li><strong>Account Credentials:</strong> Name, professional email, and role authorization (PHC Worker, Ophthalmologist, or Patient) for secure portal access.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Lock size={18} color="#059669" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                2. Zero-Retention Inference & Anonymization
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              Image processing through our deep learning pipeline (CLAHE enhancement, lesion detection, and Grad-CAM visualization) is performed in memory. Retinal scans are stored in encrypted object repositories using SHA-256 pseudonyms to ensure patient confidentiality and eliminate direct linkage to personally identifiable records without explicit clinical authorization.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#FDF2F8", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Database size={18} color="#DB2777" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                3. Data Storage & Local Storage Usage
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: "0 0 12px" }}>
              SERIX utilizes modern browser web storage (`localStorage`) strictly for essential application functions:
            </p>
            <ul style={{ paddingLeft: "24px", lineHeight: 1.7, color: "#475569", margin: 0 }}>
              <li>Encrypted JSON Web Tokens (JWT) for authenticated clinician and patient sessions.</li>
              <li>UI localization preferences (e.g., English, Hindi, Marathi, Tamil, Telugu).</li>
              <li>User cookie consent preference tokens.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <CheckCircle2 size={18} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                4. Patient Rights & Data Erasure
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              Under applicable healthcare and digital privacy regulations, patients and screening centers retain the right to request a full transcript of screening records, contest automated triage classifications, or request complete purging of case history from our tele-ophthalmology database.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #E2E8F0"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              Contact Data Protection Office
            </h3>
            <p style={{ lineHeight: 1.6, color: "#64748B", margin: 0, fontSize: "0.925rem" }}>
              For queries concerning clinical data security or rights requests, contact the SERIX Healthcare Compliance Team at <strong style={{ color: "#1976D2" }}>privacy@serixhealth.org</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
