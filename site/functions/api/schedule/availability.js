// functions/api/schedule/availability.js
// Public, read-only. The scheduler widget already shows a natural mix of
// open/booked slots on its own (a deterministic pattern, not a real
// calendar). This endpoint layers real admin-set blocks on top of that:
// specific slots blocked out, or entire dates closed (holidays, days off).
// It does NOT replace the base pattern — it only adds to it — so the
// scheduler still works even before this is configured.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'schedule:blocked';

const DEFAULT_SCHEDULE = { blockedSlots: [], closedDates: [] };

export async function onRequestGet(context) {
  try {
    const raw = await context.env.CONTENT.get(KEY);
    const data = raw ? JSON.parse(raw) : DEFAULT_SCHEDULE;
    return new Response(JSON.stringify({
      ok: true,
      blockedSlots: Array.isArray(data.blockedSlots) ? data.blockedSlots : [],
      closedDates: Array.isArray(data.closedDates) ? data.closedDates : [],
    }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, ...DEFAULT_SCHEDULE }), { headers: CORS });
  }
}
