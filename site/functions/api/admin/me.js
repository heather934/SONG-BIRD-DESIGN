// functions/api/admin/me.js
// Protected by _middleware.js in this folder. Lets the admin UI confirm
// who's signed in and show it, rather than the page silently assuming.

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ ok: true, email: context.data.adminEmail }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
