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

async function airtableRequest(path, options = {}) {
  const token = AIRTABLE_CONFIG.token
  if (!token) throw new Error("Missing VITE_AIRTABLE_TOKEN. Add it to .env.local and Vercel env vars.")

  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable request failed (${response.status}): ${text}`)
  }
  return response.json()
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
