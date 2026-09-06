import { useEffect, useState } from "react";

import useAnalysisStore from "../store/useAnalysisStore";
import LiquidGlass from "./LiquidGlass";

function GradCAMViewer() {
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
    "Diabetic Retinopathy Assessment";

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
            VISUAL AI EVIDENCE
          </span>

          <h2>
            Retinal Image Analysis
          </h2>

          <p>
            Original retinal image and AI-generated visual
            evidence supporting the screening result.
          </p>
        </div>

        {confidence !== null && (
          <div className="visual-confidence">
            <span>
              AI CONFIDENCE
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
                INPUT IMAGE
              </span>

              <h3>
                Original Retinal Image
              </h3>

              <p>
                Fundus image provided for AI screening
              </p>
            </div>

            <span className="image-status-badge">
              ORIGINAL
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
                title="Retinal image unavailable"
                description="The uploaded retinal image could not be displayed."
              />
            )}

          </div>

          <div className="retinal-card-footer">

            <div>
              <span>
                FILE
              </span>

              <strong title={file?.name || "N/A"}>
                {file?.name || "N/A"}
              </strong>
            </div>

            <div>
              <span>
                EYE
              </span>

              <strong>
                {eye === "right"
                  ? "Right Eye"
                  : "Left Eye"}
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
                AI EXPLANATION
              </span>

              <h3>
                Grad-CAM Attention Map
              </h3>

              <p>
                Regions contributing to the AI classification
              </p>
            </div>

            <span className="image-status-badge ai">
              AI
            </span>

          </div>

          <div className="retinal-image-frame gradcam-frame">

            {/* ===============================================
                REAL GRAD-CAM
                =============================================== */}

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

              /* =============================================
                 DEMO AI ATTENTION PREVIEW
                 ============================================= */

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

                  AI ATTENTION PREVIEW

                </div>

              </div>

            ) : (

              <ImagePlaceholder
                title="Grad-CAM unavailable"
                description="The AI attention map will appear when model visualization is generated."
              />

            )}

          </div>

          {/* =================================================
              HEATMAP LEGEND
              ================================================= */}

          <div className="attention-legend">

            <span className="attention-legend-title">
              ATTENTION INTENSITY
            </span>

            <div className="attention-gradient">
              <span>Lower</span>

              <div className="attention-gradient-bar" />

              <span>Higher</span>
            </div>

          </div>

          {/* =================================================
              EXPLANATION
              ================================================= */}

          <div className="gradcam-explanation">

            <div className="explanation-icon">
              ✦
            </div>

            <div>

              <strong>
                What is the AI focusing on?
              </strong>

              <p>
                Grad-CAM highlights retinal regions that
                contribute most strongly to the predicted
                diabetic retinopathy classification.
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
            MODEL INTERPRETATION
          </span>

          <h3>
            {drLabel}
          </h3>

          <p>
            The visual explanation shows retinal regions
            contributing to the automated screening
            assessment. It supports clinical review and
            does not replace professional diagnosis.
          </p>

        </div>

        <div className="interpretation-status">

          <span className="status-dot" />

          Explainable AI

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
                RETINAL FINDINGS
              </span>

              <h3>
                Lesion Detection Overlay
              </h3>

              <p>
                Visual representation of detected retinal lesions
              </p>

            </div>

            <span className="image-status-badge">
              DETECTED
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