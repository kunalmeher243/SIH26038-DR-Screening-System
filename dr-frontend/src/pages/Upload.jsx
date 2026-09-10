import { useEffect, useRef, useState } from "react";

import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";

import LiquidGlass from "../components/LiquidGlass";
import PipelineFlow from "../components/PipelineFlow";

function Upload() {
  const inputRef = useRef(null);
  const pipelineRef = useRef(null);
  const hasScrolledToPipeline = useRef(false);

  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const stage = useAnalysisStore((state) => state.stage);

  const setFile = useAnalysisStore((state) => state.setFile);
  const setEye = useAnalysisStore((state) => state.setEye);
  const runFullAnalysis = useAnalysisStore((state) => state.runFullAnalysis);

  const { t } = useLanguageStore();

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  /* =========================================================
     AUTO SCROLL TO ANALYSIS PIPELINE
     ========================================================= */

  useEffect(() => {
    if (stage === "idle") {
      hasScrolledToPipeline.current = false;
      return;
    }

    if (!file) {
      return;
    }

    if (hasScrolledToPipeline.current) {
      return;
    }

    hasScrolledToPipeline.current = true;

    const timer = setTimeout(() => {
      if (pipelineRef.current) {
        pipelineRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [stage, file]);

  /* =========================================================
     FILE HANDLING
     ========================================================= */

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(objectUrl);
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setError("");
    hasScrolledToPipeline.current = false;

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setFile(null);
  };

  const startAnalysis = async () => {
    if (!file) {
      return;
    }

    setError("");

    try {
      await runFullAnalysis(file);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(
        "Analysis failed. Please check the backend connection and try again."
      );
    }
  };

  const analysisRunning =
    stage === "quality" ||
    stage === "enhance" ||
    stage === "grade" ||
    stage === "report";

  return (
    <div className="upload-page">
      <div className="upload-container">
        <LiquidGlass className="upload-card" variant="strong">
          {/* =====================================================
              HEADER
              ===================================================== */}
          <div className="upload-header">
            <span className="brand-kicker">
              {t("uploadBrandKicker")}
            </span>

            <h1>{t("uploadTitle")}</h1>

            <p>{t("uploadSubtitle")}</p>
          </div>

          {/* =====================================================
              IMAGE UPLOAD / PREVIEW
              ===================================================== */}
          <div className="upload-section upload-preview-section">
            {!file ? (
              <div
                className="upload-dropzone"
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    inputRef.current?.click();
                  }
                }}
              >
                <div className="upload-icon">↑</div>

                <h3>{t("uploadBoxTitle")}</h3>

                <p>{t("uploadBoxSubtitle")}</p>

                <span className="upload-format">
                  {t("uploadFormat")}
                </span>

                <button
                  type="button"
                  className="glass-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  {t("chooseImageBtn")}
                </button>
              </div>
            ) : (
              <div className="uploaded-image-wrapper">
                <div className="upload-preview">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Uploaded retinal fundus"
                      className="retinal-upload-image"
                    />
                  ) : (
                    <div className="upload-image-placeholder">
                      Image preview unavailable
                    </div>
                  )}
                </div>

                <div className="file-info">
                  <div className="file-info-item">
                    <span className="file-info-label">{t("fileLabel")}</span>
                    <strong title={file.name}>{file.name}</strong>
                  </div>

                  <div className="file-info-item">
                    <span className="file-info-label">{t("sizeLabel")}</span>
                    <strong>{(file.size / (1024 * 1024)).toFixed(2)} MB</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="glass-button remove-image-button"
                  onClick={removeImage}
                  disabled={analysisRunning}
                >
                  {t("removeImageBtn")}
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleInputChange}
              hidden
            />
          </div>

          {/* =====================================================
              ERROR
              ===================================================== */}
          {error && (
            <div className="upload-error">
              <strong>{t("uploadErrorTitle")}</strong>
              <p>{error}</p>
            </div>
          )}

          {/* =====================================================
              EYE SELECTION
              ===================================================== */}
          {file && (
            <div className="upload-section eye-selector">
              <div className="eye-selector-header">
                <h3>{t("selectEyeTitle")}</h3>
                <p>{t("selectEyeSubtitle")}</p>
              </div>

              <div className="eye-options">
                <label
                  className={`eye-option ${
                    eye === "right" ? "eye-option-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="eye"
                    value="right"
                    checked={eye === "right"}
                    onChange={() => setEye("right")}
                    disabled={analysisRunning}
                  />
                  <span>{t("rightEye")}</span>
                </label>

                <label
                  className={`eye-option ${
                    eye === "left" ? "eye-option-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="eye"
                    value="left"
                    checked={eye === "left"}
                    onChange={() => setEye("left")}
                    disabled={analysisRunning}
                  />
                  <span>{t("leftEye")}</span>
                </label>
              </div>
            </div>
          )}

          {/* =====================================================
              START ANALYSIS
              ===================================================== */}
          {file && (
            <div className="upload-actions">
              <button
                type="button"
                className="glass-button analysis-button"
                onClick={startAnalysis}
                disabled={analysisRunning}
              >
                {analysisRunning ? t("analyzingBtn") : t("startAnalysisBtn")}
              </button>
            </div>
          )}

          {/* =====================================================
              ANALYSIS PIPELINE
              ===================================================== */}
          {file && stage !== "idle" && (
            <div ref={pipelineRef} className="upload-pipeline">
              <PipelineFlow />
            </div>
          )}
        </LiquidGlass>
      </div>
    </div>
  );
}

export default Upload;