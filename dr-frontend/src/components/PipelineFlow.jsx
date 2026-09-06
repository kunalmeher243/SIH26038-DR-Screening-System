import useAnalysisStore from "../store/useAnalysisStore";
import LiquidGlass from "./LiquidGlass";


const stages = [
  {
    key: "quality",
    title: "Image Quality",
    description: "Waiting for quality check",
    activeText: "Checking image quality...",
  },

  {
    key: "enhance",
    title: "Image Enhancement",
    description: "Waiting for image quality",
    activeText: "Enhancing retinal image...",
  },

  {
    key: "grade",
    title: "DR Grading",
    description: "Waiting for enhancement",
    activeText: "Assessing diabetic retinopathy...",
  },

  {
    key: "report",
    title: "Clinical Report",
    description: "Waiting for grading",
    activeText: "Generating clinical report...",
  },
];


function PipelineFlow() {

  const stage = useAnalysisStore(
    (state) => state.stage
  );

  const quality = useAnalysisStore(
    (state) => state.quality
  );

  const enhance = useAnalysisStore(
    (state) => state.enhance
  );

  const grade = useAnalysisStore(
    (state) => state.grade
  );

  const report = useAnalysisStore(
    (state) => state.report
  );

  const error = useAnalysisStore(
    (state) => state.error
  );


  const results = {
    quality,
    enhance,
    grade,
    report,
  };


  const getStatus = (stageKey) => {

    /* -----------------------------------------------
       ERROR
       ----------------------------------------------- */

    if (stage === "error") {

      if (results[stageKey]) {
        return "completed";
      }

      return "pending";
    }


    /* -----------------------------------------------
       COMPLETE
       ----------------------------------------------- */

    if (stage === "done") {
      return "completed";
    }


    /* -----------------------------------------------
       ACTIVE
       ----------------------------------------------- */

    if (stageKey === stage) {
      return "active";
    }


    /* -----------------------------------------------
       COMPLETED
       ----------------------------------------------- */

    if (results[stageKey]) {
      return "completed";
    }


    return "pending";
  };


  const currentStage =
    stages.find(
      (item) => item.key === stage
    );


  return (

    <LiquidGlass
      className="pipeline-card"
      variant="light"
    >

      <div className="pipeline-inner">


        {/* =================================================
            HEADER
            ================================================= */}

        <div className="pipeline-header">

          <div>

            <span className="section-kicker">
              PROCESSING PIPELINE
            </span>


            <h3>

              {stage === "done"
                ? "Analysis Complete"
                : stage === "error"
                ? "Analysis Stopped"
                : currentStage
                ? currentStage.title
                : "Preparing Analysis"}

            </h3>


            <p>

              {stage === "done"
                ? "All four screening stages have completed successfully."
                : stage === "error"
                ? "The screening pipeline was interrupted."
                : currentStage
                ? currentStage.activeText
                : "Preparing the retinal screening pipeline..."}

            </p>

          </div>


          <div className="pipeline-count">

            {stage === "done"
              ? "4 / 4"
              : stage === "error"
              ? "Stopped"
              : `${Math.max(
                  0,
                  stages.findIndex(
                    (item) =>
                      item.key === stage
                  ) + 1
                )} / 4`}

          </div>

        </div>


        {/* =================================================
            FOUR STAGES
            ================================================= */}

        <div className="pipeline-flow">

          {stages.map(
            (item, index) => {

              const status =
                getStatus(
                  item.key
                );


              return (

                <div
                  className="pipeline-stage-wrapper"
                  key={item.key}
                >

                  <div
                    className={`
                      pipeline-stage
                      pipeline-stage-${status}
                    `}
                  >

                    <div className="pipeline-stage-icon">

                      {status === "completed" && (
                        <span>✓</span>
                      )}


                      {status === "active" && (
                        <span className="pipeline-spinner" />
                      )}


                      {status === "pending" && (
                        <span>
                          {index + 1}
                        </span>
                      )}

                    </div>


                    <div className="pipeline-stage-text">

                      <strong>
                        {item.title}
                      </strong>


                      <span>

                        {status === "active"
                          ? item.activeText
                          : status === "completed"
                          ? "Completed"
                          : item.description}

                      </span>

                    </div>

                  </div>


                  {index <
                    stages.length - 1 && (

                    <div
                      className={`
                        pipeline-connector
                        ${
                          status ===
                          "completed"
                            ? "pipeline-connector-completed"
                            : ""
                        }
                      `}
                    />

                  )}

                </div>

              );
            }
          )}

        </div>


        {/* =================================================
            IMAGE QUALITY RESULT
            ================================================= */}

        {quality && (

          <div className="pipeline-quality-result">

            <div>

              <span className="section-kicker">
                IMAGE QUALITY CHECK
              </span>


              <strong>
                {quality.quality_label ||
                  "Quality Assessed"}
              </strong>


              {quality.recommendation && (

                <p>
                  {quality.recommendation}
                </p>

              )}

            </div>


            {typeof quality.quality_score ===
              "number" && (

              <div className="pipeline-quality-score">

                <span>
                  QUALITY SCORE
                </span>


                <strong>
                  {Math.round(
                    quality.quality_score * 100
                  )}
                  %
                </strong>

              </div>

            )}

          </div>

        )}


        {/* =================================================
            SUCCESS
            ================================================= */}

        {stage === "done" && (

          <div className="pipeline-success">

            <div className="pipeline-success-icon">
              ✓
            </div>


            <div>

              <strong>
                Analysis Complete
              </strong>


              <p>
                The retinal screening assessment
                has been generated successfully.
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            ERROR
            ================================================= */}

        {stage === "error" && (

          <div className="pipeline-error">

            <div className="pipeline-error-icon">
              !
            </div>


            <div>

              <strong>
                Analysis Stopped
              </strong>


              <p>

                {typeof error === "string"
                  ? error
                  : error?.message ||
                    "The analysis could not be completed."}

              </p>

            </div>

          </div>

        )}

      </div>

    </LiquidGlass>
  );
}


export default PipelineFlow;