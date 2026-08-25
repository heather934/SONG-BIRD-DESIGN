// functions/api/content/pricing.js
// Public, read-only. Powers the three pricing cards on the site.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'content:pricing';

const DEFAULT_PRICING = [
  {
    id: 'starter-nest',
    name: 'The Starter Nest',
    subtitle: 'One page, done properly',
    amount: '1,800',
    unit: '',
    featured: false,
    features: [
      'One long page with sections',
      'Contact form and map',
      'Photo editing included',
      'Live in about two weeks',
    ],
    ctaLabel: 'Start here',
  },
  {
    id: 'full-build',
    name: 'The Full Build',
    subtitle: 'Five to seven pages',
    amount: '3,600',
    unit: '',
    featured: true,
    features: [
      'Services, about, gallery, contact',
      'Copy written with you',
      'Local search setup',
      'Two rounds of notes',
      'Thirty days of free tweaks',
    ],
    ctaLabel: 'Schedule a call',
  },
  {
    id: 'care-and-feeding',
    name: 'Care & Feeding',
    subtitle: 'Monthly, cancel anytime',
    amount: '65',
    unit: '/ month',
    featured: false,
    features: [
      'Hosting and daily backups',
      'Up to four edits a month',
      'Security and speed checks',
      'A person who replies',
    ],
    ctaLabel: 'Add it on',
  },
];

export async function onRequestGet(context) {
  try {
    const raw = await context.env.CONTENT.get(KEY);
    const items = raw ? JSON.parse(raw) : DEFAULT_PRICING;
    return new Response(JSON.stringify({ ok: true, items }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, items: DEFAULT_PRICING }), { headers: CORS });
  }
}
