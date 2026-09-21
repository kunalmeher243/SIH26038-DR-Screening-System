import { AlertTriangle, FileText, ArrowLeft, ShieldCheck, Scale, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta";

export default function TermsConditions() {
  usePageMeta({
    title: "Terms & Conditions | SERIX AI Retinal Screening",
    description: "Read terms of use and clinical disclaimers for the SERIX Diabetic Retinopathy screening and tele-ophthalmology system."
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
          marginBottom: "28px"
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
            <Scale size={15} /> CLINICAL TERMS & OPERATIONAL PROTOCOLS
          </div>
          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.25,
            marginBottom: "12px",
            letterSpacing: "-0.02em"
          }}>
            Terms & Conditions of Use
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#64748B",
            lineHeight: 1.6,
            margin: 0
          }}>
            Last Updated: September 2026 | Governing deployment of the SERIX AI Screening & Tele-Ophthalmology System.
          </p>
        </div>

        {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
        <div style={{
          backgroundColor: "#FFFBEB",
          border: "2px solid #F59E0B",
          borderRadius: "16px",
          padding: "24px 28px",
          marginBottom: "32px",
          display: "flex",
          gap: "18px",
          alignItems: "flex-start",
          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.08)"
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertTriangle size={24} color="#D97706" />
          </div>
          <div>
            <h3 style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#92400E",
              margin: "0 0 6px"
            }}>
              MANDATORY CLINICAL & MEDICAL DISCLAIMER
            </h3>
            <p style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#78350F",
              margin: 0,
              fontWeight: 500
            }}>
              <strong>This platform is an AI-assisted screening tool, not a certified clinical diagnosis.</strong> Automated DR classifications (No DR, Mild, Moderate, Severe, Proliferative DR) and Grad-CAM visual heatmaps are decision-support aids designed for triage in primary health centers. All findings must be reviewed and confirmed by a certified ophthalmologist or medical professional before clinical treatment or surgical intervention.
            </p>
          </div>
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
                <Stethoscope size={18} color="#0284C7" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                1. Scope of Service & Clinical Workflow
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: "0 0 12px" }}>
              SERIX provides software workflows connecting field health workers (PHC workers), ophthalmologists, and patients:
            </p>
            <ul style={{ paddingLeft: "24px", lineHeight: 1.7, color: "#475569", margin: 0 }}>
              <li><strong>Image Quality Assessment (IQA):</strong> Evaluates illumination, sharpness, and macular field visibility.</li>
              <li><strong>Tele-Ophthalmology Triage:</strong> Generates case tickets for remote specialist consultation and appointment scheduling.</li>
              <li><strong>Patient Reports:</strong> Multilingual summary generation for referral follow-up.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <ShieldCheck size={18} color="#059669" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                2. User Obligations & Appropriate Use
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              Users must ensure all uploaded fundus photography is obtained with proper patient consent. PHC workers and clinicians agree not to reverse engineer the AI inference models or circumvent security safeguards.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Scale size={18} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                3. Limitation of Liability
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              To the maximum extent permitted under applicable law, SERIX and its developers are not liable for clinical outcomes, treatment choices, or missed diagnoses resulting from degraded image quality, non-standard camera optics, or delay in specialist follow-up.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #E2E8F0"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              Emergency Medical Notice
            </h3>
            <p style={{ lineHeight: 1.6, color: "#64748B", margin: 0, fontSize: "0.925rem" }}>
              SERIX is not designed for acute retinal detachment or ophthalmic trauma emergencies. In case of sudden loss of vision, immediate emergency care must be sought at the nearest hospital.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
