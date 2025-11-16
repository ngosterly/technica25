// functions/api/health.js
// Cloudflare Worker: Health check endpoint

/**
 * GET /api/health
 * Response: { status: "ok", timestamp: string }
 */
export async function onRequestGet(context) {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    worker: "cloudflare-pages"
  });
}
