import { useEffect, useMemo, useState } from "react";
import LiquidGlass from "./LiquidGlass";
import useLanguageStore from "../store/useLanguageStore";

import {
  generateClinicalReportPdf,
  sendClinicalReportToWhatsApp,
} from "../api/endpoints";


function ClinicalReport({
  file,
  eye,
  quality,
  grade,
  report,
}) {
  const { t } = useLanguageStore();

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [pdfReady, setPdfReady] =
    useState(false);

  const [pdfError, setPdfError] =
    useState("");

  const [pdfUrl, setPdfUrl] =
    useState(null);

  const [zoom, setZoom] =
    useState(100);

  const [phone, setPhone] =
    useState("");

  const [phoneStatus, setPhoneStatus] =
    useState(null);

  const [sendLoading, setSendLoading] =
    useState(false);

  const [sendStatus, setSendStatus] =
    useState(null);

  /*
   * Keep one report ID for the entire screening session.
   * The same ID is shown in the preview and sent to the PDF generator.
   */
  const [reportId] = useState(
    () => `RT-${Date.now().toString().slice(-8)}`
  );


  /* =========================================================
     CLEANUP PDF OBJECT URL
     ========================================================= */

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);


  /* =========================================================
     DATA
     ========================================================= */

  const lesions =
    report?.lesions || {};

  const confidenceBreakdown =
    report?.confidence_breakdown || {};


  const reportData = useMemo(
    () => ({
      report_title:
        "RetinaTrack Clinical Screening Report",

      report_id:
        reportId,

      generated_at:
        report?.generated_at ||
        new Date().toISOString(),

      file_name:
        file?.name ||
        "retinal-image",

      eye:
        eye === "right"
          ? "Right Eye"
          : "Left Eye",

      image_quality:
        quality?.quality_score ??
        confidenceBreakdown.image_quality ??
        0,

      quality_label:
        quality?.quality_label ||
        "GRADABLE",

      dr_level:
        grade?.dr_level ??
        null,

      dr_label:
        grade?.dr_label ||
        "Assessment unavailable",

      confidence:
        grade?.confidence ??
        0,

      calibrated_confidence:
        grade?.calibrated_confidence ??
        0,

      refer:
        Boolean(grade?.refer),

      referral_urgency:
        grade?.referral_urgency ||
        "Not specified",

      routing:
        grade?.routing ||
        "Not specified",

      lesions: {
        microaneurysms:
          lesions.microaneurysms ?? 0,

        hemorrhages:
          lesions.hemorrhages ?? 0,

        hard_exudates:
          lesions.hard_exudates ?? 0,

        soft_exudates:
          lesions.soft_exudates ?? 0,

        neovascularization:
          Boolean(
            lesions.neovascularization
          ),
      },

      anatomy:
        report?.anatomy || {},

      clinical_summary:
        report?.clinical_summary ||
        "No clinical summary available.",

      evidence_statement:
        report?.evidence_statement ||
        "No evidence statement available.",

      confidence_breakdown: {
        image_quality:
          confidenceBreakdown.image_quality ??
          quality?.quality_score ??
          0,

        classification:
          confidenceBreakdown.classification ??
          grade?.confidence ??
          0,

        lesion_detection:
          confidenceBreakdown.lesion_detection ??
          0,
      },
    }),
    [
      file,
      eye,
      reportId,
      quality,
      grade,
      report,
      lesions,
      confidenceBreakdown,
    ]
  );


  /* =========================================================
     SEVERITY
     ========================================================= */

  const drLevel =
    Number.isFinite(
      Number(reportData.dr_level)
    )
      ? Number(reportData.dr_level)
      : null;


  const getSeverity = () => {
    if (drLevel === 0) {
      return {
        key: "normal",
        label: "Normal",
        color: "#16834f",
        background: "#effaf4",
        border: "#b8e6cd",
      };
    }

    if (drLevel === 1) {
      return {
        key: "mild",
        label: "Mild Non-Proliferative DR",
        color: "#16834f",
        background: "#effaf4",
        border: "#b8e6cd",
      };
    }

    if (drLevel === 2) {
      return {
        key: "moderate",
        label: "Moderate Non-Proliferative DR",
        color: "#a16207",
        background: "#fff9e8",
        border: "#f2d58a",
      };
    }

    if (
      drLevel === 3 ||
      drLevel === 4
    ) {
      return {
        key: "severe",
        label:
          drLevel === 4
            ? "Proliferative DR"
            : "Severe Non-Proliferative DR",
        color: "#b42318",
        background: "#fff1f1",
        border: "#f3b6b6",
      };
    }

    return {
      key: "moderate",
      label:
        reportData.dr_label,
      color: "#a16207",
      background: "#fff9e8",
      border: "#f2d58a",
    };
  };


  const severity =
    getSeverity();


  /* =========================================================
     IMAGE PREVIEW
     ========================================================= */

  const imagePreview =
    useMemo(() => {
      if (!file) {
        return null;
      }

      return URL.createObjectURL(file);
    }, [file]);


  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);


  /* =========================================================
     ZOOM
     ========================================================= */

  const decreaseZoom = () => {
    setZoom((current) =>
      Math.max(
        60,
        current - 10
      )
    );
  };


  const increaseZoom = () => {
    setZoom((current) =>
      Math.min(
        160,
        current + 10
      )
    );
  };


  const resetZoom = () => {
    setZoom(100);
  };


  /* =========================================================
     GENERATE PDF
     ========================================================= */

  const handleGeneratePdf =
    async () => {
      setPdfLoading(true);
      setPdfError("");
      setSendStatus(null);

      try {
        const blob =
          await generateClinicalReportPdf(
            file,
            reportData
          );

        if (pdfUrl) {
          URL.revokeObjectURL(
            pdfUrl
          );
        }

        const newUrl =
          URL.createObjectURL(blob);

        setPdfUrl(newUrl);
        setPdfReady(true);

        /*
         * Download a copy as well.
         */
        const anchor =
          document.createElement("a");

        anchor.href = newUrl;

        anchor.download =
          `RetinaTrack_Clinical_Report_${reportData.report_id}.pdf`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

      } catch (error) {
        setPdfError(
          error?.response?.data?.detail ||
          error?.message ||
          t("serviceUnavailableHelp")
        );
      } finally {
        setPdfLoading(false);
      }
    };


  /* =========================================================
     PHONE VALIDATION
     ========================================================= */

  const validatePhoneLocally =
    (value) => {
      const normalized =
        value.replace(
          /\D/g,
          ""
        );

      const valid =
        normalized.length >= 8 &&
        normalized.length <= 15 &&
        !normalized.startsWith("0");

      return {
        valid,
        normalized,
      };
    };


  const handlePhoneChange =
    (event) => {
      const digitsOnly =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 15);

      setPhone(digitsOnly);
      setSendStatus(null);

      if (!digitsOnly) {
        setPhoneStatus(null);
        return;
      }

      const {
        valid,
        normalized,
      } =
        validatePhoneLocally(
          digitsOnly
        );

      setPhoneStatus({
        ok: valid,
        normalized,
        message: valid
          ? t("numberValidMsg")
          : t("numberInvalidMsg"),
      });
    };


  /* =========================================================
     SEND WHATSAPP
     ========================================================= */

  const handleSendWhatsApp =
    async () => {
      if (!phoneStatus?.ok) {
        return;
      }

      setSendLoading(true);
      setSendStatus(null);
      setPdfError("");

      try {
        const result =
          await sendClinicalReportToWhatsApp(
            file,
            phoneStatus.normalized ||
              phone,
            reportData
          );

        setSendStatus({
          ok: true,
          message:
            result.message ||
            t("whatsappSuccess"),
        });

      } catch (error) {
        setSendStatus({
          ok: false,
          message:
            error?.response?.data
              ?.detail ||
            error?.message ||
            t(
              "serviceUnavailableHelp"
            ),
        });

      } finally {
        setSendLoading(false);
      }
    };


  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formattedDate =
    new Date(
      reportData.generated_at
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );


  /* =========================================================
     UI
     ========================================================= */

  return (
    <section
      className="dashboard-section clinical-report-section"
    >

      {/* =====================================================
          SECTION TITLE
          ===================================================== */}

      <div className="section-heading">
        <div>
          <span className="section-kicker">
            CLINICAL REPORT
          </span>

          <h2>
            Clinical Screening Report
          </h2>

          <p>
            Formal clinician-oriented
            screening document.
          </p>
        </div>
      </div>


      {/* =====================================================
          REPORT VIEWER
          ===================================================== */}

      <LiquidGlass
        variant="light"
        className="clinical-document-viewer"
      >

        {/* ===================================================
            VIEWER TOOLBAR
            =================================================== */}

        <div className="clinical-document-toolbar">

          <div className="clinical-document-toolbar-left">

            <div className="clinical-document-file">

              <span className="clinical-document-file-icon">
                PDF
              </span>

              <div>
                <strong>
                  Clinical Report
                </strong>

                <small>
                  {file?.name ||
                    "Retinal image"}
                </small>
              </div>

            </div>

          </div>


          <div className="clinical-document-controls">

            <button
              type="button"
              onClick={decreaseZoom}
              disabled={zoom <= 60}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              className="clinical-document-zoom-value"
              onClick={resetZoom}
              title="Reset zoom"
            >
              {zoom}%
            </button>

            <button
              type="button"
              onClick={increaseZoom}
              disabled={zoom >= 160}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>

            <span className="clinical-document-divider" />

            <button
              type="button"
              className="clinical-document-fit-button"
              onClick={() =>
                setZoom(85)
              }
            >
              Fit Width
            </button>

          </div>

        </div>


        {/* ===================================================
            SCROLLABLE DOCUMENT AREA
            =================================================== */}

        <div className="clinical-document-scroll">

          <div
            className="clinical-document-zoom-layer"
            style={{
              zoom: `${zoom}%`,
            }}
          >

            {/* =================================================
                A4 FORMAL REPORT
                ================================================= */}

            <article className="clinical-a4-page">

              {/* ===============================================
                  REPORT HEADER
                  =============================================== */}

              <header className="clinical-a4-header">

                <div className="clinical-a4-brand">

                  <div className="clinical-a4-logo">
                    ◎
                  </div>

                  <div>
                    <h1>
                      RetinaTrack<span>.AI</span>
                    </h1>

                    <p>
                      Intelligent Fundus Screening
                    </p>
                  </div>

                </div>


                <div className="clinical-a4-document-meta">

                  <strong>
                    CLINICAL SCREENING REPORT
                  </strong>

                  <span>
                    Report ID: {reportData.report_id}
                  </span>

                  <span>
                    {formattedDate}
                  </span>

                </div>

              </header>


              <div className="clinical-a4-rule" />


              {/* ===============================================
                  REPORT TITLE
                  =============================================== */}

              <section className="clinical-a4-title">

                <div>

                  <span>
                    DIABETIC RETINOPATHY
                    SCREENING
                  </span>

                  <h2>
                    Retinal Image
                    Assessment
                  </h2>

                  <p>
                    AI-assisted retinal
                    screening assessment
                    for clinician review.
                  </p>

                </div>


                <div
                  className="clinical-a4-severity"
                  style={{
                    color:
                      severity.color,
                    background:
                      severity.background,
                    borderColor:
                      severity.border,
                  }}
                >

                  <small>
                    PRIMARY ASSESSMENT
                  </small>

                  <strong>
                    {reportData.dr_label}
                  </strong>

                  <span>
                    DR Level{" "}
                    {reportData.dr_level ??
                      "—"}
                  </span>

                </div>

              </section>


              {/* ===============================================
                  SCREENING INFORMATION
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    01
                  </span>

                  <h3>
                    Screening Information
                  </h3>
                </div>


                <div className="clinical-a4-info-grid">

                  <A4Info
                    label="Eye"
                    value={
                      reportData.eye
                    }
                  />

                  <A4Info
                    label="Image File"
                    value={
                      reportData.file_name
                    }
                  />

                  <A4Info
                    label="Image Quality"
                    value={
                      `${Math.round(
                        reportData.image_quality *
                          100
                      )}% — ${
                        reportData.quality_label
                      }`
                    }
                  />

                  <A4Info
                    label="Assessment Type"
                    value="AI-assisted screening"
                  />

                </div>

              </section>


              {/* ===============================================
                  PRIMARY ASSESSMENT
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    02
                  </span>

                  <h3>
                    Primary Assessment
                  </h3>
                </div>


                <div
                  className="clinical-a4-assessment-box"
                  style={{
                    borderColor:
                      severity.border,
                    background:
                      severity.background,
                  }}
                >

                  <div>

                    <small>
                      DIABETIC RETINOPATHY
                      CLASSIFICATION
                    </small>

                    <strong
                      style={{
                        color:
                          severity.color,
                      }}
                    >
                      {reportData.dr_label}
                    </strong>

                  </div>


                  <div className="clinical-a4-assessment-score">

                    <small>
                      MODEL CONFIDENCE
                    </small>

                    <strong
                      style={{
                        color:
                          severity.color,
                      }}
                    >
                      {Math.round(
                        reportData.confidence *
                          100
                      )}
                      %
                    </strong>

                    <span>
                      Calibrated{" "}
                      {Math.round(
                        reportData
                          .calibrated_confidence *
                          100
                      )}
                      %
                    </span>

                  </div>

                </div>

              </section>


              {/* ===============================================
                  RETINAL IMAGE
                  =============================================== */}

              {imagePreview && (

                <section className="clinical-a4-section">

                  <div className="clinical-a4-section-heading">
                    <span>
                      03
                    </span>

                    <h3>
                      Examined Retinal Image
                    </h3>
                  </div>


                  <div className="clinical-a4-image-frame">

                    <img
                      src={imagePreview}
                      alt="Examined retinal fundus"
                    />

                    <div className="clinical-a4-image-caption">
                      <span>
                        {reportData.eye}
                      </span>

                      <span>
                        {reportData.file_name}
                      </span>
                    </div>

                  </div>

                </section>

              )}


              {/* ===============================================
                  DETECTED FINDINGS
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    04
                  </span>

                  <h3>
                    Detected Retinal Findings
                  </h3>
                </div>


                <table className="clinical-a4-findings-table">

                  <thead>
                    <tr>
                      <th>
                        Finding
                      </th>

                      <th>
                        Detected Count
                      </th>

                      <th>
                        Assessment
                      </th>
                    </tr>
                  </thead>


                  <tbody>

                    <FindingRow
                      label="Microaneurysms"
                      value={
                        lesions.microaneurysms ??
                        0
                      }
                    />

                    <FindingRow
                      label="Hemorrhages"
                      value={
                        lesions.hemorrhages ??
                        0
                      }
                    />

                    <FindingRow
                      label="Hard Exudates"
                      value={
                        lesions.hard_exudates ??
                        0
                      }
                    />

                    <FindingRow
                      label="Soft Exudates"
                      value={
                        lesions.soft_exudates ??
                        0
                      }
                    />

                    <FindingRow
                      label="Neovascularization"
                      value={
                        lesions.neovascularization
                          ? "Present"
                          : "Not detected"
                      }
                    />

                  </tbody>

                </table>

              </section>


              {/* ===============================================
                  CLINICAL INTERPRETATION
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    05
                  </span>

                  <h3>
                    Clinical Interpretation
                  </h3>
                </div>


                <div className="clinical-a4-text-block">

                  <p>
                    {reportData.clinical_summary}
                  </p>

                </div>

              </section>


              {/* ===============================================
                  AI EVIDENCE
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    06
                  </span>

                  <h3>
                    AI Evidence
                  </h3>

                </div>


                <div className="clinical-a4-text-block">

                  <p>
                    {reportData.evidence_statement}
                  </p>

                </div>


                <div className="clinical-a4-confidence-grid">

                  <ConfidenceItem
                    label="Image Quality"
                    value={
                      reportData
                        .confidence_breakdown
                        .image_quality
                    }
                  />

                  <ConfidenceItem
                    label="Classification"
                    value={
                      reportData
                        .confidence_breakdown
                        .classification
                    }
                  />

                  <ConfidenceItem
                    label="Lesion Detection"
                    value={
                      reportData
                        .confidence_breakdown
                        .lesion_detection
                    }
                  />

                </div>

              </section>


              {/* ===============================================
                  REFERRAL
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    07
                  </span>

                  <h3>
                    Referral Recommendation
                  </h3>
                </div>


                <div
                  className="clinical-a4-referral"
                  style={{
                    borderColor:
                      severity.border,
                    background:
                      severity.background,
                  }}
                >

                  <div
                    className="clinical-a4-referral-icon"
                    style={{
                      background:
                        severity.color,
                    }}
                  >
                    !
                  </div>

                  <div>

                    <strong
                      style={{
                        color:
                          severity.color,
                      }}
                    >
                      {reportData.refer
                        ? "Referral Recommended"
                        : "Referral Not Indicated"}
                    </strong>

                    <p>
                      Routing:{" "}
                      {reportData.routing}
                    </p>

                    <p>
                      Urgency:{" "}
                      {reportData.referral_urgency}
                    </p>

                  </div>

                </div>

              </section>


              {/* ===============================================
                  ANATOMY
                  =============================================== */}

              <section className="clinical-a4-section">

                <div className="clinical-a4-section-heading">
                  <span>
                    08
                  </span>

                  <h3>
                    Anatomical Assessment
                  </h3>

                </div>


                <div className="clinical-a4-anatomy">

                  <A4Status
                    label="Optic Disc"
                    detected={
                      reportData.anatomy
                        ?.optic_disc_detected
                    }
                  />

                  <A4Status
                    label="Fovea"
                    detected={
                      reportData.anatomy
                        ?.fovea_detected
                    }
                  />

                </div>

              </section>


              {/* ===============================================
                  SIGN-OFF
                  =============================================== */}

              <section className="clinical-a4-signoff">

                <div>

                  <strong>
                    AI Screening Assessment
                  </strong>

                  <p>
                    Generated by RetinaTrack.AI
                    screening system.
                  </p>

                </div>


                <div className="clinical-a4-signature-line">

                  <span>
                    Clinician Review
                  </span>

                  <div />

                  <small>
                    Signature / Date
                  </small>

                </div>

              </section>


              {/* ===============================================
                  DISCLAIMER
                  =============================================== */}

              <footer className="clinical-a4-footer">

                <strong>
                  IMPORTANT CLINICAL NOTICE
                </strong>

                <p>
                  This report is an AI-assisted
                  screening aid and is not a
                  definitive medical diagnosis.
                  Results should be reviewed and
                  clinically validated by a qualified
                  healthcare professional before
                  making patient-management decisions.
                </p>

                <div>

                  <span>
                    RetinaTrack.AI
                  </span>

                  <span>
                    Confidential Clinical Document
                  </span>

                </div>

              </footer>

            </article>

          </div>

        </div>

      </LiquidGlass>


      {/* =====================================================
          PDF ACTION
          ===================================================== */}

      <div className="clinical-report-pdf-action">

        <div>

          <span>
            CLINICAL DOCUMENT
          </span>

          <strong>
            {pdfReady
              ? "PDF generated successfully"
              : "Generate the formal report"}
          </strong>

          <p>
            Download the complete A4
            clinical screening report.
          </p>

        </div>


        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={pdfLoading}
        >
          {pdfLoading
            ? "Generating PDF..."
            : "Generate Clinical Report"}
        </button>

      </div>


      {pdfError && (

        <div className="clinical-report-message error">
          {pdfError}
        </div>

      )}


      {/* =====================================================
          WHATSAPP DELIVERY
          ===================================================== */}

      <LiquidGlass
        variant="light"
        className="clinical-whatsapp-card"
      >

        <div className="clinical-whatsapp-header">

          <div>

            <span>
              WHATSAPP DELIVERY
            </span>

            <h3>
              Send Report via WhatsApp
            </h3>

            <p>
              Enter the recipient's
              international phone number.
            </p>

          </div>

        </div>


        <div className="clinical-whatsapp-form">

          <div className="clinical-whatsapp-input">

            <span>
              +
            </span>

            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={
                handlePhoneChange
              }
              placeholder="919876543210"
              maxLength={15}
              aria-label={
                t("whatsappPhoneLabel")
              }
            />

          </div>


          <button
            type="button"
            className="clinical-whatsapp-send"
            onClick={
              handleSendWhatsApp
            }
            disabled={
              sendLoading ||
              !phoneStatus?.ok
            }
          >
            {sendLoading
              ? "Sending..."
              : "Send Report"}
          </button>

        </div>


        {phoneStatus && (

          <div
            className={
              `clinical-whatsapp-status ${
                phoneStatus.ok
                  ? "success"
                  : "error"
              }`
            }
          >

            <span>
              {phoneStatus.ok
                ? "✓"
                : "!"}
            </span>

            <div>

              <strong>
                {phoneStatus.ok
                  ? t("numberVerified")
                  : t("numberNotVerified")}
              </strong>

              <p>
                {phoneStatus.message}
              </p>

            </div>

          </div>

        )}


        {sendStatus && (

          <div
            className={
              `clinical-report-message ${
                sendStatus.ok
                  ? "success"
                  : "error"
              }`
            }
          >
            {sendStatus.message}
          </div>

        )}

      </LiquidGlass>


      {/* =====================================================
          COMPONENT STYLES
          ===================================================== */}

      <style>{`

        /* =====================================================
           DOCUMENT VIEWER
           ===================================================== */

        .clinical-document-viewer {
          overflow: hidden;
          padding: 0 !important;
        }


        .clinical-document-toolbar {
          height: 66px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            0 20px;

          border-bottom:
            1px solid
            rgba(30,60,90,0.10);

          background:
            rgba(248,251,255,0.78);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          position: sticky;
          top: 0;
          z-index: 20;
        }


        .clinical-document-file {
          display: flex;
          align-items: center;
          gap: 11px;
        }


        .clinical-document-file-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            #eaf3ff;

          color:
            #2176b9;

          font-size:
            0.65rem;

          font-weight:
            800;
        }


        .clinical-document-file strong {
          display: block;

          color:
            #1c314d;

          font-size:
            0.86rem;
        }


        .clinical-document-file small {
          display: block;

          margin-top: 2px;

          color:
            #7890a8;

          font-size:
            0.68rem;
        }


        /* =====================================================
           ZOOM CONTROLS
           ===================================================== */

        .clinical-document-controls {
          display: flex;
          align-items: center;
          gap: 5px;
        }


        .clinical-document-controls button {
          min-width: 34px;
          height: 34px;

          border:
            1px solid
            rgba(50,80,110,0.13);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.76);

          color:
            #29415d;

          cursor: pointer;

          font-weight:
            700;

          transition:
            all 160ms ease;
        }


        .clinical-document-controls button:hover:not(:disabled) {
          background:
            var(--color-surface);

          transform:
            translateY(-1px);

          box-shadow:
            0 5px 14px
            rgba(30,70,110,0.10);
        }


        .clinical-document-controls button:disabled {
          opacity:
            0.35;

          cursor:
            not-allowed;
        }


        .clinical-document-controls
        .clinical-document-zoom-value {
          min-width:
            58px;

          font-size:
            0.72rem;
        }


        .clinical-document-fit-button {
          padding:
            0 12px;

          font-size:
            0.70rem;
        }


        .clinical-document-divider {
          width: 1px;
          height: 24px;

          margin:
            0 6px;

          background:
            rgba(30,60,90,0.12);
        }


        /* =====================================================
           SCROLL AREA
           ===================================================== */

        .clinical-document-scroll {
          height:
            760px;

          overflow:
            auto;

          padding:
            34px;

          background:
            linear-gradient(
              145deg,
              #e9eef3,
              #f4f6f8
            );

          scrollbar-width:
            thin;
        }


        .clinical-document-scroll::-webkit-scrollbar {
          width:
            10px;

          height:
            10px;
        }


        .clinical-document-scroll::-webkit-scrollbar-track {
          background:
            rgba(0,0,0,0.04);
        }


        .clinical-document-scroll::-webkit-scrollbar-thumb {
          background:
            rgba(65,90,115,0.28);

          border-radius:
            10px;
        }


        .clinical-document-zoom-layer {
          width:
            max-content;

          margin:
            0 auto;
        }


        /* =====================================================
           A4 PAGE
           ===================================================== */

        .clinical-a4-page {
          width:
            794px;

          min-height:
            1123px;

          box-sizing:
            border-box;

          background:
            var(--color-surface);

          color:
            #20344c;

          padding:
            52px 58px 48px;

          box-shadow:
            0 14px 45px
            rgba(28,50,75,0.18);

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* =====================================================
           HEADER
           ===================================================== */

        .clinical-a4-header {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap:
            30px;
        }


        .clinical-a4-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .clinical-a4-logo {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            #2167d8;

          color:
            var(--color-surface);

          font-size:
            24px;

          font-weight:
            700;
        }


        .clinical-a4-brand h1 {
          margin:
            0;

          font-size:
            20px;

          line-height:
            1.1;

          letter-spacing:
            -0.03em;

          color:
            #152b45;
        }


        .clinical-a4-brand h1 span {
          color:
            #2875dc;
        }


        .clinical-a4-brand p {
          margin:
            4px 0 0;

          font-size:
            8px;

          color:
            #7990a8;

          letter-spacing:
            0.02em;
        }


        .clinical-a4-document-meta {
          display: flex;
          flex-direction: column;

          align-items: flex-end;

          gap:
            4px;

          text-align:
            right;
        }


        .clinical-a4-document-meta strong {
          color:
            #236eb6;

          font-size:
            9px;

          letter-spacing:
            0.13em;
        }


        .clinical-a4-document-meta span {
          color:
            #8295a8;

          font-size:
            8px;
        }


        .clinical-a4-rule {
          height: 1px;

          margin:
            22px 0 30px;

          background:
            #dbe3ea;
        }


        /* =====================================================
           TITLE
           ===================================================== */

        .clinical-a4-title {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap:
            25px;

          margin-bottom:
            34px;
        }


        .clinical-a4-title > div:first-child {
          flex: 1;
        }


        .clinical-a4-title > div:first-child > span {
          color:
            #3678ad;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            0.16em;
        }


        .clinical-a4-title h2 {
          margin:
            8px 0 6px;

          color:
            #172d47;

          font-size:
            27px;

          line-height:
            1.1;

          letter-spacing:
            -0.035em;
        }


        .clinical-a4-title p {
          margin:
            0;

          max-width:
            380px;

          color:
            #71869d;

          font-size:
            10px;

          line-height:
            1.6;
        }


        .clinical-a4-severity {
          width:
            210px;

          padding:
            14px 16px;

          border:
            1px solid;

          border-radius:
            8px;

          box-sizing:
            border-box;
        }


        .clinical-a4-severity small {
          display: block;

          margin-bottom:
            7px;

          font-size:
            7px;

          font-weight:
            800;

          letter-spacing:
            0.13em;
        }


        .clinical-a4-severity strong {
          display: block;

          font-size:
            13px;

          line-height:
            1.35;
        }


        .clinical-a4-severity span {
          display: block;

          margin-top:
            5px;

          font-size:
            9px;

          opacity:
            0.75;
        }


        /* =====================================================
           SECTION
           ===================================================== */

        .clinical-a4-section {
          margin-bottom:
            28px;
        }


        .clinical-a4-section-heading {
          display: flex;

          align-items: center;

          gap:
            9px;

          margin-bottom:
            13px;

          padding-bottom:
            8px;

          border-bottom:
            1px solid
            #e5ebf0;
        }


        .clinical-a4-section-heading span {
          color:
            #2875c2;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            0.08em;
        }


        .clinical-a4-section-heading h3 {
          margin:
            0;

          color:
            #263b53;

          font-size:
            12px;

          font-weight:
            750;
        }


        /* =====================================================
           INFO GRID
           ===================================================== */

        .clinical-a4-info-grid {
          display:
            grid;

          grid-template-columns:
            repeat(2, 1fr);

          border:
            1px solid
            #dfe7ed;

          border-radius:
            7px;

          overflow:
            hidden;
        }


        .clinical-a4-info-item {
          padding:
            12px 14px;

          border-bottom:
            1px solid
            #e5ebf0;
        }


        .clinical-a4-info-item:nth-child(odd) {
          border-right:
            1px solid
            #e5ebf0;
        }


        .clinical-a4-info-item:nth-last-child(-n+2) {
          border-bottom:
            0;
        }


        .clinical-a4-info-item span {
          display: block;

          margin-bottom:
            4px;

          color:
            #8498ab;

          font-size:
            7px;

          font-weight:
            800;

          text-transform:
            uppercase;

          letter-spacing:
            0.12em;
        }


        .clinical-a4-info-item strong {
          display: block;

          color:
            #2a4059;

          font-size:
            9px;

          word-break:
            break-word;
        }


        /* =====================================================
           ASSESSMENT
           ===================================================== */

        .clinical-a4-assessment-box {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap:
            20px;

          padding:
            17px;

          border:
            1px solid;

          border-radius:
            8px;
        }


        .clinical-a4-assessment-box small,
        .clinical-a4-assessment-score small {
          display: block;

          margin-bottom:
            5px;

          color:
            #71859a;

          font-size:
            7px;

          font-weight:
            800;

          letter-spacing:
            0.11em;
        }


        .clinical-a4-assessment-box strong {
          display: block;

          font-size:
            16px;
        }


        .clinical-a4-assessment-score {
          text-align:
            right;
        }


        .clinical-a4-assessment-score > strong {
          display: block;

          font-size:
            25px;
        }


        .clinical-a4-assessment-score span {
          display: block;

          margin-top:
            2px;

          color:
            #8092a5;

          font-size:
            8px;
        }


        /* =====================================================
           IMAGE
           ===================================================== */

        .clinical-a4-image-frame {
          border:
            1px solid
            #dfe6ec;

          background:
            #f6f8fa;

          border-radius:
            7px;

          overflow:
            hidden;
        }


        .clinical-a4-image-frame img {
          display:
            block;

          width:
            100%;

          max-height:
            285px;

          object-fit:
            contain;

          background:
            #111827;
        }


        .clinical-a4-image-caption {
          display: flex;

          justify-content:
            space-between;

          padding:
            8px 11px;

          color:
            #7b8fa3;

          font-size:
            7px;
        }


        /* =====================================================
           FINDINGS TABLE
           ===================================================== */

        .clinical-a4-findings-table {
          width:
            100%;

          border-collapse:
            collapse;

          border:
            1px solid
            #dfe6ec;

          font-size:
            9px;
        }


        .clinical-a4-findings-table th {
          padding:
            9px 11px;

          text-align:
            left;

          background:
            #f2f6f9;

          color:
            #58718a;

          font-size:
            7px;

          text-transform:
            uppercase;

          letter-spacing:
            0.09em;
        }


        .clinical-a4-findings-table td {
          padding:
            9px 11px;

          border-top:
            1px solid
            #e5ebef;

          color:
            #334b64;
        }


        .clinical-a4-findings-table td:nth-child(2) {
          font-weight:
            800;
        }


        .clinical-a4-findings-table td:last-child {
          color:
            #73889b;

          font-size:
            8px;
        }


        /* =====================================================
           TEXT BLOCK
           ===================================================== */

        .clinical-a4-text-block {
          padding:
            14px 16px;

          border:
            1px solid
            #e0e7ed;

          border-radius:
            7px;

          background:
            #fafcfd;
        }


        .clinical-a4-text-block p {
          margin:
            0;

          color:
            #4e667e;

          font-size:
            9px;

          line-height:
            1.7;
        }


        /* =====================================================
           CONFIDENCE
           ===================================================== */

        .clinical-a4-confidence-grid {
          display:
            grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap:
            8px;

          margin-top:
            9px;
        }


        .clinical-a4-confidence-item {
          padding:
            10px;

          border:
            1px solid
            #e0e7ed;

          border-radius:
            6px;
        }


        .clinical-a4-confidence-item span {
          display: block;

          color:
            #7b90a4;

          font-size:
            7px;
        }


        .clinical-a4-confidence-item strong {
          display: block;

          margin-top:
            4px;

          color:
            #2c4560;

          font-size:
            15px;
        }


        /* =====================================================
           REFERRAL
           ===================================================== */

        .clinical-a4-referral {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          padding:
            13px 15px;

          border:
            1px solid;

          border-radius:
            7px;
        }


        .clinical-a4-referral-icon {
          width:
            27px;

          height:
            27px;

          flex:
            0 0 27px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            50%;

          color:
            white;

          font-weight:
            800;
        }


        .clinical-a4-referral strong {
          display:
            block;

          font-size:
            10px;
        }


        .clinical-a4-referral p {
          display:
            inline-block;

          margin:
            5px 14px 0 0;

          color:
            #6f8498;

          font-size:
            8px;
        }


        /* =====================================================
           ANATOMY
           ===================================================== */

        .clinical-a4-anatomy {
          display:
            grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap:
            9px;
        }


        .clinical-a4-anatomy-item {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            11px 13px;

          border:
            1px solid
            #e0e7ed;

          border-radius:
            7px;
        }


        .clinical-a4-anatomy-item span {
          color:
            #526b83;

          font-size:
            8px;

          font-weight:
            650;
        }


        .clinical-a4-anatomy-item strong {
          font-size:
            8px;
        }


        .clinical-a4-anatomy-item strong.detected {
          color:
            #16834f;
        }


        .clinical-a4-anatomy-item strong.not-detected {
          color:
            #a16207;
        }


        /* =====================================================
           SIGN OFF
           ===================================================== */

        .clinical-a4-signoff {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            flex-end;

          gap:
            30px;

          margin:
            38px 0 28px;

          padding-top:
            22px;

          border-top:
            1px solid
            #dce5eb;
        }


        .clinical-a4-signoff strong {
          color:
            #304963;

          font-size:
            9px;
        }


        .clinical-a4-signoff p {
          margin:
            4px 0 0;

          color:
            #8496a7;

          font-size:
            7px;
        }


        .clinical-a4-signature-line {
          width:
            190px;
        }


        .clinical-a4-signature-line span {
          display:
            block;

          margin-bottom:
            17px;

          color:
            #74899d;

          font-size:
            7px;
        }


        .clinical-a4-signature-line div {
          height:
            1px;

          background:
            #9aaab8;
        }


        .clinical-a4-signature-line small {
          display:
            block;

          margin-top:
            5px;

          color:
            #9aaab8;

          font-size:
            6px;
        }


        /* =====================================================
           FOOTER
           ===================================================== */

        .clinical-a4-footer {
          padding:
            13px 15px;

          border:
            1px solid
            #e0e6eb;

          border-radius:
            7px;

          background:
            #f8fafb;
        }


        .clinical-a4-footer strong {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #526a80;

          font-size:
            7px;

          letter-spacing:
            0.10em;
        }


        .clinical-a4-footer p {
          margin:
            0;

          color:
            #7c8e9f;

          font-size:
            7px;

          line-height:
            1.55;
        }


        .clinical-a4-footer > div {
          display:
            flex;

          justify-content:
            space-between;

          margin-top:
            10px;

          padding-top:
            8px;

          border-top:
            1px solid
            #e1e7ec;

          color:
            #98a6b2;

          font-size:
            6px;
        }


        /* =====================================================
           PDF ACTION
           ===================================================== */

        .clinical-report-pdf-action {
          margin-top:
            16px;

          padding:
            18px 20px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          border:
            1px solid
            rgba(45,120,175,0.18);

          border-radius:
            14px;

          background:
            rgba(239,248,255,0.74);

          backdrop-filter:
            blur(14px);
        }


        .clinical-report-pdf-action span {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #3279ad;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            0.12em;
        }


        .clinical-report-pdf-action strong {
          display:
            block;

          color:
            #203952;

          font-size:
            14px;
        }


        .clinical-report-pdf-action p {
          margin:
            4px 0 0;

          color:
            #71879d;

          font-size:
            10px;
        }


        .clinical-report-pdf-action button {
          flex:
            0 0 auto;

          padding:
            13px 20px;

          border:
            0;

          border-radius:
            10px;

          background:
            linear-gradient(
              135deg,
              #2175bd,
              #2c8bc4
            );

          color:
            white;

          font-size:
            12px;

          font-weight:
            750;

          cursor:
            pointer;

          box-shadow:
            0 9px 22px
            rgba(33,117,189,0.22);
        }


        .clinical-report-pdf-action button:disabled {
          opacity:
            0.55;

          cursor:
            wait;
        }


        /* =====================================================
           WHATSAPP
           ===================================================== */

        .clinical-whatsapp-card {
          margin-top:
            16px;
        }


        .clinical-whatsapp-header span {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #2c8b63;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            0.12em;
        }


        .clinical-whatsapp-header h3 {
          margin:
            0;

          color:
            #243a53;

          font-size:
            16px;
        }


        .clinical-whatsapp-header p {
          margin:
            5px 0 0;

          color:
            #7890a7;

          font-size:
            10px;
        }


        .clinical-whatsapp-form {
          display:
            flex;

          gap:
            10px;

          margin-top:
            16px;
        }


        .clinical-whatsapp-input {
          flex:
            1;

          height:
            46px;

          display:
            flex;

          align-items:
            center;

          border:
            1px solid
            #d9e3ea;

          border-radius:
            10px;

          background:
            rgba(255,255,255,0.8);

          overflow:
            hidden;
        }


        .clinical-whatsapp-input span {
          padding:
            0 12px;

          color:
            #60778e;

          font-weight:
            700;

          border-right:
            1px solid
            #e3e9ee;
        }


        .clinical-whatsapp-input input {
          flex:
            1;

          height:
            100%;

          border:
            0;

          outline:
            0;

          padding:
            0 13px;

          background:
            transparent;

          color:
            #253b54;

          font-size:
            13px;
        }


        .clinical-whatsapp-send {
          padding:
            0 20px;

          border:
            0;

          border-radius:
            10px;

          background:
            #188b59;

          color:
            white;

          font-weight:
            750;

          cursor:
            pointer;
        }


        .clinical-whatsapp-send:disabled {
          opacity:
            0.45;

          cursor:
            not-allowed;
        }


        .clinical-whatsapp-status {
          display:
            flex;

          gap:
            9px;

          align-items:
            center;

          margin-top:
            12px;

          padding:
            10px 12px;

          border-radius:
            9px;

          font-size:
            10px;
        }


        .clinical-whatsapp-status.success {
          color:
            #167047;

          background:
            #edf9f3;

          border:
            1px solid
            #c6ead6;
        }


        .clinical-whatsapp-status.error {
          color:
            #a72b25;

          background:
            #fff1f0;

          border:
            1px solid
            #f0c6c3;
        }


        .clinical-whatsapp-status strong {
          display:
            block;

          font-size:
            10px;
        }


        .clinical-whatsapp-status p {
          margin:
            2px 0 0;

          opacity:
            0.75;
        }


        /* =====================================================
           ERROR / STATUS
           ===================================================== */

        .clinical-report-message {
          margin-top:
            12px;

          padding:
            11px 13px;

          border-radius:
            9px;

          font-size:
            10px;
        }


        .clinical-report-message.success {
          color:
            #167047;

          background:
            #edf9f3;

          border:
            1px solid
            #c6ead6;
        }


        .clinical-report-message.error {
          color:
            #a72b25;

          background:
            #fff1f0;

          border:
            1px solid
            #f0c6c3;
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 700px) {

          .clinical-document-toolbar {
            height:
              auto;

            min-height:
              62px;

            padding:
              10px 12px;

            gap:
              10px;

            flex-wrap:
              wrap;
          }


          .clinical-document-controls {
            margin-left:
              auto;
          }


          .clinical-document-scroll {
            height:
              620px;

            padding:
              20px;
          }


          .clinical-a4-page {
            width:
              794px;
          }


          .clinical-report-pdf-action {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .clinical-report-pdf-action button {
            width:
              100%;
          }


          .clinical-whatsapp-form {
            flex-direction:
              column;
          }


          .clinical-whatsapp-send {
            height:
              44px;
          }

        }

      `}</style>

    </section>
  );
}


