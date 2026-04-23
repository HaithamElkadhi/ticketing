import { useApp } from '../App.jsx'
import { C, STATUS_COLORS, PRIORITY_COLORS, DIR_COLORS, ROLE_COLORS } from '../constants.js'
import { Badge, StatCard, Card, Btn } from '../components/ui.jsx'

function getRoleTickets(tickets, user) {
  if (user.role === "admin") return tickets
  return tickets.filter(t => {
    if (user.role === "front") {
      return (t.direction === "Front→Back" && t.createdBy === user.name) ||
             (t.direction === "Back→Front" && t.assignedTo === user.name)
    }
    return (t.direction === "Front→Back" && t.assignedTo === user.name) ||
           (t.direction === "Back→Front" && t.createdBy === user.name)
  })
}

export default function Dashboard() {
  const { user, tickets, navigate } = useApp()
  const mine = getRoleTickets(tickets, user)

  const count = (s) => mine.filter(t => t.status === s).length
  const urgent = mine.filter(t => t.priority === "Urgent" && !["Closed", "Resolved"].includes(t.status)).length
  const recent = [...mine].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  const roleLabel = user.role === "admin" ? "Admin" : user.role === "front" ? "Front Office" : "Back Office"
  const roleColor = ROLE_COLORS[user.role]

  const today = new Date("2026-04-22")
  const overdue = mine.filter(t => t.dueDate && new Date(t.dueDate) < today && !["Closed", "Resolved"].includes(t.status)).length

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: roleColor + "20", border: `1.5px solid ${roleColor}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: roleColor,
          }}>{user.name.charAt(0)}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
              Good morning, {user.name.split(" ")[0]}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              <Badge color={roleColor} small>{roleLabel}</Badge>
              <span style={{ marginLeft: 8 }}>Tuesday, April 22, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total" value={mine.length} color={C.accent} icon="🎫" />
        <StatCard label="Open" value={count("Open")} color={STATUS_COLORS.Open} icon="🔵" />
        <StatCard label="In Progress" value={count("In Progress")} color={STATUS_COLORS["In Progress"]} icon="🟡" />
        <StatCard label="Pending" value={count("Pending")} color={STATUS_COLORS.Pending} icon="🟣" />
        <StatCard label="Resolved" value={count("Resolved")} color={STATUS_COLORS.Resolved} icon="🟢" />
        <StatCard label="Closed" value={count("Closed")} color={STATUS_COLORS.Closed} icon="⚫" />
      </div>

      {/* Alert row */}
      {(urgent > 0 || overdue > 0) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {urgent > 0 && (
            <div style={{
              background: "#DC262610", border: "1px solid #DC262630", borderRadius: 8,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1,
            }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>
                  {urgent} Urgent ticket{urgent > 1 ? "s" : ""} require attention
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Immediate action needed</div>
              </div>
              <Btn variant="danger" small style={{ marginLeft: "auto" }} onClick={() => navigate("tickets")}>
                View All
              </Btn>
            </div>
          )}
          {overdue > 0 && (
            <div style={{
              background: "#EF444410", border: "1px solid #EF444430", borderRadius: 8,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1,
            }}>
              <span style={{ fontSize: 18 }}>⏰</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#EF4444" }}>
                  {overdue} ticket{overdue > 1 ? "s" : ""} past due date
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Overdue — check immediately</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* Recent tickets */}
        <Card style={{ padding: 0 }}>
          <div style={{
            padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Recent Tickets</div>
            <Btn variant="ghost" small onClick={() => navigate("tickets")}>View all →</Btn>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>No tickets yet</div>
          ) : (
            <div>
              {recent.map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => navigate("ticket", { ticketId: t.id })}
                  style={{
                    padding: "13px 20px", cursor: "pointer",
                    borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                    transition: "background 0.12s",
                    display: "flex", alignItems: "center", gap: 14,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.subtle}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: STATUS_COLORS[t.status],
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: "monospace" }}>{t.ticketId}</span>
                      <span>·</span>
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>→ {t.assignedTo}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Badge color={DIR_COLORS[t.direction]} small>{t.direction}</Badge>
                    <Badge color={PRIORITY_COLORS[t.priority]} small>{t.priority}</Badge>
                    <Badge color={STATUS_COLORS[t.status]} small>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick actions */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn onClick={() => navigate("new-ticket")} style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                + New Ticket
              </Btn>
              <Btn variant="secondary" onClick={() => navigate("tickets")} style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                All Tickets
              </Btn>
              {user.role !== "admin" && (
                <Btn variant="secondary" onClick={() => navigate("my-tickets")} style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                  My Queue
                </Btn>
              )}
            </div>
          </Card>

          {/* Status breakdown */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 14 }}>Breakdown</div>
            {Object.entries(STATUS_COLORS).map(([s, col]) => {
              const n = count(s)
              const pct = mine.length ? Math.round((n / mine.length) * 100) : 0
              return (
                <div key={s} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{s}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{n}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: C.border }}>
                    <div style={{ height: "100%", borderRadius: 2, background: col, width: pct + "%" }} />
                  </div>
                </div>
              )
            })}
          </Card>

          {/* Direction split */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 14 }}>Directions</div>
            {["Front→Back", "Back→Front"].map(d => {
              const n = mine.filter(t => t.direction === d).length
              return (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Badge color={DIR_COLORS[d]} small>{d}</Badge>
                  <span style={{ fontWeight: 700, fontSize: 14, color: DIR_COLORS[d] }}>{n}</span>
                </div>
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}
