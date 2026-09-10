import { useEffect, useState } from "react";
import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";
import LiquidGlass from "./LiquidGlass";

function GradCAMViewer() {
  const { t } = useLanguageStore();
  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const report = useAnalysisStore((state) => state.report);
  const grade = useAnalysisStore((state) => state.grade);

  const [originalImage, setOriginalImage] = useState(null);

  /* =========================================================
     CREATE IMAGE PREVIEW URL
     ========================================================= */

  useEffect(() => {
    if (!file) {
      setOriginalImage(null);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [file]);

  /* =========================================================
     EMPTY STATE
     ========================================================= */

  if (!file && !report) {
    return null;
  }

  /* =========================================================
     DATA
     ========================================================= */

  const gradcamImage =
    report?.gradcam_image || null;

  const lesionOverlayImage =
    report?.lesion_overlay_image || null;

  const drLabel =
    grade?.dr_label ||
    t("drAnalysisTitle");

  const confidence =
    grade?.confidence != null
      ? Math.round(grade.confidence * 100)
      : null;

  /* =========================================================
     RETURN
     ========================================================= */

  return (
    <section className="visual-explainability">

      {/* =====================================================
          SECTION HEADER
          ===================================================== */}
      <div className="visual-explainability-header">
        <div>
          <span className="section-kicker">
            {t("visualAiEvidence")}
          </span>

          <h2>
            {t("retinalImageAnalysisTitle")}
          </h2>

          <p>
            {t("retinalImageAnalysisDesc")}
          </p>
        </div>

        {confidence !== null && (
          <div className="visual-confidence">
            <span>
              {t("aiConfidenceUpper")}
            </span>

            <strong>
              {confidence}%
            </strong>
          </div>
        )}
      </div>

      {/* =====================================================
          IMAGE ANALYSIS GRID
          ===================================================== */}
      <div className="retinal-analysis-grid">

        {/* ===================================================
            ORIGINAL RETINAL IMAGE
            =================================================== */}
        <LiquidGlass
          variant="light"
          className="retinal-visual-card"
        >
          <div className="retinal-card-header">
            <div>
              <span className="card-kicker">
                {t("inputImageKicker")}
              </span>

              <h3>
                {t("originalRetinalImageTitle")}
              </h3>

              <p>
                {t("originalRetinalImageDesc")}
              </p>
            </div>

            <span className="image-status-badge">
              {t("originalBadge")}
            </span>
          </div>

          <div className="retinal-image-frame">
            {originalImage ? (
              <img
                src={originalImage}
                alt="Uploaded retinal fundus image"
                className="retinal-image"
              />
            ) : (
              <ImagePlaceholder
                title={t("retinalImageUnavailable")}
                description={t("retinalImageUnavailableDesc")}
              />
            )}
          </div>

          <div className="retinal-card-footer">
            <div>
              <span>
                {t("fileLabel")}
              </span>

              <strong title={file?.name || "N/A"}>
                {file?.name || "N/A"}
              </strong>
            </div>

            <div>
              <span>
                {t("eyeLabel")}
              </span>

              <strong>
                {eye === "right"
                  ? t("rightEye")
                  : t("leftEye")}
              </strong>
            </div>
          </div>
        </LiquidGlass>

        {/* ===================================================
            GRAD-CAM / AI ATTENTION
            =================================================== */}
        <LiquidGlass
          variant="light"
          className="retinal-visual-card"
        >
          <div className="retinal-card-header">
            <div>
              <span className="card-kicker">
                {t("aiExplanationKicker")}
              </span>

              <h3>
                {t("gradcamAttentionMapTitle")}
              </h3>

              <p>
                {t("gradcamAttentionMapDesc")}
              </p>
            </div>

            <span className="image-status-badge ai">
              AI
            </span>
          </div>

          <div className="retinal-image-frame gradcam-frame">
            {gradcamImage ? (
              <div className="real-gradcam-container">
                <img
                  src={gradcamImage}
                  alt="Grad-CAM attention heatmap"
                  className="retinal-image"
                />

                <div className="gradcam-real-label">
                  <span className="demo-dot" />
                  GRAD-CAM
                </div>
              </div>
            ) : originalImage ? (
              <div className="gradcam-placeholder">
                <img
                  src={originalImage}
                  alt="Retinal image used for AI analysis"
                  className="retinal-image gradcam-base-image"
                />

                <div
                  className="gradcam-overlay-placeholder"
                  aria-hidden="true"
                >
                  <div className="attention-orb orb-one" />
                  <div className="attention-orb orb-two" />
                  <div className="attention-orb orb-three" />
                </div>

                <div className="gradcam-demo-label">
                  <span className="demo-dot" />
                  {t("aiAttentionPreview")}
                </div>
              </div>
            ) : (
              <ImagePlaceholder
                title={t("gradcamUnavailable")}
                description={t("gradcamUnavailableDesc")}
              />
            )}
          </div>

          {/* HEATMAP LEGEND */}
          <div className="attention-legend">
            <span className="attention-legend-title">
              {t("attentionIntensity")}
            </span>

            <div className="attention-gradient">
              <span>{t("lowerIntensity")}</span>
              <div className="attention-gradient-bar" />
              <span>{t("higherIntensity")}</span>
            </div>
          </div>

          {/* EXPLANATION */}
          <div className="gradcam-explanation">
            <div className="explanation-icon">
              ✦
            </div>

            <div>
              <strong>
                {t("whatAiFocusing")}
              </strong>

              <p>
                {t("whatAiFocusingDesc")}
              </p>
            </div>
          </div>
        </LiquidGlass>

      </div>

      {/* =====================================================
          MODEL INTERPRETATION
          ===================================================== */}
      <LiquidGlass
        variant="light"
        className="visual-interpretation-card"
      >
        <div className="interpretation-icon">
          AI
        </div>

        <div className="interpretation-content">
          <span className="card-kicker">
            {t("modelInterpretationKicker")}
          </span>

          <h3>
            {drLabel}
          </h3>

          <p>
            {t("modelInterpretationDesc")}
          </p>
        </div>

        <div className="interpretation-status">
          <span className="status-dot" />
          {t("explainableAi")}
        </div>
      </LiquidGlass>

      {/* =====================================================
          REAL LESION OVERLAY
          ===================================================== */}
      {lesionOverlayImage && (
        <LiquidGlass
          variant="light"
          className="lesion-overlay-card"
        >
          <div className="retinal-card-header">
            <div>
              <span className="card-kicker">
                {t("retinalFindingsKicker")}
              </span>

              <h3>
                {t("lesionOverlayTitle")}
              </h3>

              <p>
                {t("lesionOverlayDesc")}
              </p>
            </div>

            <span className="image-status-badge">
              {t("detectedUpper")}
            </span>
          </div>

          <div className="lesion-overlay-frame">
            <img
              src={lesionOverlayImage}
              alt="Detected retinal lesion overlay"
              className="retinal-image"
            />
          </div>
        </LiquidGlass>
      )}

    </section>
  );
}

/* =========================================================
   IMAGE PLACEHOLDER
   ========================================================= */

function ImagePlaceholder({
  title,
  description,
}) {
  return (
    <div className="retinal-placeholder">
      <div className="retinal-placeholder-icon">
        ◎
      </div>

      <strong>
        {title}
      </strong>

      <p>
        {description}
      </p>
    </div>
  );
}

export default GradCAMViewer;