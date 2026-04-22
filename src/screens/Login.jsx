import { useState } from 'react'
import { C } from '../constants.js'
import { Btn, Input } from '../components/ui.jsx'

export default function Login({ onLogin, loadingData, dataError, theme, onToggleTheme }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const attempt = async (em, pw) => {
    setLoading(true)
    setError("")
    try {
      await onLogin(em, pw)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text,
      backgroundImage: "radial-gradient(ellipse at 20% 50%, #1D3A6E18 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #3B1F6E18 0%, transparent 60%)",
    }}>
      <div style={{ width: 400, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button
            onClick={onToggleTheme}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              cursor: "pointer",
              padding: "6px 10px",
              fontSize: 12,
            }}
          >
            {theme === "dark" ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🎫</div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px",
            color: C.text,
            margin: "0 0 6px",
          }}>JEEXPERT</h1>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            Ticketing System
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: "28px 28px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

            {error && (
              <div style={{
                background: "#EF444410", border: "1px solid #EF444430", borderRadius: 7,
                padding: "9px 12px", color: "#EF4444", fontSize: 13,
              }}>{error}</div>
            )}

            <Btn
              onClick={() => attempt(email, password)}
              disabled={loading || loadingData || !email || !password}
              style={{ width: "100%", justifyContent: "center", display: "flex", padding: "11px" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Btn>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.card }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            {loadingData ? "Connecting to Airtable..." : "Connected to Airtable"}
          </div>
          {dataError && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 6 }}>{dataError}</div>}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted }}>
          Airtable-backed mode
        </div>
      </div>
    </div>
  )
}
