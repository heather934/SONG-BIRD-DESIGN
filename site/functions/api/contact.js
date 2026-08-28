// functions/api/contact.js
// Cloudflare Pages Function — Contact page enquiry form notification
// endpoint. Same pattern as functions/api/book.js: emails the message
// to you via Cloudflare Email Service using the same env vars already
// configured for that endpoint (CF_ACCOUNT_ID, CF_EMAIL_TOKEN,
// NOTIFY_TO, NOTIFY_FROM).

const ALLOWED_ORIGINS = new Set([
  'https://songbirdpublishdesigns.com',
  'https://www.songbirdpublishdesigns.com',
]);

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://songbirdpublishdesigns.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

const REQUIRED = ['name', 'email', 'message'];
const MAX_LEN = 2000;

function clean(value, max = MAX_LEN) {
  return String(value).slice(0, max).replace(/[<>]/g, '').trim();
}

// Same per-IP rate limit as /api/book, tracked separately so bursts on
// one endpoint don't affect the other.
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

async function isRateLimited(env, ip) {
  if (!ip) return false;
  const key = `ratelimit:contact:${ip}`;
  const raw = await env.CONTENT.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return true;
  await env.CONTENT.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return false;
}

export async function onRequestPost(context) {
  const CORS = corsHeaders(context.request);

  const ip = context.request.headers.get('CF-Connecting-IP');
  if (await isRateLimited(context.env, ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'Too many requests. Please try again later.' }), {
      status: 429, headers: CORS,
    });
  }

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body.' }), {
      status: 400, headers: CORS,
    });
  }

  // Honeypot — a real visitor never fills in a field named "website".
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
    name: clean(body.name, 120),
    business: clean(body.business, 120),
    email: clean(body.email, 200),
    need: clean(body.need, 120),
    message: clean(body.message, MAX_LEN),
  };

  const { CF_ACCOUNT_ID, CF_EMAIL_TOKEN, NOTIFY_TO, NOTIFY_FROM } = context.env;
  if (!CF_ACCOUNT_ID || !CF_EMAIL_TOKEN || !NOTIFY_TO || !NOTIFY_FROM) {
    console.error('Missing Email Service environment variables.');
    return new Response(JSON.stringify({ ok: false, error: 'Notification is not configured yet.' }), {
      status: 500, headers: CORS,
    });
  }

  const text = [
    'New contact form message from the Song Bird Design site.',
    '',
    `Name:      ${safe.name}`,
    `Business:  ${safe.business || '(not given)'}`,
    `Email:     ${safe.email}`,
    `Needs:     ${safe.need || '(not given)'}`,
    '',
    safe.message,
  ].join('\n');

  const html = `
    <p>New contact form message from the Song Bird Design site.</p>
    <table cellpadding="4" cellspacing="0">
      <tr><td><strong>Name</strong></td><td>${safe.name}</td></tr>
      <tr><td><strong>Business</strong></td><td>${safe.business || '(not given)'}</td></tr>
      <tr><td><strong>Email</strong></td><td>${safe.email}</td></tr>
      <tr><td><strong>Needs</strong></td><td>${safe.need || '(not given)'}</td></tr>
    </table>
    <p><strong>Message</strong></p>
    <p>${safe.message.replace(/\n/g, '<br>')}</p>`;

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
          subject: `New contact form message — ${safe.name}`,
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

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}
