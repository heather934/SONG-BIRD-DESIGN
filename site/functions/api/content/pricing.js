// functions/api/content/pricing.js
// Public, read-only. Powers the three pricing cards on the site.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'content:pricing';

const DEFAULT_PRICING = [
  {
    id: 'starter-nest',
    name: 'The Starter Nest',
    subtitle: 'One page, done properly',
    amount: '800',
    unit: '',
    featured: false,
    features: [
      'One long page with sections',
      'Contact form and map',
      'Photo editing included',
      '3 revisions',
      'Live in about two weeks',
    ],
    ctaLabel: 'Start here',
  },
  {
    id: 'rebuild',
    name: 'The Rebuild',
    subtitle: "Replace what's not working",
    amount: '1,200',
    unit: '',
    featured: false,
    features: [
      'Speed and mobile fixes',
      'Same links, no lost traffic',
      'Domain and email untangled',
      '3 revisions',
      'You get the keys, in writing',
    ],
    ctaLabel: 'Start the rebuild',
  },
  {
    id: 'full-build',
    name: 'The Full Build',
    subtitle: 'Five to seven pages',
    amount: '1,600',
    unit: '',
    featured: true,
    features: [
      'Services, about, gallery, contact',
      'Copy written with you',
      'Local search setup',
      '3 revisions',
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
