export default function StatCard({ label, value, sub, accent = "#c8a45a" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #e8e6e1", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: accent, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}
