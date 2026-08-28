// functions/api/content/site.js
// Public, read-only. Powers the editable text blocks across index.html,
// process.html, faq.html, and contact.html: hero copy, the three service
// cards, the four process steps, FAQ items, and the contact info block.
// Work samples and pricing have their own endpoints (content/work.js,
// content/pricing.js) since they're structurally different (lists that
// grow/shrink) rather than fixed text blocks.

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const KEY = 'content:site';

const DEFAULT_SITE = {
  hero: {
    eyebrow: 'Website design for small businesses',
    headline1: 'Built by hand,',
    headline2: 'nail by nail.',
    lede: "Song Bird Design makes websites for shops, studios, and trades \u2014 hand-coded, quick to load, and easy for you to keep up. No page builders. No template you've already seen on ten other sites in town.",
    note: 'Flat price agreed before we start. Four weeks from first call to launch. You own every file.',
  },
  services: [
    {
      kicker: 'New site', title: 'A site built from scratch',
      description: 'For businesses starting fresh, or replacing something that never quite worked. Structure, writing, design, and build \u2014 all of it.',
      features: ['Sitemap and page plan', 'Copy written with you', 'Photos edited and sized', 'Google Business Profile set up'],
    },
    {
      kicker: 'Rebuild', title: 'A rescue for a site you have',
      description: "Slow, broken on phones, or you can't reach whoever made it. I rebuild it on ground you control and move everything across.",
      features: ['Speed and mobile fixes', 'Same links, no lost traffic', 'Domain and email untangled', 'You get the keys, in writing'],
    },
    {
      kicker: 'Upkeep', title: 'Someone to keep it running',
      description: "Hosting, backups, small edits, and a person who answers. For owners who'd rather text a change than learn a dashboard.",
      features: ['Hosting and daily backups', 'Text or email your edits', 'Monthly uptime check', 'Cancel any month'],
    },
  ],
  process: [
    { title: 'Talk', description: 'Twenty minutes on the phone about your customers, your competition, and what the site actually has to do for you.', when: 'Day one' },
    { title: 'Plan', description: "You get a page-by-page plan, a written scope, and one flat price. If it's not right, we change it before a line is written.", when: 'Week one' },
    { title: 'Build', description: 'I design in the browser, not in a mockup. You see it live twice and give notes both times, on real pages you can click.', when: 'Weeks two & three' },
    { title: 'Launch', description: 'We go live, I walk you through editing it, and I stay on the hook for thirty days of tweaks at no charge.', when: 'Week four' },
  ],
  faq: [
    { question: "Do I own the site when it's finished?", answer: "Yes, all of it \u2014 the domain, the files, the accounts. It's written into the agreement. If you ever want to move to another designer, you send them a folder and they can pick it up." },
    { question: 'Do I have to write the words myself?', answer: 'No. Most owners hand me a pile of notes and old brochures, we talk for an hour, and I write the first draft. You edit it. You know your trade better than I do, so your voice stays in it.' },
    { question: 'What if I already have a site I hate?', answer: "That's the rebuild. I keep what's earning you traffic \u2014 page addresses, reviews, listings \u2014 and replace everything underneath. Your existing site stays up until the new one is ready to swap in." },
    { question: 'Will I show up on Google?', answer: "The site will be built the way search engines like: fast, readable, properly labeled, with your business details consistent everywhere. That's the foundation. Ranking above an established competitor also takes reviews and time, and I'll tell you honestly where you stand." },
    { question: 'Can I edit it myself later?', answer: "Yes. Text, photos, hours, and prices are set up for you to change without touching code, and I'll record a short video walkthrough for your own site so you're not searching through generic help articles." },
    { question: 'How do payments work?', answer: 'Half to reserve the build slot, half on launch day. No hourly billing and no surprise invoices \u2014 if the scope changes, we agree on the new number first.' },
  ],
  contact: {
    email: 'hello@songbirddesign.com',
    whatsapp: '@songbirdpublishinganddesign',
    hours: 'Monday to Friday, 9\u20135 Eastern',
    takingOn: 'Two builds a month, booking four weeks out',
  },
};

export async function onRequestGet(context) {
  try {
    const raw = await context.env.CONTENT.get(KEY);
    const data = raw ? JSON.parse(raw) : DEFAULT_SITE;
    return new Response(JSON.stringify({ ok: true, site: data }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, site: DEFAULT_SITE }), { headers: CORS });
  }
}
