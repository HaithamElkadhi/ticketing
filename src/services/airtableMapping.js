const env = import.meta.env || {}

export const AIRTABLE_CONFIG = {
  baseId: env.VITE_AIRTABLE_BASE_ID || "",
  tables: {
    ticket: env.VITE_AIRTABLE_TABLE_TICKET || "",
    users: env.VITE_AIRTABLE_TABLE_USERS || "",
  },
  token: env.VITE_AIRTABLE_TOKEN || "",
}

export const AIRTABLE_FIELDS = {
  ticket: {
    title: "fldLCvZLiCqhDG8a4",
    description: "fld6wkEUmo534FcIp",
    direction: "fldFZ605J5uWruCtI",
    category: "fld2M4fSDbOZ2PLXY",
    priority: "fldTUSFT3szE3ebLt",
    status: "fldt3pnO6eNgnRGoR",
    created_by: "fld83BJ74wDq9mhvT",
    assigned_to: "fldNTSt8Z2QtQP4qj",
    linked_prospect: "fldoDaN1l3FeXXITA",
    comments: "fldstwegSKnkF3zsp",
    due_date: "fldnAzlATIjB0pRnV",
    resolution_note: "fldagXxxXRwHrmKDP",
    closed_by: "fldwKaZP4zdMvF4Ds",
    ticket_id: "fldtBtZi5lgj5mh6Q",
    created_at: "fldOqkBVQOLnJqwnf",
    last_modified: "fldI3RvDFdmYns9FH",
  },
  users: {
    user_id: "fldUXC6MZMXuO9wwD",
    name: "fldVl5HtFYW7w8iWu",
    email: "fldAOAyqrOwDrRChy",
    password_: "fldphPYQIcjQOnJAJ",
    role: "fldukPvnMD4F6Y7SB",
    status: "fldakKI8O6p0xQsvK",
    created_at: "fldQ6RG55l465g8Y1",
    added_by: "fldxIaBFJAFdc37WF",
  },
}

function fieldValue(recordFields, group, key) {
  const fieldId = AIRTABLE_FIELDS[group][key]
  if (!recordFields) return undefined
  if (recordFields[fieldId] !== undefined) return recordFields[fieldId]
  return recordFields[key]
}

function normalizeCell(value) {
  if (Array.isArray(value)) return value[0] || ""
  return value ?? ""
}

function compactObject(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined))
}

export function toAirtableTicketFields(ticket) {
  const f = AIRTABLE_FIELDS.ticket
  return compactObject({
    [f.title]: ticket.title,
    [f.description]: ticket.description,
    [f.direction]: ticket.direction,
    [f.category]: ticket.category,
    [f.priority]: ticket.priority,
    [f.status]: ticket.status,
    [f.created_by]: ticket.createdBy,
    [f.assigned_to]: ticket.assignedTo,
    [f.linked_prospect]: ticket.linkedProspect,
    [f.comments]: ticket.comments,
    [f.due_date]: ticket.dueDate,
    [f.resolution_note]: ticket.resolutionNote,
    [f.closed_by]: ticket.closedBy,
    [f.ticket_id]: ticket.ticketId,
    [f.created_at]: ticket.createdAt,
    [f.last_modified]: ticket.lastModified,
  })
}

export function fromAirtableTicketRecord(record) {
  const fields = record?.fields || {}
  return {
    id: record.id,
    title: normalizeCell(fieldValue(fields, "ticket", "title")),
    description: normalizeCell(fieldValue(fields, "ticket", "description")),
    direction: normalizeCell(fieldValue(fields, "ticket", "direction")),
    category: normalizeCell(fieldValue(fields, "ticket", "category")),
    priority: normalizeCell(fieldValue(fields, "ticket", "priority")),
    status: normalizeCell(fieldValue(fields, "ticket", "status")),
    createdBy: normalizeCell(fieldValue(fields, "ticket", "created_by")),
    assignedTo: normalizeCell(fieldValue(fields, "ticket", "assigned_to")),
    linkedProspect: normalizeCell(fieldValue(fields, "ticket", "linked_prospect")),
    comments: normalizeCell(fieldValue(fields, "ticket", "comments")),
    dueDate: normalizeCell(fieldValue(fields, "ticket", "due_date")),
    resolutionNote: normalizeCell(fieldValue(fields, "ticket", "resolution_note")),
    closedBy: normalizeCell(fieldValue(fields, "ticket", "closed_by")),
    ticketId: normalizeCell(fieldValue(fields, "ticket", "ticket_id")),
    createdAt: normalizeCell(fieldValue(fields, "ticket", "created_at")) || record.createdTime || "",
    lastModified: normalizeCell(fieldValue(fields, "ticket", "last_modified")) || record.createdTime || "",
  }
}

export function toAirtableUserFields(user) {
  const f = AIRTABLE_FIELDS.users
  return compactObject({
    [f.user_id]: user.userId || user.id,
    [f.name]: user.name,
    [f.email]: user.email,
    [f.password_]: user.password,
    [f.role]: user.role,
    [f.status]: user.status,
    [f.created_at]: user.createdAt,
    [f.added_by]: user.addedBy,
  })
}

export function fromAirtableUserRecord(record) {
  const fields = record?.fields || {}
  const userId = normalizeCell(fieldValue(fields, "users", "user_id"))
  return {
    id: record.id,
    userId,
    name: normalizeCell(fieldValue(fields, "users", "name")),
    email: normalizeCell(fieldValue(fields, "users", "email")),
    password: normalizeCell(fieldValue(fields, "users", "password_")),
    role: normalizeCell(fieldValue(fields, "users", "role")),
    status: normalizeCell(fieldValue(fields, "users", "status")),
    createdAt: normalizeCell(fieldValue(fields, "users", "created_at")) || record.createdTime || "",
    addedBy: normalizeCell(fieldValue(fields, "users", "added_by")),
  }
}
