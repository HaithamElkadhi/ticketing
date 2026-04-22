import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, STATUS_COLORS, PRIORITY_COLORS, DIR_COLORS, CATEGORIES, PRIORITIES, STATUSES, DIRECTIONS } from '../constants.js'
import { Badge, PageHeader, Btn, Select, Input, EmptyState } from '../components/ui.jsx'

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function TicketRow({ ticket, onClick }) {
  const [hover, setHover] = useState(false)
  const today = new Date("2026-04-22")
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < today && !["Closed", "Resolved"].includes(ticket.status)

  return (
    <tr
      onClick={() => onClick(ticket.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer", background: hover ? C.subtle : "transparent", transition: "background 0.1s" }}
    >
      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
        {ticket.ticketId.replace("TKT-", "")}
      </td>
      <td style={{ padding: "12px 16px", maxWidth: 280 }}>
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
      <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
        {ticket.assignedTo}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, whiteSpace: "nowrap", color: isOverdue ? "#EF4444" : C.muted }}>
        {fmtDate(ticket.dueDate)}
        {isOverdue && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠</span>}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
        {fmtDate(ticket.createdAt)}
      </td>
    </tr>
  )
}

export default function TicketList() {
  const { tickets, user, navigate } = useApp()
  const [search, setSearch] = useState("")
  const [filterDir, setFilterDir] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [sort, setSort] = useState("createdAt_desc")

  let visible = [...tickets]

  if (search) {
    const q = search.toLowerCase()
    visible = visible.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.ticketId.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.assignedTo || "").toLowerCase().includes(q)
    )
  }
  if (filterDir) visible = visible.filter(t => t.direction === filterDir)
  if (filterStatus) visible = visible.filter(t => t.status === filterStatus)
  if (filterPriority) visible = visible.filter(t => t.priority === filterPriority)
  if (filterCategory) visible = visible.filter(t => t.category === filterCategory)

  const [field, dir] = sort.split("_")
  visible.sort((a, b) => {
    let va = a[field] || ""
    let vb = b[field] || ""
    if (field === "createdAt") { va = new Date(va); vb = new Date(vb) }
    if (va < vb) return dir === "asc" ? -1 : 1
    if (va > vb) return dir === "asc" ? 1 : -1
    return 0
  })

  const activeFilters = [filterDir, filterStatus, filterPriority, filterCategory].filter(Boolean).length

  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle={`${visible.length} of ${tickets.length} tickets`}
        actions={<Btn onClick={() => navigate("new-ticket")}>+ New Ticket</Btn>}
      />

      {/* Filter bar */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: "14px 16px", marginBottom: 16,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end",
      }}>
        <Input
          value={search} onChange={setSearch}
          placeholder="Search title, ID, assignee…"
          style={{ flex: "1 1 220px", minWidth: 180 }}
        />
        <Select value={filterDir} onChange={setFilterDir} options={DIRECTIONS} placeholder="All directions" style={{ flex: "0 1 160px" }} />
        <Select value={filterStatus} onChange={setFilterStatus} options={STATUSES} placeholder="All statuses" style={{ flex: "0 1 150px" }} />
        <Select value={filterPriority} onChange={setFilterPriority} options={PRIORITIES} placeholder="All priorities" style={{ flex: "0 1 150px" }} />
        <Select value={filterCategory} onChange={setFilterCategory} options={CATEGORIES} placeholder="All categories" style={{ flex: "0 1 150px" }} />
        <Select
          value={sort} onChange={setSort}
          options={[
            { value: "createdAt_desc", label: "Newest first" },
            { value: "createdAt_asc",  label: "Oldest first" },
            { value: "dueDate_asc",    label: "Due date ↑" },
            { value: "priority_desc",  label: "Priority" },
          ]}
          style={{ flex: "0 1 150px" }}
        />
        {activeFilters > 0 && (
          <Btn variant="ghost" small onClick={() => { setFilterDir(""); setFilterStatus(""); setFilterPriority(""); setFilterCategory("") }}>
            Clear filters ({activeFilters})
          </Btn>
        )}
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {visible.length === 0 ? (
          <EmptyState message={search || activeFilters > 0 ? "No tickets match your filters." : "No tickets yet."} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Ticket ID", "Title", "Direction", "Priority", "Status", "Assigned To", "Due Date", "Created"].map(h => (
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
                {visible.map(t => (
                  <TicketRow key={t.id} ticket={t} onClick={id => navigate("ticket", { ticketId: id })} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "right" }}>
        {visible.length} result{visible.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
