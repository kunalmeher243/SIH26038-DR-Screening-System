import { useEffect, useState } from "react";
import useAnalysisStore from "../store/useAnalysisStore";
import PipelineFlow from "../components/PipelineFlow";
import LiquidGlass from "../components/LiquidGlass";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

function Upload() {
  const [preview, setPreview] = useState("");
  const [localError, setLocalError] = useState("");

  // =========================
  // Store values
  // =========================

  const file = useAnalysisStore((state) => state.file);
  const eye = useAnalysisStore((state) => state.eye);
  const stage = useAnalysisStore((state) => state.stage);
  const error = useAnalysisStore((state) => state.error);

  // =========================
  // Store actions
  // =========================

  const setFile = useAnalysisStore((state) => state.setFile);
  const setEye = useAnalysisStore((state) => state.setEye);

  const runFullAnalysis = useAnalysisStore(
    (state) => state.runFullAnalysis
  );

  const reset = useAnalysisStore((state) => state.reset);

  // =========================
  // Create / cleanup preview
  // =========================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================
  // File selection
  // =========================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setLocalError("");

    if (!selectedFile) {
      return;
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setLocalError(
        "Please upload a JPG or PNG image."
      );
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setLocalError(
        "File size must be 10 MB or less."
      );
      return;
    }

    // Set file in Zustand
    setFile(selectedFile);

    // Create preview
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
  };

  // =========================
  // Remove image
  // =========================

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setLocalError("");

    reset();
  };

  // =========================
  // Start analysis
  // =========================

  const handleStartAnalysis = async () => {
    setLocalError("");

    if (!file) {
      setLocalError(
        "Please upload a retinal image first."
      );
      return;
    }

    if (!eye) {
      setLocalError(
        "Please select the eye."
      );
      return;
    }

    try {
      await runFullAnalysis(file);

      console.log(
        "Analysis completed successfully."
      );
    } catch (error) {
      console.error(
        "Analysis failed:",
        error
      );
    }
  };

  // =========================
  // Loading state
  // =========================

  const isAnalyzing =
    stage !== "idle" &&
    stage !== "done" &&
    stage !== "error";

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        boxSizing: "border-box",

        background:
          "linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        {/* =====================================================
            MAIN GLASS CARD
            ===================================================== */}

        <LiquidGlass className="glass-large">

          <div
            style={{
              padding: "40px",
            }}
          >

            {/* =================================================
                HEADER
                ================================================= */}

            <div
              style={{
                marginBottom: "32px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                Retinal Image Upload
              </h1>

              <p
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  color: "#475569",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                Upload a retinal fundus image to
                begin diabetic retinopathy screening.
              </p>
            </div>


            {/* =================================================
                FILE UPLOAD
                ================================================= */}

            <LiquidGlass
              className="glass-light"
            >
              <div
                style={{
                  padding: "24px",
                }}
              >

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "8px",
                    color: "#0f172a",
                    fontSize: "18px",
                  }}
                >
                  Select Retinal Image
                </h3>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: "18px",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Supported formats: JPG, JPEG and PNG
                  · Maximum size: 10 MB
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  disabled={isAnalyzing}
                  style={{
                    width: "100%",
                    padding: "12px",
                    boxSizing: "border-box",

                    borderRadius: "12px",

                    border:
                      "1px solid rgba(255,255,255,0.35)",

                    background:
                      "rgba(255,255,255,0.35)",

                    cursor: isAnalyzing
                      ? "not-allowed"
                      : "pointer",
                  }}
                />

              </div>
            </LiquidGlass>


            {/* =================================================
                ERRORS
                ================================================= */}

            {localError && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "12px 16px",
                  borderRadius: "12px",

                  background:
                    "rgba(254,226,226,0.65)",

                  border:
                    "1px solid rgba(239,68,68,0.25)",

                  color: "#b91c1c",

                  fontSize: "14px",
                }}
              >
                {localError}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "12px 16px",
                  borderRadius: "12px",

                  background:
                    "rgba(254,226,226,0.65)",

                  border:
                    "1px solid rgba(239,68,68,0.25)",

                  color: "#b91c1c",

                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}


            {/* =================================================
                FILE INFORMATION
                ================================================= */}

            {file && (
              <div
                style={{
                  marginTop: "28px",
                }}
              >

                {/* =============================================
                    IMAGE PREVIEW
                    ============================================= */}

                {preview && (
                  <LiquidGlass
                    className="glass-light"
                  >
                    <div
                      style={{
                        padding: "24px",
                      }}
                    >

                      <h3
                        style={{
                          marginTop: 0,
                          marginBottom: "18px",
                          color: "#0f172a",
                          fontSize: "18px",
                        }}
                      >
                        Image Preview
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",

                          padding: "15px",

                          borderRadius: "18px",

                          background:
                            "rgba(255,255,255,0.25)",
                        }}
                      >
                        <img
                          src={preview}
                          alt="Retinal preview"
                          style={{
                            width: "400px",
                            height: "400px",

                            maxWidth: "100%",

                            objectFit: "contain",

                            borderRadius: "14px",

                            display: "block",
                          }}
                        />
                      </div>


                      {/* File details */}

                      <div
                        style={{
                          marginTop: "20px",

                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",

                          color: "#475569",

                          fontSize: "14px",
                        }}
                      >

                        <div>
                          <strong
                            style={{
                              color: "#1e293b",
                            }}
                          >
                            File:
                          </strong>{" "}
                          {file.name}
                        </div>

                        <div>
                          <strong
                            style={{
                              color: "#1e293b",
                            }}
                          >
                            Size:
                          </strong>{" "}
                          {(
                            file.size /
                            (1024 * 1024)
                          ).toFixed(2)}{" "}
                          MB
                        </div>

                      </div>


                      {/* Remove button */}

                      <button
                        onClick={handleRemove}
                        disabled={isAnalyzing}
                        className="glass-button"
                        style={{
                          marginTop: "20px",
                        }}
                      >
                        Remove Image
                      </button>

                    </div>
                  </LiquidGlass>
                )}


                {/* =============================================
                    EYE SELECTION
                    ============================================= */}

                <LiquidGlass
                  className="glass-light"
                >
                  <div
                    style={{
                      padding: "24px",
                      marginTop: "24px",
                    }}
                  >

                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
                        color: "#0f172a",
                        fontSize: "18px",
                      }}
                    >
                      Select Eye
                    </h3>

                    <p
                      style={{
                        marginTop: 0,
                        marginBottom: "18px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      Select which eye the uploaded
                      retinal image belongs to.
                    </p>


                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        flexWrap: "wrap",
                      }}
                    >

                      {/* Right eye */}

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",

                          padding:
                            "10px 16px",

                          borderRadius: "12px",

                          background:
                            eye === "right"
                              ? "rgba(255,255,255,0.48)"
                              : "rgba(255,255,255,0.20)",

                          border:
                            eye === "right"
                              ? "1px solid rgba(255,255,255,0.45)"
                              : "1px solid rgba(255,255,255,0.20)",

                          cursor: isAnalyzing
                            ? "not-allowed"
                            : "pointer",

                          color: "#334155",

                          fontWeight:
                            eye === "right"
                              ? "600"
                              : "400",
                        }}
                      >
                        <input
                          type="radio"
                          name="eye"
                          value="right"
                          checked={
                            eye === "right"
                          }
                          onChange={(e) =>
                            setEye(
                              e.target.value
                            )
                          }
                          disabled={isAnalyzing}
                        />

                        Right Eye
                      </label>


                      {/* Left eye */}

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",

                          padding:
                            "10px 16px",

                          borderRadius: "12px",

                          background:
                            eye === "left"
                              ? "rgba(255,255,255,0.48)"
                              : "rgba(255,255,255,0.20)",

                          border:
                            eye === "left"
                              ? "1px solid rgba(255,255,255,0.45)"
                              : "1px solid rgba(255,255,255,0.20)",

                          cursor: isAnalyzing
                            ? "not-allowed"
                            : "pointer",

                          color: "#334155",

                          fontWeight:
                            eye === "left"
                              ? "600"
                              : "400",
                        }}
                      >
                        <input
                          type="radio"
                          name="eye"
                          value="left"
                          checked={
                            eye === "left"
                          }
                          onChange={(e) =>
                            setEye(
                              e.target.value
                            )
                          }
                          disabled={isAnalyzing}
                        />

                        Left Eye
                      </label>

                    </div>

                  </div>
                </LiquidGlass>


                {/* =============================================
                    START ANALYSIS
                    ============================================= */}

                <div
                  style={{
                    marginTop: "28px",
                    textAlign: "center",
                  }}
                >

                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                    className="glass-button"
                    style={{
                      minWidth: "200px",
                      padding:
                        "14px 24px",

                      fontSize: "15px",
                      fontWeight: "600",

                      color: "#0f172a",

                      opacity:
                        isAnalyzing
                          ? 0.6
                          : 1,
                    }}
                  >
                    {isAnalyzing
                      ? `Analyzing: ${stage}...`
                      : "Start Analysis"}
                  </button>

                </div>

              </div>
            )}


            {/* =================================================
                ANALYSIS PIPELINE
                ================================================= */}

            {stage !== "idle" && (
              <div
                style={{
                  marginTop: "32px",
                }}
              >
                <LiquidGlass
                  className="glass-light"
                >
                  <div
                    style={{
                      padding: "24px",
                    }}
                  >
                    <PipelineFlow />
                  </div>
                </LiquidGlass>
              </div>
            )}

          </div>

        </LiquidGlass>

      </div>
    </div>
  );
}

export default Upload;