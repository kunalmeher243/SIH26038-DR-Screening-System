import "../styles/liquidGlass.css";

function LiquidGlass({
  children,
  className = "",
  hover = false,
  variant = "",
}) {
  const classes = [
    "glass",
    variant ? `glass-${variant}` : "",
    hover ? "glass-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
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