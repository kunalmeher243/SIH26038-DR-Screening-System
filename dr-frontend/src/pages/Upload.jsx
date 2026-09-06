import { useEffect, useRef, useState } from "react";

import useAnalysisStore from "../store/useAnalysisStore";

import LiquidGlass from "../components/LiquidGlass";
import PipelineFlow from "../components/PipelineFlow";

function Upload() {
  const inputRef = useRef(null);

  // NEW:
  // Reference to the pipeline section so we can automatically
  // scroll to it when analysis starts.
  const pipelineRef = useRef(null);

  // NEW:
  // Prevent scrolling repeatedly for every pipeline stage.
  const hasScrolledToPipeline = useRef(false);

  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const stage = useAnalysisStore((state) => state.stage);

  const setFile = useAnalysisStore((state) => state.setFile);
  const setEye = useAnalysisStore((state) => state.setEye);

  const runFullAnalysis = useAnalysisStore(
    (state) => state.runFullAnalysis
  );

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  /* =========================================================
     AUTO SCROLL TO ANALYSIS PIPELINE
     ========================================================= */

  useEffect(() => {
    // When a new file is selected and stage returns to idle,
    // allow scrolling again for the next analysis.
    if (stage === "idle") {
      hasScrolledToPipeline.current = false;
      return;
    }

    // Do nothing if there is no file.
    if (!file) {
      return;
    }

    // Only scroll once when analysis starts.
    if (hasScrolledToPipeline.current) {
      return;
    }

    hasScrolledToPipeline.current = true;

    // Wait for the PipelineFlow component to be rendered
    // before trying to scroll to it.
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

    // JPG / PNG only
    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }

    // Maximum 10 MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);

    // Revoke previous preview if one exists
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

  /* =========================================================
     DRAG & DROP
     ========================================================= */

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

  /* =========================================================
     REMOVE IMAGE
     ========================================================= */

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setError("");

    // Allow auto-scroll again for the next upload.
    hasScrolledToPipeline.current = false;

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setFile(null);
  };

  /* =========================================================
     START ANALYSIS
     ========================================================= */

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

  /* =========================================================
     ANALYSIS STATE
     ========================================================= */

  const analysisRunning =
    stage === "quality" ||
    stage === "enhance" ||
    stage === "grade" ||
    stage === "report";

  return (
    <div className="upload-page">
      <div className="upload-container">

        <LiquidGlass
          className="upload-card"
          variant="strong"
        >

          {/* =====================================================
              HEADER
              ===================================================== */}

          <div className="upload-header">

            <span className="brand-kicker">
              RETINA AI · DIABETIC RETINOPATHY SCREENING
            </span>

            <h1>
              Upload Retinal Image
            </h1>

            <p>
              Upload a retinal fundus image for automated
              diabetic retinopathy screening and assessment.
            </p>

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
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    inputRef.current?.click();
                  }
                }}
              >

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Upload retinal image
                </h3>

                <p>
                  Drag & drop your image here or
                  click to browse
                </p>

                <span className="upload-format">
                  JPG or PNG · Maximum 10 MB
                </span>

                <button
                  type="button"
                  className="glass-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Choose Image
                </button>

              </div>

            ) : (

              <div className="uploaded-image-wrapper">

                {/* =================================================
                    IMAGE PREVIEW
                    ================================================= */}

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


                {/* =================================================
                    FILE INFORMATION
                    ================================================= */}

                <div className="file-info">

                  <div className="file-info-item">

                    <span className="file-info-label">
                      FILE
                    </span>

                    <strong title={file.name}>
                      {file.name}
                    </strong>

                  </div>


                  <div className="file-info-item">

                    <span className="file-info-label">
                      SIZE
                    </span>

                    <strong>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    REMOVE IMAGE
                    ================================================= */}

                <button
                  type="button"
                  className="glass-button remove-image-button"
                  onClick={removeImage}
                  disabled={analysisRunning}
                >
                  Remove Image
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

              <strong>
                Upload Error
              </strong>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* =====================================================
              EYE SELECTION
              ===================================================== */}

          {file && (

            <div className="upload-section eye-selector">

              <div className="eye-selector-header">

                <h3>
                  Select Eye
                </h3>

                <p>
                  Select which eye the uploaded retinal
                  image belongs to.
                </p>

              </div>


              <div className="eye-options">

                {/* RIGHT EYE */}

                <label
                  className={`eye-option ${
                    eye === "right"
                      ? "eye-option-active"
                      : ""
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

                  <span>
                    Right Eye
                  </span>

                </label>


                {/* LEFT EYE */}

                <label
                  className={`eye-option ${
                    eye === "left"
                      ? "eye-option-active"
                      : ""
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

                  <span>
                    Left Eye
                  </span>

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

                {analysisRunning
                  ? "Analyzing..."
                  : "Start Analysis"}

              </button>

            </div>

          )}


          {/* =====================================================
              ANALYSIS PIPELINE
              ===================================================== */}

          {file && stage !== "idle" && (

            <div
              ref={pipelineRef}
              className="upload-pipeline"
            >

              <PipelineFlow />

            </div>

          )}

        </LiquidGlass>

      </div>
    </div>
  );
}

export default Upload;