/* =========================================================
   A4 INFO
   ========================================================= */

function A4Info({
  label,
  value,
}) {
  return (
    <div className="clinical-a4-info-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   FINDING ROW
   ========================================================= */

function FindingRow({
  label,
  value,
}) {
  const numeric =
    typeof value === "number";

  return (
    <tr>

      <td>
        {label}
      </td>

      <td>
        {value}
      </td>

      <td>
        {numeric
          ? value > 0
            ? "Detected"
            : "Not detected"
          : value}
      </td>

    </tr>
  );
}


/* =========================================================
   CONFIDENCE ITEM
   ========================================================= */

function ConfidenceItem({
  label,
  value,
}) {
  return (
    <div className="clinical-a4-confidence-item">

      <span>
        {label}
      </span>

      <strong>
        {Math.round(
          (value ?? 0) * 100
        )}
        %
      </strong>

    </div>
  );
}


/* =========================================================
   ANATOMY STATUS
   ========================================================= */

function A4Status({
  label,
  detected,
}) {
  const exists =
    Boolean(detected);

  return (
    <div className="clinical-a4-anatomy-item">

      <span>
        {label}
      </span>

      <strong
        className={
          exists
            ? "detected"
            : "not-detected"
        }
      >
        {exists
          ? "Detected"
          : "Not detected"}
      </strong>

    </div>
  );
}


export default ClinicalReport;