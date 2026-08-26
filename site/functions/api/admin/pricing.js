// functions/api/admin/pricing.js
// Protected by _middleware.js in this folder. Same replace-the-whole-array
// pattern as work.js — the admin UI always sends all three (or however
// many) tiers back together.

const ALLOWED_ORIGINS = new Set([
  'https://songbirdpublishdesigns.com',
  'https://www.songbirdpublishdesigns.com',
]);

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://songbirdpublishdesigns.com',
    'Content-Type': 'application/json',
  };
}

const KEY = 'content:pricing';
const MAX_ITEMS = 6;

function clean(v, max = 300) {
  return String(v ?? '').slice(0, max).replace(/[<>]/g, '').trim();
}

export async function onRequestGet(context) {
  const CORS = corsHeaders(context.request);
  const raw = await context.env.CONTENT.get(KEY);
  return new Response(raw || '[]', { headers: CORS });
}

export async function onRequestPut(context) {
  const CORS = corsHeaders(context.request);
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON.' }), { status: 400, headers: CORS });
  }
  if (!Array.isArray(body)) {
    return new Response(JSON.stringify({ ok: false, error: 'Expected an array of tiers.' }), { status: 400, headers: CORS });
  }
  if (body.length > MAX_ITEMS) {
    return new Response(JSON.stringify({ ok: false, error: `Too many tiers (max ${MAX_ITEMS}).` }), { status: 400, headers: CORS });
  }

  const cleaned = body.map((tier, i) => ({
    id: clean(tier.id || `tier-${Date.now()}-${i}`, 80),
    name: clean(tier.name, 80),
    subtitle: clean(tier.subtitle, 120),
    amount: clean(tier.amount, 20),
    unit: clean(tier.unit, 30),
    featured: !!tier.featured,
    ctaLabel: clean(tier.ctaLabel, 40) || 'Schedule a call',
    features: Array.isArray(tier.features)
      ? tier.features.slice(0, 10).map((f) => clean(f, 160)).filter(Boolean)
      : [],
  }));

  await context.env.CONTENT.put(KEY, JSON.stringify(cleaned));
  return new Response(JSON.stringify({ ok: true, items: cleaned }), { headers: CORS });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}
