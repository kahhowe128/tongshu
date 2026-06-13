# RUNBOOK — from this folder to a live URL

## 0) First boot (your machine or Claude Code; ~5 min)
```bash
npm ci
npm test            # expect: engine 22/22 · color ALL PASS ×3 · docs lint clean · SSR 4/4
npm run dev         # open the printed localhost URL; check Find / Learn / Tools, theme toggle, ⓘ→glossary
npm run build && npm run preview   # production sanity
```
Everything except `npm ci`/`vite build`/SSR was already executed and verified in the build
sandbox (no network there); the four SSR states were proven byte-identical to the validated
single-file artifact.

## 1) GitHub
```bash
git init && git add -A && git commit -m "Phase 0: engine split, PWA, gates"
gh repo create tongshu --public --source . --push   # or create on github.com and push
```
CI runs the four gates + builds + prints the PDF on every push.

## 2) Pick ONE host (all free for this)
**A. GitHub Pages (zero extra accounts).** Repo → Settings → Pages → Source: **GitHub Actions**.
The included workflow already uploads `dist/` and deploys on pushes to `main`.
**B. Render (you already use it).** Dashboard → New → Static Site → pick the repo; `render.yaml`
preconfigures build (`npm ci && npm run docs && npm run build`) and publish dir (`dist`).
**C. Cloudflare Pages.** Dashboard → Pages → connect repo; build command
`npm ci && npm run docs && npm run build`, output `dist`.

The build uses relative paths (`base: './'`), so it works at any URL/subpath unchanged.

## 3) After first deploy — 10-minute checklist
- Open on your phone → browser menu → **Add to Home Screen** → relaunch → airplane mode → it still works (PWA + offline).
- Visit `/guide/` (user guide page) and `/guide/tongshu-guide.pdf` (download).
- Lighthouse (Chrome DevTools) → PWA installable ✓, a11y ≥ 95 expected.
- Share-link round-trip: change settings, copy link, open in private window.

## 4) Optional: custom domain (~US$12/yr)
Buy at any registrar → add domain in your host's dashboard → set the DNS records it shows
(CNAME for Pages/Render/CF). HTTPS is automatic on all three.

## 5) Phase 1 — app stores (only when you want them; web/PWA already covers all browsers incl. Huawei)
```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
npm run build
npx cap add android && npx cap add ios     # capacitor.config.ts is already here
npx cap sync && npx cap open android       # builds in Android Studio / Xcode
```
- Google Play / App Store: developer accounts (US$25 once / US$99-yr), store listings, screenshots.
- **Huawei AppGallery**: same Android APK/AAB, no GMS dependency in this app.
- **HarmonyOS NEXT**: no Capacitor target — ship the PWA or an ArkWeb WebView shell (documented limitation).
- **Compliance before any China-facing listing (Part 4 Phase 2):** position strictly as
  传统文化／民俗历法 reference & calculator; keep the non-definitive disclaimer prominent; no
  guaranteed-outcome or fortune-telling language; anti-superstition (封建迷信) review applies —
  get local policy review first. Privacy declaration is simple and true: collects nothing, offline.

## 6) Phase 3 — paid export verifier (Lemon Squeezy + a Cloudflare Worker)
The free app needs no server. Only the **paid export/explanation** is gated, and that needs one tiny
verifier. Full checklist + secret/var names are in [`worker/README.md`](worker/README.md); in brief:
1. Lemon Squeezy: create the store + two products — **Annual US$8/yr** (subscription) and **Lifetime
   US$88** (single-payment) — and enable **license keys** on both. Note the store ID, both product IDs,
   and create an **API token**.
2. Put the non-secret IDs in `worker/wrangler.toml` `[vars]`; then:
   ```bash
   cd worker
   wrangler login
   wrangler secret put LEMONSQUEEZY_API_KEY   # token stays a secret — never committed
   wrangler deploy                            # copy the printed Worker URL
   ```
3. In `src/lib/entitlement.js` set `WORKER_URL` (the Worker URL) and `CHECKOUT.annual` / `CHECKOUT.lifetime`
   (your LS hosted-checkout links). Commit + push → CI redeploys Pages.
4. Test (LS test mode): paste a test key in **Settings → 升级 / Upgrade** → export unlocks; a foreign-product
   key is rejected; the LS token never appears in the client bundle (`test/entitlement.test.js` enforces this).
- **Names/secrets:** `LEMONSQUEEZY_API_KEY` (Worker secret, never commit); `EXPECTED_STORE_ID`,
  `ANNUAL_PRODUCT_ID`, `LIFETIME_PRODUCT_ID` (Worker `[vars]`); `WORKER_URL`, `CHECKOUT.*` (app, public).
- **Payments & credentials stay with the human** — do not put any token in the repo.

## What was NOT run in the build sandbox (no network) — your first `npm ci && npm test && npm run build` covers it
- dependency install, the Vite production build, the esbuild SSR test path, Capacitor.

## Where things live
- App engine/UI/tokens/docs: see README structure map.
- The legacy single-file artifact (claude.ai publishable) remains valid and unchanged.
