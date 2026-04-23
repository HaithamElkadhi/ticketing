import {
  AIRTABLE_CONFIG,
  fromAirtableTicketRecord,
  fromAirtableUserRecord,
  toAirtableTicketFields,
  toAirtableUserFields,
} from "./airtableMapping.js"

function getConfigOrThrow() {
  const baseId = AIRTABLE_CONFIG.baseId
  const ticketTable = AIRTABLE_CONFIG.tables.ticket
  const usersTable = AIRTABLE_CONFIG.tables.users

  if (!baseId || !ticketTable || !usersTable) {
    throw new Error("Missing Airtable env vars. Check base/table IDs in .env.local.")
  }
  return { baseId, ticketTable, usersTable }
}

/** Dev: Vite proxy. Prod: Cloudflare/Vercel function at same path, or set VITE_AIRTABLE_PROXY_URL. */
function getAirtableProxyBase() {
  const raw = import.meta.env.VITE_AIRTABLE_PROXY_URL
  if (raw) return String(raw).replace(/\/$/, "")
  return "/api/airtable"
}

async function airtableRequest(path, options = {}) {
  const base = getAirtableProxyBase()
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable request failed (${response.status}): ${text}`)
  }
  const contentType = response.headers.get("content-type") || ""
  const text = await response.text()
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Airtable proxy returned non-JSON response. Check production API routing for ${base}.`,
    )
  }
  return JSON.parse(text)
}

async function listAllRecords(baseId, tableId) {
  let offset = ""
  const records = []

  do {
    const params = new URLSearchParams({
      pageSize: "100",
      returnFieldsByFieldId: "true",
    })
    if (offset) params.set("offset", offset)

    const data = await airtableRequest(`/${baseId}/${tableId}?${params.toString()}`)
    records.push(...(data.records || []))
    offset = data.offset || ""
  } while (offset)

  return records
}

function isRecordId(value) {
  return typeof value === "string" && value.startsWith("rec")
}

function resolveLinkedUserIds(value, users) {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) return value
  if (value === "") return []
  if (isRecordId(value)) return [value]

  const match = users.find(
    (u) =>
      u.id === value ||
      u.userId === value ||
      u.name === value ||
      u.email === value,
  )
  if (!match) {
    throw new Error(`Could not map user reference "${value}" to Airtable record ID.`)
  }
  return [match.id]
}

async function normalizeTicketWriteInput(ticketInput) {
  const users = await loadUsers()
  return {
    ...ticketInput,
    createdBy: resolveLinkedUserIds(ticketInput.createdBy, users),
    assignedTo: resolveLinkedUserIds(ticketInput.assignedTo, users),
    closedBy: resolveLinkedUserIds(ticketInput.closedBy, users),
  }
}

export async function loadUsers() {
  const { baseId, usersTable } = getConfigOrThrow()
  const records = await listAllRecords(baseId, usersTable)
  return records.map(fromAirtableUserRecord)
}

export async function loadTickets() {
  const { baseId, ticketTable } = getConfigOrThrow()
  const records = await listAllRecords(baseId, ticketTable)
  return records.map(fromAirtableTicketRecord)
}

export async function loginUser(email, password) {
  const users = await loadUsers()
  return users.find((u) => u.email === email && u.password === password && u.status === "Active") || null
}

export async function createTicket(ticketInput) {
  const { baseId, ticketTable } = getConfigOrThrow()
  const normalized = await normalizeTicketWriteInput(ticketInput)
  const payload = {
    records: [{ fields: toAirtableTicketFields(normalized) }],
    returnFieldsByFieldId: true,
  }
  const data = await airtableRequest(`/${baseId}/${ticketTable}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return fromAirtableTicketRecord(data.records[0])
}

export async function updateTicket(recordId, patch) {
  const { baseId, ticketTable } = getConfigOrThrow()
  const normalized = await normalizeTicketWriteInput(patch)
  const payload = {
    fields: toAirtableTicketFields(normalized),
    returnFieldsByFieldId: true,
  }
  const data = await airtableRequest(`/${baseId}/${ticketTable}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  return fromAirtableTicketRecord(data)
}

export async function createUser(userInput) {
  const { baseId, usersTable } = getConfigOrThrow()
  const payload = {
    records: [{ fields: toAirtableUserFields(userInput) }],
    returnFieldsByFieldId: true,
  }
  const data = await airtableRequest(`/${baseId}/${usersTable}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return fromAirtableUserRecord(data.records[0])
}

export async function updateUser(recordId, patch) {
  const { baseId, usersTable } = getConfigOrThrow()
  const payload = {
    fields: toAirtableUserFields(patch),
    returnFieldsByFieldId: true,
  }
  const data = await airtableRequest(`/${baseId}/${usersTable}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  return fromAirtableUserRecord(data)
}
