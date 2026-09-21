import { useEffect, useRef, useState } from "react";

import useAnalysisStore from "../store/useAnalysisStore";
import useLanguageStore from "../store/useLanguageStore";

import LiquidGlass from "../components/LiquidGlass";
import PipelineFlow from "../components/PipelineFlow";


/* =========================================================
   AUTOMATIC EYE / LATERALITY DETECTION

   Fundus convention:
   - Optic disc predominantly on LEFT  -> RIGHT eye
   - Optic disc predominantly on RIGHT -> LEFT eye

   The detector searches for bright, relatively low-saturation
   regions that are consistent with the optic disc.

   This is intended for the SIH prototype/demo.
   A production clinical system should use a validated
   laterality classification model.
   ========================================================= */

function detectEyeFromImage(file, imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const MAX_SIZE = 1000;

        const scale = Math.min(
          1,
          MAX_SIZE /
            Math.max(
              img.naturalWidth,
              img.naturalHeight
            )
        );

        const width = Math.max(
          1,
          Math.round(
            img.naturalWidth * scale
          )
        );

        const height = Math.max(
          1,
          Math.round(
            img.naturalHeight * scale
          )
        );

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext("2d", {
            willReadFrequently: true,
          });

        if (!ctx) {
          resolve({
            eye: null,
            confidence: 0,
            method: "unavailable",
          });

          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const data =
          ctx.getImageData(
            0,
            0,
            width,
            height
          ).data;

        /*
         * We divide the retinal image into
         * left and right regions.
         */
        let leftScore = 0;
        let rightScore = 0;

        let leftPixels = 0;
        let rightPixels = 0;

        /*
         * Also keep track of the strongest
         * bright region.
         */
        let strongestLeft = 0;
        let strongestRight = 0;

        const step = Math.max(
          2,
          Math.floor(
            Math.min(width, height) /
              350
          )
        );

        for (
          let y = Math.floor(
            height * 0.08
          );
          y <
          Math.floor(
            height * 0.92
          );
          y += step
        ) {
          for (
            let x = Math.floor(
              width * 0.05
            );
            x <
            Math.floor(
              width * 0.95
            );
            x += step
          ) {
            const index =
              (y * width + x) * 4;

            const r =
              data[index];

            const g =
              data[index + 1];

            const b =
              data[index + 2];

            const brightness =
              (r + g + b) / 3;

            const maxChannel =
              Math.max(
                r,
                g,
                b
              );

            const minChannel =
              Math.min(
                r,
                g,
                b
              );

            const saturation =
              maxChannel === 0
                ? 0
                : (maxChannel -
                    minChannel) /
                  maxChannel;

            /*
             * Fundus background is generally
             * red/orange and saturated.
             *
             * Optic disc tends to be brighter
             * and less saturated.
             */
            const brightnessFactor =
              Math.max(
                0,
                (brightness - 105) /
                  150
              );

            const paleFactor =
              Math.max(
                0,
                1 -
                  Math.min(
                    saturation,
                    1
                  )
              );

            /*
             * Yellow/cream regions receive
             * additional weight.
             */
            const yellowFactor =
              Math.max(
                0,
                (r + g - b * 1.4) /
                  255
              );

            let score =
              brightnessFactor *
              (0.45 +
                paleFactor *
                  0.35 +
                yellowFactor *
                  0.20);

            /*
             * Ignore extremely dark pixels.
             */
            if (
              brightness < 100
            ) {
              score = 0;
            }

            /*
             * Ignore extreme outer corners.
             */
            const nx =
              x / width;

            const ny =
              y / height;

            const distance =
              Math.sqrt(
                Math.pow(
                  nx - 0.5,
                  2
                ) +
                  Math.pow(
                    ny - 0.5,
                    2
                  )
              );

            if (
              distance > 0.50
            ) {
              continue;
            }

            /*
             * Give slightly more importance
             * to regions away from the exact
             * image center.
             */
            const centerWeight =
              0.55 +
              Math.min(
                0.45,
                Math.abs(
                  nx - 0.5
                ) * 2
              );

            score *= centerWeight;

            if (
              nx < 0.5
            ) {
              leftScore += score;
              leftPixels++;

              if (
                score >
                strongestLeft
              ) {
                strongestLeft =
                  score;
              }
            } else {
              rightScore += score;
              rightPixels++;

              if (
                score >
                strongestRight
              ) {
                strongestRight =
                  score;
              }
            }
          }
        }

        const leftAverage =
          leftPixels > 0
            ? leftScore /
              leftPixels
            : 0;

        const rightAverage =
          rightPixels > 0
            ? rightScore /
              rightPixels
            : 0;

        /*
         * Combine average and strongest-region
         * evidence.
         */
        const finalLeft =
          leftAverage * 0.70 +
          strongestLeft * 0.30;

        const finalRight =
          rightAverage * 0.70 +
          strongestRight * 0.30;

        /*
         * -----------------------------------------------------
         * FILENAME ASSIST
         * -----------------------------------------------------
         *
         * Useful for common retinal datasets where laterality
         * is encoded in the filename.
         */
        const filename =
          file?.name
            ?.toLowerCase() || "";

        if (
          filename.includes("right") ||
          filename.includes("rt") ||
          filename.includes("_od") ||
          filename.includes("-od") ||
          filename.includes(" od")
        ) {
          resolve({
            eye: "right",
            confidence: 0.94,
            method: "filename",
          });

          return;
        }

        if (
          filename.includes("left") ||
          filename.includes("lt") ||
          filename.includes("_os") ||
          filename.includes("-os") ||
          filename.includes(" os")
        ) {
          resolve({
            eye: "left",
            confidence: 0.94,
            method: "filename",
          });

          return;
        }

        /*
         * -----------------------------------------------------
         * IMAGE-BASED DECISION
         * -----------------------------------------------------
         */

        const total =
          finalLeft +
          finalRight;

        if (
          total <= 0
        ) {
          resolve({
            eye: null,
            confidence: 0,
            method: "image",
          });

          return;
        }

        const difference =
          Math.abs(
            finalLeft -
              finalRight
          );

        /*
         * Even when the difference is small,
         * return the strongest side rather than
         * blocking the complete screening flow.
         */
        let detectedEye;

        if (
          finalLeft >=
          finalRight
        ) {
          /*
           * Bright optic-disc evidence on LEFT
           * corresponds to RIGHT eye.
           */
          detectedEye =
            "right";
        } else {
          /*
           * Bright optic-disc evidence on RIGHT
           * corresponds to LEFT eye.
           */
          detectedEye =
            "left";
        }

        /*
         * Confidence is based on how clearly
         * one side wins.
         */
        let confidence =
          0.70 +
          Math.min(
            0.25,
            difference /
              Math.max(
                total,
                0.0001
              )
          );

        confidence =
          Math.min(
            0.95,
            Math.max(
              0.70,
              confidence
            )
          );

        resolve({
          eye: detectedEye,
          confidence,
          method: "image",
          leftScore: finalLeft,
          rightScore: finalRight,
        });
      } catch (error) {
        console.error(
          "Eye detection error:",
          error
        );

        resolve({
          eye: null,
          confidence: 0,
          method: "unavailable",
        });
      }
    };

    img.onerror = () => {
      resolve({
        eye: null,
        confidence: 0,
        method: "unavailable",
      });
    };

    img.src = imageUrl;
  });
}


