// functions/api/admin/work.js
// Protected by _middleware.js in this folder (Cloudflare Access + JWT
// re-verification). GET returns the current list; PUT replaces it wholesale
// — the admin UI sends the full edited array each time, which keeps this
// endpoint simple and avoids partial-update bugs.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'content:work';
const MAX_ITEMS = 24;

function clean(v, max = 400) {
  return String(v ?? '').slice(0, max).replace(/[<>]/g, '').trim();
}

export async function onRequestGet(context) {
  const raw = await context.env.CONTENT.get(KEY);
  return new Response(raw || '[]', { headers: CORS });
}

export async function onRequestPut(context) {
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON.' }), { status: 400, headers: CORS });
  }
  if (!Array.isArray(body)) {
    return new Response(JSON.stringify({ ok: false, error: 'Expected an array of items.' }), { status: 400, headers: CORS });
  }
  if (body.length > MAX_ITEMS) {
    return new Response(JSON.stringify({ ok: false, error: `Too many items (max ${MAX_ITEMS}).` }), { status: 400, headers: CORS });
  }

  const cleaned = body.map((item, i) => ({
    id: clean(item.id || `work-${Date.now()}-${i}`, 80),
    badge: clean(item.badge, 40),
    type: clean(item.type, 120),
    title: clean(item.title, 120),
    description: clean(item.description, 600),
    result: clean(item.result, 160),
    url: clean(item.url, 300),
    gradient: clean(item.gradient, 200) || 'linear-gradient(145deg,#8a9a78,#5c6b45)',
  }));

  await context.env.CONTENT.put(KEY, JSON.stringify(cleaned));
  return new Response(JSON.stringify({ ok: true, items: cleaned }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
