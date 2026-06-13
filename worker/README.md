# Tong Shu licence verifier (Cloudflare Worker)

The one small server the app needs: it validates a pasted Lemon Squeezy (LS) **licence key**, confirms it
belongs to *this* store and one of *this* app's two products, and returns `{ valid, tier, expires }`.
The LS API token lives only as a **Worker secret** — it is never in client code or in this repo.
CI does **not** deploy this; the owner runs `wrangler deploy` once (and again if `worker.js` changes).

## Tier model (matches the app)
- **Free** (no key, fully offline): the whole calculator, calendar, day sheets, all Learn/Academy/Examples,
  saved dates, every theme. Free features never call this Worker.
- **Paid** (valid key): rich WhatsApp / email / card·PDF export **with** the honest factor-derived
  "why this day / for your zodiac" explanation.

## Two Lemon Squeezy products to create (owner)
1. **年度 Annual — US$8/yr** — a *subscription* product; enable **license keys**. The key auto-expires when the
   subscription lapses (the Worker then returns `valid:false`, and the app re-locks on its next check).
2. **永久 Lifetime — US$88** — a *single-payment* product; enable **license keys**. The Worker returns
   `tier:'lifetime'` with **no expiry**, so it keeps working independent of any subscription tooling.
   > If LS is ever dropped, lifetime keys must still be honoured — keep an offline allowlist/fallback plan.

## One-time deploy (owner)
1. Create the LS account + store and the two products above; turn on license keys for each.
2. Collect, from LS: the **store ID**, both **product IDs**, and an **API token** (Settings → API).
3. Put the non-secret IDs in `wrangler.toml` `[vars]` (replace the `TODO_*` values):
   `EXPECTED_STORE_ID`, `ANNUAL_PRODUCT_ID`, `LIFETIME_PRODUCT_ID`.
4. Install + log in: `npm i -g wrangler` (or use `npx wrangler`), then `wrangler login`.
5. Set the secret (never committed):
   ```
   wrangler secret put LEMONSQUEEZY_API_KEY
   ```
6. Deploy and copy the URL it prints:
   ```
   cd worker && wrangler deploy
   ```
7. Back in the app, edit `src/lib/entitlement.js`:
   - set `WORKER_URL` to the deployed Worker URL;
   - set `CHECKOUT.annual` and `CHECKOUT.lifetime` to your LS hosted-checkout links.
   Then rebuild + redeploy the site (push to `main`; CI deploys Pages).

## Verify (owner)
- LS **test mode**: make a test licence key, paste it in the app under **设置 / Settings → 升级 / Upgrade** → it unlocks export.
- A key from a different product/store is **rejected** (the Worker checks store_id + product_id).
- The LS token never appears in the client bundle (`test/entitlement.test.js` greps `src/` and `dist/` to prove it).

## Secret / var names
| name | where | secret? |
| --- | --- | --- |
| `LEMONSQUEEZY_API_KEY` | Worker (`wrangler secret put`) | **YES — never commit** |
| `EXPECTED_STORE_ID` | Worker `[vars]` | no |
| `ANNUAL_PRODUCT_ID` | Worker `[vars]` | no |
| `LIFETIME_PRODUCT_ID` | Worker `[vars]` | no |
| `WORKER_URL`, `CHECKOUT.*` | app `src/lib/entitlement.js` | no (public) |
