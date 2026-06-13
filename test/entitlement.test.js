// Entitlement gate (Phase 3 WS-3): pure state-machine logic (no network) + secret-hygiene grep.
import fs from 'node:fs'; import path from 'node:path';
import { isEntitled, needsRevalidation, stateFromResponse, validateLicence } from '../src/lib/entitlement.js';
let fail = 0; const bad = m => { fail++; console.log('❌', m); };
const NOW = 1_900_000_000_000; const DAY = 864e5;

// locked by default
if (isEntitled(null, NOW)) bad('null state should be locked');
if (isEntitled({}, NOW)) bad('empty state should be locked');
// unlock on a mocked valid annual response
const annual = stateFromResponse('K1', { valid: true, tier: 'annual', expires: NOW + 30 * DAY }, NOW);
if (!annual || !isEntitled(annual, NOW)) bad('valid annual should unlock');
// lifetime: always entitled, never needs revalidation
const life = stateFromResponse('K2', { valid: true, tier: 'lifetime', expires: null }, NOW);
if (!isEntitled(life, NOW + 9999 * DAY)) bad('lifetime should stay entitled');
if (needsRevalidation(life, NOW + 9999 * DAY)) bad('lifetime should never need revalidation');
// invalid / foreign-product (Worker returns valid:false) → no state → locked
if (stateFromResponse('K3', { valid: false }, NOW) !== null) bad('invalid response should yield no state');
if (isEntitled(stateFromResponse('K3', { valid: false }, NOW), NOW)) bad('invalid should be locked');
// expired beyond grace → locked; within offline grace → still unlocked
if (isEntitled({ tier: 'annual', expires: NOW - 10 * DAY, validatedAt: NOW - 11 * DAY }, NOW)) bad('expired past grace should lock');
if (!isEntitled({ tier: 'annual', expires: NOW - 3 * DAY, validatedAt: NOW - 3 * DAY }, NOW)) bad('within grace should stay unlocked');
// revalidation cadence
if (!needsRevalidation({ tier: 'annual', validatedAt: NOW - 2 * DAY }, NOW)) bad('stale annual should need revalidation');
if (needsRevalidation({ tier: 'annual', validatedAt: NOW - 1000 }, NOW)) bad('fresh annual should not need revalidation');
// validateLicence with an injected fetch (no real network)
const mkFetch = (body) => async () => ({ json: async () => body });
const okState = await validateLicence('K9', { fetchImpl: mkFetch({ valid: true, tier: 'lifetime', expires: null }), now: NOW, url: 'https://example.test/v' });
if (!okState || okState.tier !== 'lifetime') bad('validateLicence should map a valid response');
const noState = await validateLicence('K9', { fetchImpl: mkFetch({ valid: false }), now: NOW, url: 'https://example.test/v' });
if (noState !== null) bad('validateLicence should return null on valid:false');
let threw = false; try { await validateLicence('K', { fetchImpl: mkFetch({}), now: NOW, url: '' }); } catch (e) { threw = e.message === 'verifier-not-configured'; }
if (!threw) bad('unconfigured verifier should throw verifier-not-configured');

// SECRET HYGIENE — no Lemon Squeezy token/secret in client source (or the build output, if present)
const walk = (dir) => { const out = []; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) out.push(...walk(p)); else if (/\.(js|jsx|ts|tsx|json|html)$/.test(e.name)) out.push(p); } return out; };
const scan = []; for (const root of ['src', 'dist']) { if (fs.existsSync(root)) scan.push(...walk(root)); }
for (const f of scan) {
  const t = fs.readFileSync(f, 'utf8');
  if (t.includes('LEMONSQUEEZY_API_KEY')) bad(`LS secret name leaked in ${f}`);
  if (/Bearer\s+[A-Za-z0-9._-]{16,}/.test(t)) bad(`bearer token literal in ${f}`);
  if (/eyJ[A-Za-z0-9._-]{20,}\.[A-Za-z0-9._-]{10,}/.test(t)) bad(`JWT-like token in ${f}`);
}
console.log(fail ? `${fail} problem(s)` : `✅ entitlement gate clean — state machine holds (locked default · unlock · expire+grace · lifetime · revalidate); no LS secret in src${fs.existsSync('dist') ? '+dist' : ''}`);
process.exit(fail ? 1 : 0);
