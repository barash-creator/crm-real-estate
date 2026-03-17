export default function Badge({ children, color = "#6366f1" }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: color + "18", color }}>
      {children}
    </span>
  );
}
