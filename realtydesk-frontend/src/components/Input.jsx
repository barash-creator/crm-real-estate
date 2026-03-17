export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e0db", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafaf8", ...props.style }} />
    </div>
  );
}

export function Select({ label, options = [], ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e0db", fontSize: 14, outline: "none", background: "#fafaf8", ...props.style }}>
        {options.map((o) =>
          typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  );
}
