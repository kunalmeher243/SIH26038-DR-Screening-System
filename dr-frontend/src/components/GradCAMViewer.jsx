import useAnalysisStore from "../store/useAnalysisStore";

function GradCAMViewer() {
  const report = useAnalysisStore((state) => state.report);

  if (!report) {
    return null;
  }

  const gradcamImage = report.gradcam_image;
  const lesionOverlayImage = report.lesion_overlay_image;

  return (
    <section style={containerStyle}>

      {/* Header */}

      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>
            Visual Explainability
          </h2>

          <p style={subtitleStyle}>
            AI attention map and detected retinal lesions
          </p>
        </div>
      </div>

      {/* Images */}

      <div style={imagesGridStyle}>

        {/* GradCAM */}

        <ImageCard
          title="Grad-CAM"
          description="Regions influencing the AI classification"
          image={gradcamImage}
        />

        {/* Lesion Overlay */}

        <ImageCard
          title="Lesion Detection"
          description="Detected retinal lesions and affected regions"
          image={lesionOverlayImage}
        />

      </div>

    </section>
  );
}


/* =========================
   Image Card
========================= */

function ImageCard({
  title,
  description,
  image,
}) {
  return (
    <div style={cardStyle}>

      <div style={cardHeaderStyle}>
        <h3 style={{ margin: 0 }}>
          {title}
        </h3>

        <p style={descriptionStyle}>
          {description}
        </p>
      </div>

      {image ? (
        <div style={imageContainerStyle}>
          <img
            src={image}
            alt={title}
            style={imageStyle}
          />
        </div>
      ) : (
        <div style={placeholderStyle}>
          <div style={placeholderIconStyle}>
            ◌
          </div>

          <strong>
            Image not available
          </strong>

          <p style={{ margin: "6px 0 0" }}>
            This visualization will appear when
            the ML analysis provides the image.
          </p>
        </div>
      )}

    </div>
  );
}


/* =========================
   Styles
========================= */

const containerStyle = {
  marginTop: "30px",
  marginBottom: "30px",
  padding: "25px",
  background: "#ffffff",
  border: "1px solid #d9dfe7",
  borderRadius: "12px",
};

const headerStyle = {
  marginBottom: "20px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#666",
};

const imagesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
};

const cardStyle = {
  border: "1px solid #e0e4e8",
  borderRadius: "10px",
  overflow: "hidden",
  background: "#fafbfc",
};

const cardHeaderStyle = {
  padding: "18px",
  borderBottom: "1px solid #e0e4e8",
};

const descriptionStyle = {
  margin: "5px 0 0",
  color: "#666",
  fontSize: "14px",
};

const imageContainerStyle = {
  width: "100%",
  height: "350px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const placeholderStyle = {
  height: "350px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
  color: "#666",
};

const placeholderIconStyle = {
  fontSize: "45px",
  marginBottom: "10px",
};

export default GradCAMViewer;