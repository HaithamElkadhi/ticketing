import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, CATEGORIES, PRIORITIES, DIRECTIONS } from '../constants.js'
import { PageHeader, Card, Btn, Input, Textarea, Select } from '../components/ui.jsx'

function genTicketId() {
  const now = new Date("2026-04-22T" + new Date().toTimeString().slice(0, 5))
  const d = now.toISOString().slice(0, 10).replace(/-/g, "")
  const h = String(now.getHours()).padStart(2, "0")
  const m = String(now.getMinutes()).padStart(2, "0")
  return `TKT-${d}-${h}${m}`
}

export default function NewTicket() {
  const { user, navigate, users, prospects, createTicketRecord } = useApp()

  const defaultDir = user.role === "front" ? "Front→Back" : user.role === "back" ? "Back→Front" : "Front→Back"

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [direction, setDirection] = useState(defaultDir)
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [prospectId, setProspectId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const assignableRole = direction === "Front→Back" ? "back" : "front"
  const assignees = users.filter(u => (u.role === assignableRole || u.role === "admin") && u.status === "Active")
  if (user.role === "admin") {
    // admin can assign to anyone
  }
  const finalAssignees = user.role === "admin"
    ? users.filter(u => u.status === "Active")
    : assignees

  const valid = title.trim() && desc.trim() && direction && category && priority && assignedTo

  const handleSubmit = async () => {
    if (!valid) { setError("Please fill all required fields."); return }
    setError("")
    setSubmitting(true)
    try {
      const newTicket = {
        ticketId: genTicketId(),
        title: title.trim(),
        description: desc.trim(),
        direction,
        category,
        priority,
        status: "Open",
        createdBy: user.name,
        createdByRole: user.role,
        assignedTo,
        linkedProspect: prospectId || null,
        comments: "",
        dueDate: dueDate || "",
        resolutionNote: "",
        closedBy: "",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }
      const created = await createTicketRecord(newTicket)
      navigate("ticket", { ticketId: created.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <PageHeader
        title="New Ticket"
        subtitle="Fill in the details to create a new support ticket"
        actions={<Btn variant="secondary" onClick={() => navigate("tickets")}>← Cancel</Btn>}
      />

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input label="Title" value={title} onChange={setTitle} placeholder="Short description of the request" required />
          <Textarea label="Description" value={desc} onChange={setDesc} placeholder="Full context — what happened, what is needed…" rows={5} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {user.role === "admin" ? (
              <Select label="Direction" value={direction} onChange={v => { setDirection(v); setAssignedTo("") }} options={DIRECTIONS} required />
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  Direction <span style={{ color: "#EF4444" }}>*</span>
                </div>
                <div style={{
                  background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 7,
                  padding: "9px 12px", fontSize: 13, color: C.text,
                }}>
                  {direction}
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>(auto-set by role)</span>
                </div>
              </div>
            )}
            <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} placeholder="Select category" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Select label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} placeholder="Select priority" required />
            <Select
              label="Assign To"
              value={assignedTo}
              onChange={setAssignedTo}
              options={finalAssignees.map(u => ({ value: u.name, label: `${u.name} (${u.role})` }))}
              placeholder="Select agent"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Select
              label="Linked Prospect"
              value={prospectId}
              onChange={setProspectId}
              options={prospects.map(p => ({ value: p.id, label: `${p.name} — ${p.prospectId}` }))}
              placeholder="No prospect linked"
            />
            <Input label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
          </div>

          {error && (
            <div style={{
              background: "#EF444410", border: "1px solid #EF444430", borderRadius: 7,
              padding: "9px 12px", color: "#EF4444", fontSize: 13,
            }}>{error}</div>
          )}

          {/* Direction info */}
          <div style={{
            background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "12px 14px", fontSize: 12, color: C.muted, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text }}>Ticket flow: </strong>
            {direction === "Front→Back"
              ? "You (Front Office) are submitting to Back Office for processing. Back Office will pick up, process, and resolve. You will then confirm and close."
              : "You (Back Office) are requesting action from Front Office. Front Office will contact the student and update the ticket."}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => navigate("tickets")}>Cancel</Btn>
            <Btn onClick={handleSubmit} disabled={!valid || submitting}>
              {submitting ? "Creating…" : "Create Ticket"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
