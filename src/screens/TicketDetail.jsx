import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, STATUS_COLORS, PRIORITY_COLORS, DIR_COLORS, ROLE_COLORS } from '../constants.js'
import { Badge, Card, Btn, Textarea, Modal, Input } from '../components/ui.jsx'

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function fmtDateShort(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function getActions(ticket, user) {
  const isCreator = ticket.createdBy === user.name
  const isAssignee = ticket.assignedTo === user.name
  const isAdmin = user.role === "admin"
  const s = ticket.status
  const actions = []

  if (s === "Open" && (isAssignee || isAdmin))                          actions.push("take")
  if (s === "In Progress" && (isAssignee || isAdmin))                   actions.push("pending")
  if ((s === "In Progress" || s === "Pending") && (isAssignee || isAdmin)) actions.push("resolve")
  if (s === "Resolved" && (isCreator || isAdmin))                       actions.push("close")
  if (s === "Closed" && isAdmin)                                        actions.push("reopen")
  if (!["Closed"].includes(s))                                          actions.push("comment")

  return actions
}

function CommentLine({ line }) {
  const match = line.match(/^\[(.+?)\]\[(.+?)\]:\s?(.*)$/)
  if (!match) return <div style={{ fontSize: 13, color: C.muted, padding: "4px 0" }}>{line}</div>
  const [, name, date, text] = match
  return (
    <div style={{
      background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "10px 14px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%", background: C.accent + "20",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: C.accent, flexShrink: 0,
        }}>{name.charAt(0)}</div>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{name}</span>
        <span style={{ fontSize: 11, color: C.muted }}>{date}</span>
      </div>
      <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6, paddingLeft: 32 }}>{text}</div>
    </div>
  )
}

