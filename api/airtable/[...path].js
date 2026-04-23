export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) {
    return res.status(500).json({ error: "Missing AIRTABLE_TOKEN on server" })
  }

  const rawPath = req.query.path
  const pathPart = Array.isArray(rawPath) ? rawPath.join("/") : (rawPath || "")
  const cleanedPath = String(pathPart).replace(/^\/+/, "")

  const host = req.headers.host || "localhost"
  const u = new URL(req.url || "/", `https://${host}`)
  u.searchParams.delete("path")

  const targetUrl = `https://api.airtable.com/v0/${cleanedPath}${u.search}`

  const headers = { Authorization: `Bearer ${token}` }

  let body
  if (req.method !== "GET" && req.method !== "HEAD" && req.body != null) {
    headers["Content-Type"] = "application/json"
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body)
  }

  const upstream = await fetch(targetUrl, { method: req.method, headers, body })
  const text = await upstream.text()
  res
    .status(upstream.status)
    .setHeader("Content-Type", upstream.headers.get("content-type") || "application/json")
    .send(text)
}
