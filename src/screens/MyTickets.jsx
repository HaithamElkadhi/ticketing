import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, STATUS_COLORS, PRIORITY_COLORS, DIR_COLORS } from '../constants.js'
import { Badge, PageHeader, Card, Btn, EmptyState } from '../components/ui.jsx'

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
}

function TicketRow({ ticket, navigate }) {
  const [hover, setHover] = useState(false)
  const today = new Date("2026-04-22")
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < today && !["Closed", "Resolved"].includes(ticket.status)

  return (
    <tr
      onClick={() => navigate("ticket", { ticketId: ticket.id })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer", background: hover ? C.subtle : "transparent", transition: "background 0.1s" }}
    >
      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
        {ticket.ticketId.replace("TKT-", "")}
      </td>
      <td style={{ padding: "12px 16px", maxWidth: 300 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.title}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{ticket.category}</div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <Badge color={DIR_COLORS[ticket.direction]} small>{ticket.direction}</Badge>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <Badge color={PRIORITY_COLORS[ticket.priority]} small>{ticket.priority}</Badge>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <Badge color={STATUS_COLORS[ticket.status]} small>{ticket.status}</Badge>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: isOverdue ? "#EF4444" : C.muted, whiteSpace: "nowrap" }}>
        {fmtDate(ticket.dueDate)}
        {isOverdue && <span style={{ marginLeft: 4 }}>⚠</span>}
      </td>
    </tr>
  )
}

function TicketTable({ tickets, navigate, emptyMsg }) {
  if (tickets.length === 0) return <EmptyState message={emptyMsg} />
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["Ticket ID", "Title", "Direction", "Priority", "Status", "Due Date"].map(h => (
              <th key={h} style={{
                padding: "10px 16px", textAlign: "left",
                fontSize: 10, fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.05em",
                background: C.subtle, whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => <TicketRow key={t.id} ticket={t} navigate={navigate} />)}
        </tbody>
      </table>
    </div>
  )
}

export default function MyTickets() {
  const { user, tickets, navigate } = useApp()
  const [tab, setTab] = useState("submitted")

  if (user.role === "admin") {
    return (
      <div style={{ textAlign: "center", padding: 64, color: C.muted }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👀</div>
        <div style={{ fontSize: 14 }}>Admins see all tickets in the All Tickets view.</div>
        <Btn variant="secondary" onClick={() => navigate("tickets")} style={{ marginTop: 16 }}>Go to All Tickets</Btn>
      </div>
    )
  }

  const submitted = tickets.filter(t => t.createdBy === user.name)
  const assigned  = tickets.filter(t => t.assignedTo === user.name)

  const openCount = (arr) => arr.filter(t => !["Closed", "Resolved"].includes(t.status)).length

  return (
    <div>
      <PageHeader
        title="My Tickets"
        subtitle="Your personal queue — submitted and assigned"
        actions={<Btn onClick={() => navigate("new-ticket")}>+ New Ticket</Btn>}
      />

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 20px", flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{submitted.length}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Submitted by me · {openCount(submitted)} active</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 20px", flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#8B5CF6" }}>{assigned.length}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Assigned to me · {openCount(assigned)} active</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 0, borderBottom: `1px solid ${C.border}` }}>
        {[
          { id: "submitted", label: `Submitted by me`, count: submitted.length },
          { id: "assigned",  label: `Assigned to me`,  count: assigned.length  },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "11px 18px", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? C.accent : C.muted,
              borderBottom: `2px solid ${tab === t.id ? C.accent : "transparent"}`,
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            {t.label}
            <span style={{
              background: C.subtle, color: tab === t.id ? C.accent : C.muted,
              borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: "none" }}>
        {tab === "submitted" && (
          <TicketTable
            tickets={[...submitted].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            navigate={navigate}
            emptyMsg="You haven't submitted any tickets yet."
          />
        )}
        {tab === "assigned" && (
          <TicketTable
            tickets={[...assigned].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            navigate={navigate}
            emptyMsg="No tickets are currently assigned to you."
          />
        )}
      </Card>
    </div>
  )
}
