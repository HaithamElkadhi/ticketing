/**
 * Cloudflare Pages middleware: proxies /api/airtable/* → Airtable REST API.
 * Set secret AIRTABLE_TOKEN in Cloudflare (Settings → Environment variables).
 * Add public/_redirects for SPA (/* → /index.html).
 */
export async function onRequest(context) {
  const { request, next, env } = context
  const url = new URL(request.url)

  if (!url.pathname.startsWith("/api/airtable")) {
    return next()
  }

  const token = env.AIRTABLE_TOKEN
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing AIRTABLE_TOKEN on server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const stripped = url.pathname.replace(/^\/api\/airtable\/?/, "")
  const targetUrl = `https://api.airtable.com/v0/${stripped}${url.search}`

  const headers = { Authorization: `Bearer ${token}` }
  const init = {
    method: request.method,
    headers: { ...headers },
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text()
    if (body) {
      init.headers["Content-Type"] = "application/json"
      init.body = body
    }
  }

  const upstream = await fetch(targetUrl, init)
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json",
    },
  })
}
