import "../styles/LiquidGlass.css";

function LiquidGlass({
  children,
  className = "",
  variant = "default",
  hover = false,
}) {
  return (
    <div
      className={[
        "glass",
        `glass-${variant}`,
        hover ? "glass-hover" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="glass-specular"
        aria-hidden="true"
      />

      <div className="glass-content">
        {children}
      </div>
    </div>
  );
}

export default LiquidGlass;