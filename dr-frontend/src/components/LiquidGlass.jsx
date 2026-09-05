import "../styles/liquidGlass.css";

function LiquidGlass({
  children,
  className = "",
  variant = "default",
  hover = false,
}) {
  const variantClass =
    variant === "light"
      ? "glass-light"
      : variant === "strong"
      ? "glass-strong"
      : variant === "dark"
      ? "glass-dark"
      : "";

  const hoverClass = hover
    ? "glass-hover"
    : "";

  return (
    <div
      className={`glass ${variantClass} ${hoverClass} ${className}`.trim()}
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