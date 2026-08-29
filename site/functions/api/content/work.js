// functions/api/content/work.js
// Public, read-only. Powers the "recent builds" grid on the site itself.
// The two pinned cards (Under Pressure, the Riverbend admin demo) are
// hardcoded in the page and are NOT part of this list — this endpoint only
// covers the additional cards the admin panel adds/edits/removes.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'content:work';

const DEFAULT_WORK = [
  {
    id: 'skin-by-kassie',
    badge: 'Live site',
    type: 'Esthetics studio \u00b7 Cabell County, WV',
    title: 'Skin by Kassie',
    description: 'A one-chair studio, so the site is built the same way: facials, waxing and sugaring, lashes and brows, and permanent makeup each get their own page, with a real photo gallery of the actual work. Kassie updates the gallery, testimonials, and copy herself from an admin panel \u2014 new reviews are held for her to approve before they go live.',
    result: 'Just launched \u2014 live and taking bookings',
    url: 'https://skinbykassie.com',
    gradient: 'linear-gradient(145deg,#9a7c8a,#5c3f4a)',
    image: 'assets/work-skinbykassie.webp',
  },
];

export async function onRequestGet(context) {
  try {
    const raw = await context.env.CONTENT.get(KEY);
    const items = raw ? JSON.parse(raw) : DEFAULT_WORK;
    return new Response(JSON.stringify({ ok: true, items }), { headers: CORS });
  } catch (e) {
    // KV not bound yet, or bad data — fall back rather than break the site.
    return new Response(JSON.stringify({ ok: true, items: DEFAULT_WORK }), { headers: CORS });
  }
}
