import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, ROLE_COLORS } from '../constants.js'
import { Badge } from './ui.jsx'

const NAV = [
  { id: "dashboard",  label: "Dashboard",       icon: "◈", roles: ["admin", "front", "back"] },
  { id: "tickets",    label: "All Tickets",      icon: "≡", roles: ["admin", "front", "back"] },
  { id: "my-tickets", label: "My Tickets",       icon: "◎", roles: ["admin", "front", "back"] },
  { id: "new-ticket", label: "New Ticket",       icon: "+", roles: ["admin", "front", "back"], accent: true },
  { id: "users",      label: "User Management",  icon: "◉", roles: ["admin"] },
]

export default function Layout({ children }) {
  const { user, navigate, page, logout, theme, setTheme } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  const roleColor = ROLE_COLORS[user.role] || C.accent
  const roleLabel = user.role === "admin" ? "Admin" : user.role === "front" ? "Front Office" : "Back Office"

  const sideW = collapsed ? 64 : 220

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sideW, flexShrink: 0, background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
        transition: "width 0.2s", overflowX: "hidden", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 0" : "20px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>
                🎫 JEEXPERT
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Ticketing
              </div>
            </div>
          )}
          {collapsed && <span style={{ fontSize: 20 }}>🎫</span>}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                color: C.muted, cursor: "pointer", padding: "4px 7px", fontSize: 12, lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? "☀" : "🌙"}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                color: C.muted, cursor: "pointer", padding: "4px 7px", fontSize: 12, lineHeight: 1,
                flexShrink: 0,
              }}
            >{collapsed ? "▶" : "◀"}</button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
          {!collapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 8px 4px" }}>
              Navigation
            </div>
          )}
          {NAV.filter(n => n.roles.includes(user.role)).map(n => {
            const active = page === n.id
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                title={collapsed ? n.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed ? "10px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  background: active ? C.accent + "18" : n.accent ? C.accent + "10" : "transparent",
                  color: active ? C.accent : n.accent ? C.accent : C.muted,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: n.id === "new-ticket" ? 18 : 14, fontWeight: 700, flexShrink: 0 }}>
                  {n.icon}
                </span>
                {!collapsed && <span>{n.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div style={{
          padding: collapsed ? "16px 0" : "16px 14px",
          borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: roleColor + "20", border: `1.5px solid ${roleColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: roleColor,
          }}>
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>{roleLabel}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: "none", border: "none", color: C.muted, cursor: "pointer",
                fontSize: 14, padding: 2, flexShrink: 0,
              }}
            >⏻</button>
          )}
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main style={{
        flex: 1, marginLeft: sideW, transition: "margin-left 0.2s",
        minHeight: "100vh", padding: "32px 36px",
        maxWidth: "calc(100vw - " + sideW + "px)",
      }}>
        {children}
      </main>
    </div>
  )
}
