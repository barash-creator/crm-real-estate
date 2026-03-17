const VARIANTS = {
  default: { background: "#f1f0ec", color: "#1a1a2e" },
  primary: { background: "#c8a45a", color: "#fff" },
  danger:  { background: "#fee2e2", color: "#dc2626" },
  ghost:   { background: "transparent", color: "#64748b" },
};

export default function Btn({ children, onClick, variant = "default", style: sx = {}, disabled }) {
  const base = {
    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all 0.15s", display: "inline-flex", alignItems: "center",
    gap: 6, opacity: disabled ? 0.5 : 1,
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...VARIANTS[variant], ...sx }}>
      {children}
    </button>
  );
}