export default function TicketDetail({ ticketId }) {
  const { user, tickets, updateTicketRecord, navigate, prospects } = useApp()
  const ticket = tickets.find(t => t.id === ticketId)

  const [comment, setComment] = useState("")
  const [resolveModal, setResolveModal] = useState(false)
  const [resNote, setResNote] = useState("")
  const [closeModal, setCloseModal] = useState(false)

  if (!ticket) {
    return (
      <div style={{ textAlign: "center", padding: 64, color: C.muted }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎫</div>
        <div>Ticket not found</div>
        <Btn variant="secondary" onClick={() => navigate("tickets")} style={{ marginTop: 16 }}>Back to list</Btn>
      </div>
    )
  }

  const actions = getActions(ticket, user)
  const linkedProspect = ticket.linkedProspect ? prospects.find(p => p.id === ticket.linkedProspect) : null

  const updateTicket = async (patch) => {
    await updateTicketRecord(ticketId, { ...patch, lastModified: new Date().toISOString() })
  }

  const now = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).replace(",", "")

  const addComment = async () => {
    if (!comment.trim()) return
    const entry = `[${user.name}][${now}]: ${comment.trim()}`
    await updateTicket({ comments: ticket.comments ? ticket.comments + "\n" + entry : entry })
    setComment("")
  }

  const handleAction = async (action) => {
    if (action === "take")    await updateTicket({ status: "In Progress" })
    if (action === "pending") await updateTicket({ status: "Pending" })
    if (action === "reopen")  await updateTicket({ status: "Open", resolutionNote: "", closedBy: "" })
    if (action === "resolve") setResolveModal(true)
    if (action === "close")   setCloseModal(true)
  }

  const confirmResolve = async () => {
    if (!resNote.trim()) return
    await updateTicket({ status: "Resolved", resolutionNote: resNote.trim() })
    setResolveModal(false)
    setResNote("")
  }

  const confirmClose = async () => {
    await updateTicket({ status: "Closed", closedBy: user.name })
    setCloseModal(false)
  }

  const commentLines = ticket.comments ? ticket.comments.split("\n").filter(Boolean) : []

  const today = new Date("2026-04-22")
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < today && !["Closed", "Resolved"].includes(ticket.status)

  const actionConfig = {
    take:    { label: "Take Ticket",    variant: "primary",   icon: "▶" },
    pending: { label: "Mark Pending",   variant: "secondary", icon: "⏸" },
    resolve: { label: "Mark Resolved",  variant: "success",   icon: "✓" },
    close:   { label: "Close Ticket",   variant: "secondary", icon: "✕" },
    reopen:  { label: "Reopen",         variant: "secondary", icon: "↺" },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate("tickets")}
          style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 12, padding: 0 }}
        >← All Tickets</button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, background: C.subtle, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>
                {ticket.ticketId}
              </span>
              <Badge color={DIR_COLORS[ticket.direction]}>{ticket.direction}</Badge>
              <Badge color={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
              <Badge color={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
              {isOverdue && <Badge color="#EF4444">⚠ Overdue</Badge>}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.3px", lineHeight: 1.3 }}>
              {ticket.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actions.filter(a => a !== "comment").map(a => (
              <Btn key={a} variant={actionConfig[a].variant} onClick={async () => handleAction(a)}>
                {actionConfig[a].icon} {actionConfig[a].label}
              </Btn>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Description */}
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Description</div>
            <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7, margin: 0 }}>{ticket.description}</p>
          </Card>

          {/* Resolution note */}
          {ticket.resolutionNote && (
            <Card glow="#10B981">
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resolution Note</div>
              </div>
              <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7, margin: 0 }}>{ticket.resolutionNote}</p>
              {ticket.closedBy && (
                <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>Closed by {ticket.closedBy}</div>
              )}
            </Card>
          )}

          {/* Comments */}
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
              Comments ({commentLines.length})
            </div>
            {commentLines.length === 0 && (
              <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic", marginBottom: 14 }}>No comments yet.</div>
            )}
            {commentLines.map((line, i) => <CommentLine key={i} line={line} />)}

            {actions.includes("comment") && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <Textarea
                  value={comment}
                  onChange={setComment}
                  placeholder="Add a comment or update…"
                  rows={3}
                />
                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                  <Btn onClick={async () => addComment()} disabled={!comment.trim()} small>Post Comment</Btn>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Details</div>
            {[
              { label: "Status",      value: <Badge color={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge> },
              { label: "Priority",    value: <Badge color={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge> },
              { label: "Direction",   value: <Badge color={DIR_COLORS[ticket.direction]}>{ticket.direction}</Badge> },
              { label: "Category",    value: <span style={{ fontSize: 13, color: C.text }}>{ticket.category}</span> },
              { label: "Created by",  value: <span style={{ fontSize: 13, color: C.text }}>{ticket.createdBy}</span> },
              { label: "Assigned to", value: <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{ticket.assignedTo}</span> },
              { label: "Prospect",    value: linkedProspect
                ? <span style={{ fontSize: 13, color: C.accent }}>{linkedProspect.name} · {linkedProspect.prospectId}</span>
                : <span style={{ fontSize: 13, color: C.muted }}>—</span> },
              { label: "Due Date",    value: <span style={{ fontSize: 13, color: isOverdue ? "#EF4444" : C.text }}>{fmtDateShort(ticket.dueDate)}</span> },
              { label: "Created",     value: <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(ticket.createdAt)}</span> },
              { label: "Modified",    value: <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(ticket.lastModified)}</span> },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</span>
                <div>{value}</div>
              </div>
            ))}
          </Card>

          {/* Status flow */}
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Status Flow</div>
            {["Open", "In Progress", "Pending", "Resolved", "Closed"].map((s, i) => {
              const statuses = ["Open", "In Progress", "Pending", "Resolved", "Closed"]
              const currentIdx = statuses.indexOf(ticket.status)
              const thisIdx = statuses.indexOf(s)
              const isPast = thisIdx < currentIdx
              const isCurrent = thisIdx === currentIdx
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: isCurrent ? STATUS_COLORS[s] : isPast ? STATUS_COLORS[s] + "60" : C.border,
                    boxShadow: isCurrent ? `0 0 6px ${STATUS_COLORS[s]}` : "none",
                  }} />
                  <span style={{ fontSize: 12, color: isCurrent ? STATUS_COLORS[s] : isPast ? C.muted : C.border, fontWeight: isCurrent ? 700 : 400 }}>
                    {s}
                  </span>
                  {isCurrent && <span style={{ fontSize: 10, color: STATUS_COLORS[s] }}>← current</span>}
                </div>
              )
            })}
          </Card>
        </div>
      </div>

      {/* Resolve modal */}
      <Modal open={resolveModal} onClose={() => { setResolveModal(false); setResNote("") }} title="Mark as Resolved">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
            Please provide a resolution note explaining what was done. The ticket creator will review this before closing.
          </p>
          <Textarea
            label="Resolution Note"
            value={resNote}
            onChange={setResNote}
            placeholder="Describe what was done to resolve this ticket…"
            rows={5}
            required
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => { setResolveModal(false); setResNote("") }}>Cancel</Btn>
            <Btn variant="success" onClick={async () => confirmResolve()} disabled={!resNote.trim()}>Confirm Resolution</Btn>
          </div>
        </div>
      </Modal>

      {/* Close modal */}
      <Modal open={closeModal} onClose={() => setCloseModal(false)} title="Close Ticket">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
            Are you sure you want to close this ticket? This confirms that the resolution is satisfactory and the case is archived.
          </p>
          {ticket.resolutionNote && (
            <div style={{ background: C.subtle, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Resolution Note</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{ticket.resolutionNote}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setCloseModal(false)}>Cancel</Btn>
            <Btn onClick={async () => confirmClose()}>Close Ticket</Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
