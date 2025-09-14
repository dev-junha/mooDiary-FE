export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function SectionTitle({ icon = null, children }) {
  return (
    <div className="section-title-row">
      {icon && <span className="st-icon" aria-hidden>{icon}</span>}
      <span className="st-text">{children}</span>
    </div>
  );
}