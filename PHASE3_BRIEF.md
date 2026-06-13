# Claude Code brief — Tong Shu Phase 3 (+ housekeeping)

Work on the **current `main`** (live at https://kahhowe128.github.io/tongshu/). Phase 0–2 already
shipped. Read `PHASE3_SPEC.md` in this repo for full detail and per-workstream acceptance. Guardrails
are unchanged and absolute: engine math frozen; exact-vs-graded tags everywhere; nothing fabricated;
omitted items stay omitted; verdicts never definitive; bilingual 中/EN; never colour-only; all gates
green after every commit (`npm test`). Each workstream = its own commit; re-run `npm test` each time.

## JOB 0 — housekeeping (do first, deadline-driven)
1. **Bump CI action versions** — GitHub moves `actions/checkout`, `actions/setup-node`,
   `actions/upload-pages-artifact`/`upload-artifact`, `actions/deploy-pages` onto Node 24 on
   2026-06-16. Bump each to its current major in `.github/workflows/ci.yml`, push, watch the run,
   confirm it stays green. Low risk, ~5 min.
2. The committed `public/guide/tongshu-guide.pdf` may be a pre-Examples copy; CI regenerates it on
   deploy so the live one is correct. Optional: regenerate & commit so the repo file matches. Cosmetic.

## JOB 1 — Phase 3 (five workstreams; see PHASE3_SPEC.md)
Recommended order (lowest risk → highest):
1. **WS-5 Lucky Red theme** — new OKLCH-grounded theme; extend `test/color.test.js` to 4 themes; verify
   AA + verdict distinguishability (incl. CVD); seal ≠ verdict-忌. Self-contained, proves the token
   pipeline still holds. Good first commit.
2. **WS-4 Save/favourite dates** — local-only starring + a Saved view; feeds later export. Free tier.
3. **WS-2 Visual assets** — original SVG icon system (currentColor, themeable, alt text), educational
   diagrams, and one spot illustration per Academy chapter. SVG-first, offline, no copyrighted art.
   If refining art is impractical in-session, scaffold themeable placeholder SVGs with TODO markers —
   never ship external-dependent or broken images.
4. **WS-1 Home page + Academy** — a fast landing surface (new default) routing into Find/Learn/upgrade,
   and a story-driven "学堂/Academy" teaching the basics + terms narratively, authored in
   `docs/source.cjs` as an `ACADEMY` export (flows to app + site + PDF like CASES). Stories may be
   imaginative; facts inside stay attributed/graded. Link chapters to real glossary ids.
5. **WS-3 Monetization** — the only part needing a backend. Tier split (free = whole calculator + all
   learning + saved dates + all themes; paid = rich WhatsApp/email/PDF export *with* an honest,
   factor-derived "why this day / why for your zodiac" explanation). Build:
   - an `entitlement` module + `<Gate>` upgrade-card wrapper (free features never call it),
   - the honest explanation generator (narrates only real computed factors; tags exact/graded; shows
     grades; restates non-definitive; invents nothing),
   - WhatsApp (`wa.me` deep link) + email (`mailto:`) + downloadable card/PDF exports,
   - a `worker/` Cloudflare Worker that validates a Lemon Squeezy licence key (checks store_id +
     product_id match; LS API token is a Worker secret, NEVER in client code) and returns
     {valid, tier, expires}; cache result locally with offline grace.
   - Two LS products: Annual US$8/yr (subscription) and Lifetime US$88 (single-payment, tier='lifetime',
     no expiry — see the spec's note on honouring lifetime keys independent of LS).
   - CI does NOT deploy the Worker; leave a `worker/README.md` with the one-time `wrangler deploy` steps
     and the LS setup checklist for the owner.
   Add `test/entitlement.test.js` (state machine + a grep assertion that no LS token/secret string is in
   `src/` or the build output) and `test/assets.test.js` (SVG titles, currentColor, no external image URLs).

Wire all new gates into the `test` script. Update README + RUNBOOK with: the tier model, the Worker
deploy + Lemon Squeezy setup steps, and the new env/secret names (none of which belong in the client).

## What the owner must do themselves (do NOT attempt for them)
- Create the Lemon Squeezy account + the two products, and copy the store/product/variant IDs + API token.
- `wrangler login` / `wrangler deploy` for the Worker, and set the LS token as a Worker secret.
- Any GitHub auth prompts. (Payments + credentials stay with the human.)
Leave clear TODO markers + a checklist where these IDs/secrets plug in.

When done: push; report the live URL, what each commit changed, and the exact owner-action checklist
(LS products to create, IDs to paste, Worker deploy command).
