import { useMemo, useState } from "react";
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneStatus, setPhoneStatus] = useState(null);

  const [sendLoading, setSendLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const lesions = report?.lesions || {};
  const confidence = report?.confidence_breakdown || {};

  // ---------------------------------------------------------
  // REPORT DATA
  // ---------------------------------------------------------
  const reportData = useMemo(
    () => ({
      report_title:
        "RetinaTrack Clinical Screening Report",

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
        confidence.image_quality ??
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
        report?.anatomy ||
        {},

      clinical_summary:
        report?.clinical_summary ||
        "No clinical summary available.",

      evidence_statement:
        report?.evidence_statement ||
        "No evidence statement available.",

      confidence_breakdown: {
        image_quality:
          confidence.image_quality ??
          quality?.quality_score ??
          0,

        classification:
          confidence.classification ??
          grade?.confidence ??
          0,

        lesion_detection:
          confidence.lesion_detection ??
          0,
      },
    }),

    [
      file,
      eye,
      quality,
      grade,
      report,
      lesions,
      confidence,
    ]
  );

  // ---------------------------------------------------------
  // GENERATE PDF
  // ---------------------------------------------------------
  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    setPdfError("");
    setSendStatus(null);

    try {
      const blob =
        await generateClinicalReportPdf(
          file,
          reportData
        );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        `RetinaTrack_Clinical_Report_${Date.now()}.pdf`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);

      setPdfReady(true);

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

  // ---------------------------------------------------------
  // AUTOMATIC PHONE FORMAT CHECK
  // ---------------------------------------------------------
  const validatePhoneLocally = (value) => {
    const normalized = value.replace(/\D/g, "");

    const valid =
      normalized.length >= 8 &&
      normalized.length <= 15 &&
      !normalized.startsWith("0");

    return {
      valid,
      normalized,
    };
  };

  const handlePhoneChange = (event) => {
    const digitsOnly = event.target.value
      .replace(/\D/g, "")
      .slice(0, 15);

    setPhone(digitsOnly);
    setSendStatus(null);

    if (!digitsOnly) {
      setPhoneStatus(null);
      return;
    }

    const { valid, normalized } =
      validatePhoneLocally(digitsOnly);

    setPhoneStatus({
      ok: valid,
      normalized,
      message: valid
        ? t("numberValidMsg")
        : t("numberInvalidMsg"),
    });
  };

  // ---------------------------------------------------------
  // SEND WHATSAPP REPORT
  // ---------------------------------------------------------
  const handleSendWhatsApp = async () => {
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
          error?.response?.data?.detail ||
          error?.message ||
          t("serviceUnavailableHelp"),
      });

    } finally {
      setSendLoading(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <section
      className="dashboard-section clinical-report-section"
    >
      {/* SECTION HEADER */}
      <div className="section-heading">
        <div>
          <span className="section-kicker">
            {t("clinicalReportSectionKicker")}
          </span>

          <h2>
            {t("genShareReportTitle")}
          </h2>

          <p>
            {t("genShareReportDesc")}
          </p>
        </div>
      </div>

      <LiquidGlass
        variant="light"
        className="clinical-report-card"
      >
        {/* REPORT HEADER */}
        <div className="clinical-report-header">
          <div>
            <span className="card-kicker">
              {t("serixScreeningReportKicker")}
            </span>

            <h3>
              {t("clinicalScreeningReportTitle")}
            </h3>

            <p>
              {t("clinicalScreeningReportDesc")}
            </p>
          </div>

          <div className="clinical-report-status">
            <span className="status-dot" />
            {pdfReady
              ? t("pdfReady")
              : t("reportAvailable")}
          </div>
        </div>

        {/* REPORT METRICS */}
        <div className="clinical-report-grid">
          <ReportValue
            label={t("eyeLabel")}
            value={eye === "right" ? t("rightEye") : t("leftEye")}
          />

          <ReportValue
            label={t("drLevelLabel")}
            value={
              reportData.dr_level !== null
                ? `${t("levelPrefix")} ${reportData.dr_level}`
                : "—"
            }
          />

          <ReportValue
            label={t("classificationLabel")}
            value={
              reportData.dr_label
            }
          />

          <ReportValue
            label={t("confidenceLabel")}
            value={
              `${Math.round(
                reportData.confidence * 100
              )}%`
            }
          />

          <ReportValue
            label={t("referralLabel")}
            value={
              reportData.refer
                ? t("recommendedLabel")
                : t("notIndicatedLabel")
            }
          />

          <ReportValue
            label={t("routingLabel")}
            value={
              reportData.routing
            }
          />
        </div>

        {/* CLINICAL FINDINGS */}
        <div className="clinical-report-findings">
          <div className="clinical-report-block">
            <span className="clinical-report-block-label">
              {t("clinicalFindingsUpper")}
            </span>

            <p>
              {reportData.clinical_summary}
            </p>
          </div>

          <div className="clinical-report-block">
            <span className="clinical-report-block-label">
              {t("aiEvidenceKicker")}
            </span>

            <p>
              {reportData.evidence_statement}
            </p>
          </div>
        </div>

        {/* DETECTED LESIONS */}
        <div className="clinical-report-lesions">
          <span className="clinical-report-block-label">
            {t("detectedFindingsUpper")}
          </span>

          <div className="clinical-report-lesion-grid">
            <Finding
              label={t("microaneurysmsLabel")}
              value={
                lesions.microaneurysms ?? 0
              }
            />

            <Finding
              label={t("hemorrhagesLabel")}
              value={
                lesions.hemorrhages ?? 0
              }
            />

            <Finding
              label={t("hardExudatesLabel")}
              value={
                lesions.hard_exudates ?? 0
              }
            />

            <Finding
              label={t("softExudatesLabel")}
              value={
                lesions.soft_exudates ?? 0
              }
            />
          </div>
        </div>

        {/* PDF GENERATION */}
        <div className="clinical-report-actions">
          <div>
            <span className="clinical-report-block-label">
              {t("pdfReportUpper")}
            </span>

            <p>
              {t("pdfReportDesc")}
            </p>
          </div>

          <button
            type="button"
            className="clinical-report-primary-button"
            onClick={handleGeneratePdf}
            disabled={pdfLoading}
          >
            {pdfLoading
              ? t("generatingPdf")
              : t("generateClinicalReportBtn")}
          </button>
        </div>

        {/* PDF ERROR */}
        {pdfError && (
          <div
            className="clinical-report-message error"
          >
            {pdfError}
          </div>
        )}

        {/* WHATSAPP */}
        <div className="whatsapp-share-panel">
          <div className="whatsapp-heading">
            <div>
              <div className="whatsapp-label-row">
                <span className="clinical-report-block-label">
                  {t("whatsappDeliveryUpper")}
                </span>
              </div>

              <h4>
                {t("sendReportWhatsAppTitle")}
              </h4>

              <p>
                {t("sendReportWhatsAppDesc")}
              </p>
            </div>
          </div>

          {/* PHONE INPUT */}
          <div className="whatsapp-form-row">
            <div className="whatsapp-input-wrapper">
              <span className="phone-prefix">
                +
              </span>

              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="919876543210"
                maxLength={15}
                aria-label={t("whatsappPhoneLabel")}
              />
            </div>
          </div>

          {/* PHONE STATUS */}
          {phoneStatus && (
            <div
              className={
                `whatsapp-number-status ${
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

          {/* SEND BUTTON */}
          <button
            type="button"
            className="whatsapp-send-button"
            onClick={
              handleSendWhatsApp
            }
            disabled={
              sendLoading ||
              !phoneStatus?.ok
            }
          >
            {sendLoading
              ? t("sendingReportBtn")
              : t("sendReportBtn")}
          </button>

          {/* SEND STATUS */}
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
              <span>
                {sendStatus.message}
              </span>
            </div>
          )}
        </div>

        {/* DISCLAIMER */}
        <div className="clinical-report-disclaimer">
          {t("clinicalReportDisclaimer")}
        </div>
      </LiquidGlass>
    </section>
  );
}

// ===========================================================
// REPORT VALUE COMPONENT
// ===========================================================
function ReportValue({
  label,
  value,
}) {
  return (
    <div className="clinical-report-value">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

// ===========================================================
// FINDING COMPONENT
// ===========================================================
function Finding({
  label,
  value,
}) {
  return (
    <div className="clinical-report-finding">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

export default ClinicalReport;