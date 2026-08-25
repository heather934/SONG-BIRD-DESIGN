// functions/api/admin/schedule.js
// Protected by _middleware.js in this folder. Stores two things:
//   blockedSlots  — specific date+time combinations taken off the board
//                   (format: "YYYY-M-D|9:00 AM")
//   closedDates   — whole days off, e.g. holidays (format: "YYYY-M-D")
// Both are layered on top of the scheduler's existing simulated pattern,
// not a replacement for it.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'schedule:blocked';
const MAX_BLOCKED = 500;
const MAX_CLOSED = 100;

function clean(v, max = 40) {
  return String(v ?? '').slice(0, max).replace(/[<>]/g, '').trim();
}

export async function onRequestGet(context) {
  const raw = await context.env.CONTENT.get(KEY);
  return new Response(raw || '{"blockedSlots":[],"closedDates":[]}', { headers: CORS });
}

export async function onRequestPut(context) {
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON.' }), { status: 400, headers: CORS });
  }

  const blockedSlots = Array.isArray(body.blockedSlots) ? body.blockedSlots : [];
  const closedDates = Array.isArray(body.closedDates) ? body.closedDates : [];

  if (blockedSlots.length > MAX_BLOCKED || closedDates.length > MAX_CLOSED) {
    return new Response(JSON.stringify({ ok: false, error: 'Too many entries.' }), { status: 400, headers: CORS });
  }

  const data = {
    blockedSlots: blockedSlots.map((s) => clean(s, 60)).filter(Boolean),
    closedDates: closedDates.map((d) => clean(d, 20)).filter(Boolean),
  };

  await context.env.CONTENT.put(KEY, JSON.stringify(data));
  return new Response(JSON.stringify({ ok: true, ...data }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
