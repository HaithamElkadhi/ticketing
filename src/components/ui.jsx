import { C } from '../constants.js'

export function Badge({ children, color = C.accent, small = false, style = {} }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: color + "18", color, border: `1px solid ${color}35`,
      borderRadius: 5, padding: small ? "1px 7px" : "3px 10px",
      fontSize: small ? 10 : 11, fontWeight: 700,
      letterSpacing: "0.04em", whiteSpace: "nowrap",
      ...style,
    }}>{children}</span>
  )
}

export function Card({ children, style = {}, glow, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${glow ? glow + "40" : C.border}`,
        borderRadius: 10, padding: "18px 22px",
        boxShadow: glow ? `0 0 24px ${glow}12` : "none",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s",
        ...style,
      }}
    >{children}</div>
  )
}

export function Btn({ children, onClick, variant = "primary", small = false, disabled = false, style = {} }) {
  const variants = {
    primary:   { background: "#3B82F6", color: "#fff", border: "1px solid #3B82F620" },
    secondary: { background: C.subtle, color: C.text, border: `1px solid ${C.border}` },
    danger:    { background: "#EF444418", color: "#EF4444", border: "1px solid #EF444435" },
    success:   { background: "#10B98118", color: "#10B981", border: "1px solid #10B98135" },
    ghost:     { background: "transparent", color: C.muted, border: "1px solid transparent" },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
        padding: small ? "5px 12px" : "8px 18px",
        fontSize: small ? 12 : 13, fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s, background 0.15s",
        whiteSpace: "nowrap",
        ...style,
      }}
    >{children}</button>
  )
}

export function Input({ label, value, onChange, placeholder, type = "text", required, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 7,
          padding: "9px 12px", color: C.text, fontSize: 13,
          outline: "none", transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, required, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 7,
          padding: "9px 12px", color: C.text, fontSize: 13,
          outline: "none", resize: "vertical", lineHeight: 1.6,
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options, placeholder, required, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 7,
          padding: "9px 12px", color: value ? C.text : C.muted, fontSize: 13,
          outline: "none", cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "32px",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#00000088", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
        padding: "24px 28px", position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, color = C.accent, icon, sub }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${color}30`,
      borderRadius: 10, padding: "18px 20px",
      boxShadow: `0 0 20px ${color}08`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 24, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon = "📭", message }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  )
}
