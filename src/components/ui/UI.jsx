export const iS = {
  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-input)",
  borderRadius: 7, color: "var(--text-main)", padding: "8px 12px", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical",
};

export function Input({ label, value, onChange, placeholder, type = "text", rows, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={iS} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iS} />
      }
      {hint && <div style={{ fontSize: 10.5, color: "var(--text-dimer)", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export function Btn({ children, onClick, v = "primary", disabled, sm, full, loading }) {
  const vs = {
    primary: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff" },
    secondary: { background: "var(--bg-btn-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-input)" },
    ghost: { background: "transparent", color: "#6366f1", border: "1px solid #4f46e5" },
    danger: { background: "var(--bg-active)", color: "#f87171", border: "1px solid var(--border-input)" },
    green: { background: "linear-gradient(135deg,#065f46,#059669)", color: "#fff" },
    dark: { background: "var(--bg-card)", color: "var(--text-dim)", border: "1px solid var(--border-input)" },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      border: "none", borderRadius: 7,
      padding: sm ? "5px 13px" : "9px 20px",
      fontSize: sm ? 11.5 : 13.5, fontWeight: 600,
      cursor: (disabled || loading) ? "not-allowed" : "pointer",
      opacity: (disabled || loading) ? 0.55 : 1,
      fontFamily: "inherit", whiteSpace: "nowrap",
      width: full ? "100%" : "auto",
      display: full ? "block" : "inline-block",
      ...vs[v],
    }}>
      {loading ? "⏳ Please wait..." : children}
    </button>
  );
}

export function Chip({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--bg-active)", border: "1px solid var(--border-main)", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "var(--text-dim)", margin: "3px 4px 3px 0" }}>
      {label}
      <span onClick={onRemove} style={{ cursor: "pointer", color: "#6366f1", fontWeight: 700, fontSize: 13, lineHeight: 1 }}>×</span>
    </span>
  );
}

export function SL({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 18, marginBottom: 8, paddingTop: 14, borderTop: "1px solid var(--border-main)" }}>{children}</div>;
}

export function Card({ children, style }) {
  return <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 9, padding: 14, marginBottom: 14, ...style }}>{children}</div>;
}
