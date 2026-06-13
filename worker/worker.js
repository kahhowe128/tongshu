// Tong Shu licence verifier — Cloudflare Worker (Phase 3 WS-3).
// The ONLY server in the project. Stateless: it relays a pasted licence key to Lemon Squeezy,
// confirms the key belongs to THIS store + one of THIS app's products, and returns {valid,tier,expires}.
// The Lemon Squeezy API token lives ONLY as a Worker secret (env.LEMONSQUEEZY_API_KEY) — never shipped
// to the browser. No user database, no PII; this barely changes the app's privacy posture.
//
// Owner setup: see worker/README.md (wrangler deploy + `wrangler secret put LEMONSQUEEZY_API_KEY`).

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
});
const json = (obj, origin, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors(origin) } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'POST') return json({ valid: false, error: 'method' }, origin, 405);

    let key = '';
    try { key = String((await request.json()).key || '').trim(); } catch (e) { return json({ valid: false, error: 'bad-request' }, origin, 400); }
    if (!key) return json({ valid: false, error: 'no-key' }, origin, 400);
    if (!env.LEMONSQUEEZY_API_KEY) return json({ valid: false, error: 'verifier-misconfigured' }, origin, 500);

    let d;
    try {
      const r = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`, Accept: 'application/vnd.api+json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'license_key=' + encodeURIComponent(key),
      });
      d = await r.json();
    } catch (e) { return json({ valid: false, error: 'upstream' }, origin, 502); }

    // enforce that the key is for THIS store and one of THIS app's products (blocks foreign keys)
    const meta = d && d.meta || {};
    const storeOk = String(meta.store_id) === String(env.EXPECTED_STORE_ID);
    const annual = String(env.ANNUAL_PRODUCT_ID), lifetime = String(env.LIFETIME_PRODUCT_ID);
    const productOk = [annual, lifetime].includes(String(meta.product_id));
    if (!d || !d.valid || !storeOk || !productOk) return json({ valid: false }, origin);

    const tier = String(meta.product_id) === lifetime ? 'lifetime' : 'annual';
    const exp = (tier !== 'lifetime' && d.license_key && d.license_key.expires_at) ? Date.parse(d.license_key.expires_at) : null;
    return json({ valid: true, tier, expires: Number.isFinite(exp) ? exp : null }, origin);
  },
};
