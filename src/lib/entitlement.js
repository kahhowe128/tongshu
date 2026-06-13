// Entitlement / licence state (Phase 3 WS-3). Free features NEVER import this.
// The client only relays a pasted licence key to our Cloudflare Worker, which talks to Lemon Squeezy
// and checks store_id + product_id. NO Lemon Squeezy API token or secret ever lives in client code.
//
// TODO(owner): after `wrangler deploy` (see worker/README.md), set WORKER_URL to your Worker URL.
// TODO(owner): paste your Lemon Squeezy hosted-checkout links (public, safe in client) below.
export const WORKER_URL = ''; // e.g. 'https://tongshu-licence.<your-subdomain>.workers.dev'
export const CHECKOUT = {
  annual: '',   // TODO(owner): Lemon Squeezy checkout URL for 年度 Annual US$8/yr
  lifetime: '', // TODO(owner): Lemon Squeezy checkout URL for 永久 Lifetime US$88 one-off
};

const KEY = 'tongshu.licence.v1';
export const GRACE_MS = 7 * 24 * 3600 * 1000; // offline grace after a subscription's known expiry

export function loadLicence() {
  try { if (typeof localStorage === 'undefined') return null; const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.tier ? s : null; } catch (e) { return null; }
}
export function saveLicence(state) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}
export function clearLicence() {
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY); } catch (e) {}
}

// PURE state machine — given the stored state and the current time, is the user entitled?
// lifetime → always (single-payment, no expiry). subscription → valid until expires + offline grace.
export function isEntitled(state, now, graceMs = GRACE_MS) {
  if (!state || !state.tier) return false;
  if (state.tier === 'lifetime') return true;
  if (state.expires == null) return true;          // non-expiring licence
  return now <= state.expires + graceMs;           // within subscription (+ offline grace)
}

// PURE: should the app re-check with the Worker on load? (don't hammer it every action)
export function needsRevalidation(state, now, everyMs = 24 * 3600 * 1000) {
  if (!state || state.tier === 'lifetime') return false; // lifetime never needs re-check
  if (typeof state.validatedAt !== 'number') return true;
  return now - state.validatedAt >= everyMs;
}

// PURE: turn a Worker response into a stored licence state (or null when invalid/foreign).
// Worker contract: { valid:bool, tier:'annual'|'lifetime', expires:number|null } — store/product
// matching is enforced inside the Worker, so an invalid or foreign-product key arrives as valid:false.
export function stateFromResponse(key, data, now) {
  if (!data || !data.valid || !data.tier) return null;
  return { key, tier: data.tier, expires: data.expires == null ? null : data.expires, validatedAt: now };
}

// IO: POST the key to the Worker. `fetchImpl`/`now` are injectable for tests (no real network there).
export async function validateLicence(key, { fetchImpl, now, url } = {}) {
  const endpoint = url || WORKER_URL;
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const t = typeof now === 'number' ? now : Date.now();
  if (!endpoint || !/^https?:\/\//.test(endpoint)) throw new Error('verifier-not-configured');
  if (!f) throw new Error('no-fetch');
  const res = await f(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: String(key || '').trim() }) });
  const data = await res.json();
  return stateFromResponse(String(key || '').trim(), data, t);
}