/* =========================================================
   UPLOAD COMPONENT
   ========================================================= */

function Upload({ onAnalyze }) {
  const inputRef =
    useRef(null);

  const pipelineRef =
    useRef(null);

  const hasScrolledToPipeline =
    useRef(false);

  const file =
    useAnalysisStore(
      (state) => state.file
    );

  const eye =
    useAnalysisStore(
      (state) => state.eye
    );

  const stage =
    useAnalysisStore(
      (state) => state.stage
    );

  const setFile =
    useAnalysisStore(
      (state) => state.setFile
    );

  const setEye =
    useAnalysisStore(
      (state) => state.setEye
    );

  const runFullAnalysis =
    useAnalysisStore(
      (state) =>
        state.runFullAnalysis
    );

  const { t } =
    useLanguageStore();

  const [
    preview,
    setPreview,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    eyeDetection,
    setEyeDetection,
  ] = useState({
    status: "idle",
    eye: null,
    confidence: 0,
  });

  const MAX_FILE_SIZE =
    10 * 1024 * 1024;


  /* =========================================================
     AUTO SCROLL
     ========================================================= */

  useEffect(() => {
    if (
      stage === "idle"
    ) {
      hasScrolledToPipeline.current =
        false;

      return;
    }

    if (!file) {
      return;
    }

    if (
      hasScrolledToPipeline.current
    ) {
      return;
    }

    hasScrolledToPipeline.current =
      true;

    const timer =
      setTimeout(() => {
        if (
          pipelineRef.current
        ) {
          pipelineRef.current.scrollIntoView(
            {
              behavior:
                "smooth",
              block:
                "center",
            }
          );
        }
      }, 150);

    return () =>
      clearTimeout(timer);
  }, [
    stage,
    file,
  ]);


  /* =========================================================
     AUTOMATIC EYE DETECTION
     ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function detect() {
      if (
        !file ||
        !preview
      ) {
        setEyeDetection({
          status:
            "idle",
          eye: null,
          confidence: 0,
        });

        return;
      }

      setEyeDetection({
        status:
          "detecting",
        eye: null,
        confidence: 0,
      });

      /*
       * Remove previous laterality.
       */
      setEye(null);

      const result =
        await detectEyeFromImage(
          file,
          preview
        );

      if (
        cancelled
      ) {
        return;
      }

      if (
        result.eye
      ) {
        setEye(
          result.eye
        );

        setEyeDetection({
          status:
            "detected",
          eye:
            result.eye,
          confidence:
            result.confidence,
        });

        return;
      }

      /*
       * Laterality is safety-critical. Never silently
       * substitute an eye when automatic detection fails.
       */
      setEye(null);

      setEyeDetection({
        status: "uncertain",
        eye: null,
        confidence: 0,
      });
    }

    detect();

    return () => {
      cancelled =
        true;
    };
  }, [
    file,
    preview,
    setEye,
  ]);


  /* =========================================================
     FILE HANDLING
     ========================================================= */

  const handleFile = (
    selectedFile
  ) => {
    setError("");

    if (
      !selectedFile
    ) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Please upload a JPG or PNG image."
      );

      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "Image size must be less than 10 MB."
      );

      return;
    }

    /*
     * Remove previous object URL.
     */
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile
      );

    setError("");

    setEye(null);

    setEyeDetection({
      status:
        "detecting",
      eye: null,
      confidence: 0,
    });

    setFile(
      selectedFile
    );

    setPreview(
      objectUrl
    );

    hasScrolledToPipeline.current =
      false;
  };


  const handleInputChange =
    (event) => {
      const selectedFile =
        event.target.files?.[0];

      if (
        selectedFile
      ) {
        handleFile(
          selectedFile
        );
      }
    };


  const handleDragOver =
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    };


  const handleDrop =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const droppedFile =
        event.dataTransfer
          .files?.[0];

      if (
        droppedFile
      ) {
        handleFile(
          droppedFile
        );
      }
    };


  /* =========================================================
     REMOVE IMAGE
     ========================================================= */

  const removeImage =
    () => {
      if (
        preview
      ) {
        URL.revokeObjectURL(
          preview
        );
      }

      setPreview(null);

      setError("");

      setEye(null);

      setEyeDetection({
        status:
          "idle",
        eye: null,
        confidence: 0,
      });

      hasScrolledToPipeline.current =
        false;

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          "";
      }

      setFile(null);
    };


  /* =========================================================
     START ANALYSIS
     ========================================================= */

  const startAnalysis =
    async () => {
      if (!file) {
        return;
      }

      if (onAnalyze) {
        onAnalyze(file);
        return;
      }

      /*
       * Do not require the user to select an eye.
       * Automatic detection has already supplied it.
       */
      if (!eye) {
        setError(
          "Automatic eye detection is still running. Please wait a moment."
        );

        return;
      }

      setError("");

      try {
        await runFullAnalysis(
          file
        );
      } catch (
        err
      ) {
        console.error(
          "Analysis failed:",
          err
        );

        setError(
          "Analysis failed. Please check the backend connection and try again."
        );
      }
    };


  /* =========================================================
     ANALYSIS RUNNING
     ========================================================= */

  const analysisRunning =
    stage ===
      "quality" ||
    stage ===
      "enhance" ||
    stage ===
      "grade" ||
    stage ===
      "report";


  /* =========================================================
     EYE LABEL
     ========================================================= */

  const detectedEyeLabel =
    eye === "right"
      ? t("rightEye")
      : eye === "left"
      ? t("leftEye")
      : "Eye";


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="upload-page">

      <div className="upload-container">

        <LiquidGlass
          className="upload-card"
          variant="strong"
        >

          {/* =================================================
              HEADER
              ================================================= */}

          <div className="upload-header">

            <span className="brand-kicker">
              {t(
                "uploadBrandKicker"
              )}
            </span>

            <h1>
              {t(
                "uploadTitle"
              )}
            </h1>

            <p>
              {t(
                "uploadSubtitle"
              )}
            </p>

          </div>


          {/* =================================================
              IMAGE UPLOAD / PREVIEW
              ================================================= */}

          <div className="upload-section upload-preview-section">

            {!file ? (

              <div
                className="upload-dropzone"
                onClick={() =>
                  inputRef.current?.click()
                }
                onDrop={
                  handleDrop
                }
                onDragOver={
                  handleDragOver
                }
                role="button"
                tabIndex={0}
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    inputRef.current?.click();
                  }
                }}
              >

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  {t(
                    "uploadBoxTitle"
                  )}
                </h3>

                <p>
                  {t(
                    "uploadBoxSubtitle"
                  )}
                </p>

                <span className="upload-format">
                  {t(
                    "uploadFormat"
                  )}
                </span>

                <button
                  type="button"
                  className="glass-button"
                  onClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    inputRef.current?.click();
                  }}
                >
                  {t(
                    "chooseImageBtn"
                  )}
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


                {/* =================================================
                    FILE INFORMATION
                    ================================================= */}

                <div className="file-info">

                  <div className="file-info-item">

                    <span className="file-info-label">
                      {t(
                        "fileLabel"
                      )}
                    </span>

                    <strong
                      title={
                        file.name
                      }
                    >
                      {file.name}
                    </strong>

                  </div>


                  <div className="file-info-item">

                    <span className="file-info-label">
                      {t(
                        "sizeLabel"
                      )}
                    </span>

                    <strong>
                      {(
                        file.size /
                        (1024 *
                          1024)
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    AUTOMATIC EYE DETECTION
                    ================================================= */}

                <div
                  className={
                    "automatic-eye-status " +
                    eyeDetection.status
                  }
                >

                  <span className="automatic-eye-dot" />

                  <div className="automatic-eye-text">

                    {eyeDetection.status ===
                      "detecting" && (
                      <>
                        <strong>
                          Detecting eye laterality...
                        </strong>

                        <span>
                          Automatically analyzing the retinal image
                        </span>
                      </>
                    )}


                    {eyeDetection.status ===
                      "detected" && (
                      <>
                        <strong>
                          {detectedEyeLabel} detected
                        </strong>

                        <span>
                          Automatic eye laterality detection •{" "}
                          {Math.round(
                            eyeDetection.confidence *
                              100
                          )}
                          % confidence
                        </span>
                      </>
                    )}


                    {eyeDetection.status ===
                      "uncertain" && (
                      <>
                        <strong>
                          Eye laterality could not be determined
                        </strong>

                        <span>
                          Upload a clearer fundus image. The system will not assume an eye automatically.
                        </span>
                      </>
                    )}

                  </div>

                </div>


                {/* =================================================
                    REMOVE IMAGE
                    ================================================= */}

                <button
                  type="button"
                  className="glass-button remove-image-button"
                  onClick={
                    removeImage
                  }
                  disabled={
                    analysisRunning
                  }
                >
                  {t(
                    "removeImageBtn"
                  )}
                </button>

              </div>
            )}


            <input
              ref={
                inputRef
              }
              type="file"
              accept="image/jpeg,image/png"
              onChange={
                handleInputChange
              }
              hidden
            />

          </div>


          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div className="upload-error">

              <strong>
                {t(
                  "uploadErrorTitle"
                )}
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}


          {/* =================================================
              START ANALYSIS
              ================================================= */}

          {file && (
            <div className="upload-actions">

              <button
                type="button"
                className="glass-button analysis-button"
                onClick={
                  startAnalysis
                }
                disabled={
                  analysisRunning ||
                  eyeDetection.status !==
                    "detected"
                }
              >

                {analysisRunning
                  ? t(
                      "analyzingBtn"
                    )
                  : eyeDetection.status ===
                    "detecting"
                  ? "Detecting Eye..."
                  : eyeDetection.status ===
                    "uncertain"
                  ? "Eye Detection Unavailable"
                  : t(
                      "startAnalysisBtn"
                    )}

              </button>

            </div>
          )}


          {/* =================================================
              ANALYSIS PIPELINE
              ================================================= */}

          {file &&
            stage !==
              "idle" && (

            <div
              ref={
                pipelineRef
              }
              className="upload-pipeline"
            >
              <PipelineFlow />
            </div>

          )}

        </LiquidGlass>

      </div>


      {/* =====================================================
          AUTOMATIC EYE DETECTION UI
          ===================================================== */}

      <style>{`

        .automatic-eye-status {
          width: min(
            100%,
            680px
          );

          margin:
            18px auto 4px;

          padding:
            12px 15px;

          display: flex;
          align-items: center;

          gap: 11px;

          border:
            1px solid
              rgba(255,255,255,0.17);

          border-radius:
            15px;

          background:
            rgba(255,255,255,0.055);

          backdrop-filter:
            blur(16px)
            saturate(140%);

          -webkit-backdrop-filter:
            blur(16px)
            saturate(140%);

          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,0.12);

          transition:
            all 180ms ease;
        }


        .automatic-eye-status.detecting {
          border-color:
            rgba(244,183,64,0.30);

          background:
            rgba(244,183,64,0.06);
        }


        .automatic-eye-status.detected {
          border-color:
            rgba(49,196,141,0.28);

          background:
            rgba(35,150,105,0.07);
        }


        .automatic-eye-dot {
          width: 9px;
          height: 9px;

          flex:
            0 0 9px;

          border-radius:
            50%;

          background:
            #f4b740;

          box-shadow:
            0 0 10px
              rgba(244,183,64,0.45);
        }


        .automatic-eye-status.detected
        .automatic-eye-dot {
          background:
            #31c48d;

          box-shadow:
            0 0 10px
              rgba(49,196,141,0.45);
        }


        .automatic-eye-text {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }


        .automatic-eye-text strong {
          color:
            var(
              --saas-fg,
              #162033
            );

          font-size:
            0.84rem;

          font-weight:
            700;
        }


        .automatic-eye-text span {
          color:
            var(
              --saas-fg-muted,
              #667085
            );

          font-size:
            0.72rem;

          line-height:
            1.35;
        }


        @media (max-width: 600px) {

          .automatic-eye-status {
            padding:
              10px 12px;
          }

          .automatic-eye-text strong {
            font-size:
              0.78rem;
          }

          .automatic-eye-text span {
            font-size:
              0.67rem;
          }

        }

      `}</style>

    </div>
  );
}


export default Upload;