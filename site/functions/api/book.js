// functions/api/book.js
// ══════════════════════════════════════════════════════════════════
// Cloudflare Pages Function — "Schedule a call" notification endpoint
//
// Receives the booking request from the site's scheduler modal and
// emails it to you using Cloudflare Email Service's REST API. Sending
// to a *verified destination address* is free on every Cloudflare
// plan, as long as Email Routing is configured on the sending domain
// — no Workers Paid plan required.
//
// SETUP (one-time, in the Cloudflare dashboard):
//
//   1. Compute → Email Service → Email Sending → Onboard Domain
//      Choose songbirddesign.com (or whichever domain hosts this
//      site). This adds SPF / DKIM / DMARC records automatically.
//
//   2. Email → Email Routing → Destination Addresses
//      Add and verify the inbox you want notifications sent to
//      (this can be any address you own — Gmail, iCloud, etc.).
//
//   3. Profile → API Tokens → Create Token
//      Permission: Account → Email Service → Edit
//      Copy the token — you won't see it again.
//
//   4. Workers & Pages → your Pages project → Settings → Environment
//      Variables → add these as *secrets* (not plain vars):
//        CF_ACCOUNT_ID   your Cloudflare account ID
//        CF_EMAIL_TOKEN  the API token from step 3
//        NOTIFY_TO       the verified address from step 2
//        NOTIFY_FROM     an address on the onboarded domain,
//                        e.g. bookings@songbirddesign.com
//                        (does not need to be a real mailbox)
//
//   5. Redeploy. Test by submitting the scheduler on the live site.
//
// ══════════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const REQUIRED = ['name', 'phone', 'business', 'package', 'requestedTime'];
const MAX_LEN = 300;

function clean(value) {
  return String(value).slice(0, MAX_LEN).replace(/[<>]/g, '').trim();
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body.' }), {
      status: 400, headers: CORS,
    });
  }

  // Honeypot — a real visitor never fills in a field named "website".
  // Bots that auto-fill every input will trip it. Silently pretend
  // success so the bot doesn't learn anything.
  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), { headers: CORS });
  }

  for (const key of REQUIRED) {
    if (!body[key] || !String(body[key]).trim()) {
      return new Response(JSON.stringify({ ok: false, error: `Missing ${key}.` }), {
        status: 400, headers: CORS,
      });
    }
  }

  const safe = {
    name: clean(body.name),
    phone: clean(body.phone),
    business: clean(body.business),
    pkg: clean(body.package),
    requestedTime: clean(body.requestedTime),
  };

  const { CF_ACCOUNT_ID, CF_EMAIL_TOKEN, NOTIFY_TO, NOTIFY_FROM } = context.env;
  if (!CF_ACCOUNT_ID || !CF_EMAIL_TOKEN || !NOTIFY_TO || !NOTIFY_FROM) {
    console.error('Missing Email Service environment variables.');
    return new Response(JSON.stringify({ ok: false, error: 'Notification is not configured yet.' }), {
      status: 500, headers: CORS,
    });
  }

  const text = [
    'New call request from the Song Bird Design site.',
    '',
    `Name:            ${safe.name}`,
    `Phone:           ${safe.phone}`,
    `Business:        ${safe.business}`,
    `Package:         ${safe.pkg}`,
    `Requested time:  ${safe.requestedTime}`,
  ].join('\n');

  const html = `
    <p>New call request from the Song Bird Design site.</p>
    <table cellpadding="4" cellspacing="0">
      <tr><td><strong>Name</strong></td><td>${safe.name}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${safe.phone}</td></tr>
      <tr><td><strong>Business</strong></td><td>${safe.business}</td></tr>
      <tr><td><strong>Package</strong></td><td>${safe.pkg}</td></tr>
      <tr><td><strong>Requested time</strong></td><td>${safe.requestedTime}</td></tr>
    </table>`;

  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_EMAIL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: NOTIFY_TO,
          from: NOTIFY_FROM,
          subject: `New call request — ${safe.name} (${safe.requestedTime})`,
          text,
          html,
        }),
      }
    );

    const result = await resp.json().catch(() => ({}));

    if (!resp.ok || result.success === false) {
      console.error('Email Service send failed:', JSON.stringify(result));
      return new Response(JSON.stringify({ ok: false, error: 'Could not send the notification email.' }), {
        status: 502, headers: CORS,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: CORS });
  } catch (e) {
    console.error('Email Service request threw:', e.message);
    return new Response(JSON.stringify({ ok: false, error: 'Notification service unreachable.' }), {
      status: 502, headers: CORS,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
