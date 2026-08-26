// functions/api/admin/site.js
// Protected by _middleware.js in this folder. GET returns the current
// content object; PUT replaces it wholesale (the admin UI always sends
// the full edited structure back together, same pattern as work.js and
// pricing.js).

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

const KEY = 'content:site';

function clean(v, max = 800) {
  return String(v ?? '').slice(0, max).replace(/[<>]/g, '').trim();
}
function cleanList(arr, max, fn) {
  return Array.isArray(arr) ? arr.slice(0, max).map(fn) : [];
}

export async function onRequestGet(context) {
  const CORS = corsHeaders(context.request);
  const raw = await context.env.CONTENT.get(KEY);
  return new Response(raw || '{}', { headers: CORS });
}

export async function onRequestPut(context) {
  const CORS = corsHeaders(context.request);
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON.' }), { status: 400, headers: CORS });
  }

  const h = body.hero || {};
  const cleaned = {
    hero: {
      eyebrow: clean(h.eyebrow, 120),
      headline1: clean(h.headline1, 80),
      headline2: clean(h.headline2, 80),
      lede: clean(h.lede, 500),
      note: clean(h.note, 300),
    },
    services: cleanList(body.services, 6, (s) => ({
      kicker: clean(s.kicker, 40),
      title: clean(s.title, 100),
      description: clean(s.description, 400),
      features: cleanList(s.features, 8, (f) => clean(f, 120)).filter(Boolean),
    })),
    process: cleanList(body.process, 8, (s) => ({
      title: clean(s.title, 40),
      description: clean(s.description, 300),
      when: clean(s.when, 60),
    })),
    faq: cleanList(body.faq, 20, (f) => ({
      question: clean(f.question, 200),
      answer: clean(f.answer, 800),
    })).filter((f) => f.question && f.answer),
    contact: {
      email: clean((body.contact || {}).email, 120),
      phone: clean((body.contact || {}).phone, 40),
      hours: clean((body.contact || {}).hours, 120),
      takingOn: clean((body.contact || {}).takingOn, 160),
    },
  };

  await context.env.CONTENT.put(KEY, JSON.stringify(cleaned));
  return new Response(JSON.stringify({ ok: true, site: cleaned }), { headers: CORS });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}
