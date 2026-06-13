# Tong Shu — Phase 3 spec (for Claude Code)

Builds on the **current `main`** (Phase 0–2 already shipped & live: engine split, PWA, CI, calendar
heat-strip, hour three-state `hourClass`, `CATEGORY_TABS` activity split, Examples in docs single
source). Do NOT assume any file's contents from older zips — read the live repo and extend it.

**Prime directives unchanged:** engine math is frozen; every datum tagged exact (computed) vs graded
(tradition); nothing fabricated; omitted items stay omitted; verdicts never definitive; bilingual
中/EN throughout; never colour-only (icon/label always present); all existing gates stay green
(`npm test`: engine 22/22, color AA ×3, docs↔engine lint, SSR, hours).

This phase has FIVE workstreams. They are independent — ship each behind its own commit and keep CI
green after each. **Read the "honest architecture notes" at the bottom before starting payments.**

---

## WS-1 — Marketing home page + creative "learn fengshui" story pages

### 1a. Home / landing page
Add a real landing surface (route `/` if you introduce routing; otherwise a `home` tab that is the
new default, with the current Find becoming its own tab). Purpose: explain the app to a newcomer in
10 seconds, establish trust, route them into Find or Learn, and surface the upgrade.
Contents (all bilingual, authored where possible in the docs single source so it can't drift):
- Hero: the seal motif, one-line value prop ("传统通书择日，算得准、说得明白 / The Chinese almanac,
  computed exactly and explained honestly"), a primary "选个吉日 / Find a date" button, secondary
  "学习 / Learn" button.
- Three trust pills linking to proof: "历法精确可验证 / Verifiable astronomy" → Accuracy tool;
  "传统如实分级 / Traditions, honestly graded" → a Learn anchor; "离线·不收集数据 / Offline, private".
- A compact "what you get free vs 升级 upgrade" strip (see WS-4) — not pushy, just clear.
- Footer: links to Learn, Examples, the guide PDF, About, and the disclaimer line.
Keep it light and fast; no heavy hero images that hurt load. Use the visual assets from WS-2.

### 1b. "Learn fengshui the fun way" — story-driven lessons
A new **学堂 / Academy** area (section in Learn tab, or its own route) that teaches the basics and
every technical term through a **narrative, story-like progression** — creative and friendly, not a
dry glossary dump. This is additive to the existing factual glossary (which stays as the reference).

Design the Academy as a small set of illustrated "chapters", each a short story that introduces
concepts in context, then links to the precise glossary entries for depth. Suggested arc (mirror the
existing `HIST` five-part history but make it character-led and playful):
1. **抬头看天 / Looking up at the sky** — a farmer character tracks sun & moon; introduces 节气, 朔,
   冬至 as the year's anchor. (Tie to glossary: jieqi, shuo, zhongqi.)
2. **太阳和月亮的约定 / The sun and moon's bargain** — why months drift and why 闰月 exists, told as
   the two "negotiating"; one worked 闰月 diagram. (runyue, nongli.)
3. **六十个名字的轮盘 / The wheel of sixty names** — 干支 as an ancient naming game; the unbroken
   day-count. (ganzhi, tiangan, dizhi, shengxiao.)
4. **黄道吉日是怎么挑的 / How a lucky day gets chosen** — a friendly "court of twelve officers"
   (建除) and the yellow/black-path gods; how a day earns a verdict. (jianchu, huangdao, ershibasu.)
5. **神煞：吉神与凶煞 / Spirits, good and ill** — what 神煞 are, why almanacs disagree, why this app
   grades them H/M and omits the shaky ones — i.e. teach the honesty principle itself. (ss, grade.)
6. **轮到你了 / Your turn** — ties back to a worked Example (reuse a CASES entry).

**Integrity for the Academy:** stories may be vivid, but any factual claim follows the same rule —
attribute traditions as traditions, "versions differ" where they differ, cite classical sources by
name (《协纪辨方书》, 《淮南子》, GB/T 33661-2017). The narrative framing is allowed to be imaginative;
the facts inside it are not. End each chapter with "想深入？ / Go deeper" links to glossary ids.

**Author the Academy content in the docs single source** (`docs/source.cjs`) as an `ACADEMY` export
(chapters with id/title/story[zh,en]/figure(ref to an asset)/glossaryLinks[]), flowing to the in-app
Academy + the website + (optionally) the PDF, exactly like CASES. Extend the docs lint to validate it.

---

## WS-2 — Images, diagrams, icons, illustrations

The app is currently emoji-only. Add a coherent **illustration + icon system**, SVG-first (sharp,
tiny, themeable, offline). Do NOT pull in copyrighted art, brand logos, mascots, or stock photos.
Create original SVGs (geometric/woodblock-almanac aesthetic that matches the seal motif).

Deliver:
- **Icon set (functional):** consistent stroke SVGs for the activity categories (健康/婚嫁/居家/
  事业/出行/祭祀/农事/杂事/凶事), the tabs (home/find/learn/tools/academy), verdict glyphs, and
  actions (share, export, save/favourite, calendar, settings). One sprite or a small React icon
  component; sizes 20/24. Must inherit `currentColor` so themes (incl. WS-5 red) recolour them.
- **Diagrams (educational, for the Academy + guide):** the no-中气 leap-month worked example, the
  60-甲子 wheel, the 二十八宿⇄七曜 ring, a sample annotated day-page, the 建除 twelve-officer cycle,
  a 五行 generating/overcoming pentagram. Author as inline SVG components so they theme and print.
- **Spot illustrations / "cartoons" (Academy chapters):** one friendly original line-illustration per
  chapter (the farmer, the sun-and-moon "bargain", the officers' court, etc.). Keep them simple,
  monochrome-or-two-tone using theme tokens so they work in light/dark/contrast/red. No realistic
  human likenesses, no copyrighted characters.

Constraints: keep total asset weight small (SVG, not PNG, wherever possible — the existing PWA icons
are the only rasters). Everything must render offline (no external image CDNs). Add a colour-contrast
check note for any text-bearing diagram. Provide alt text / `<title>` on every SVG for a11y.

If asset generation is impractical inside the coding session, scaffold the components with clean,
placeholder geometric SVGs that already theme correctly, and leave a `// TODO: refine illustration`
marker — never ship a broken or external-dependent image.

---

## WS-3 — Free vs paid features (the actual gating)

### Tier definition
**Free (no key, fully offline):**
- The whole Find experience: activities, range, list + calendar heat-strip, day sheet with verdict,
  spirits, calendar layers, directions, the hour three-state grid.
- All Learn / Academy / glossary / Examples / history content + the guide PDF.
- 28-mansion calibration, Accuracy tool, self-test.
- **Save / favourite dates** (local only — see WS-4). Basic share link (the existing URL hash).
- All themes including the new red one (WS-5). Settings.

**Paid (requires a valid licence):**
- **Rich export with explanation:** export a chosen day (or a saved set) to **WhatsApp**, **email**,
  and a **downloadable card/PDF**, each containing a *detailed plain-language explanation* of *why*
  the day reads the way it does for the selected activity and/or the user's zodiac — i.e. a generated
  narrative assembled from the day's real factors (建除 base, 黄黑道, 宿, each scored 神煞 with grade,
  解神 reductions, clash/zodiac interaction, best 吉时). This is the headline paid value.
- **Personalised "why this day for your zodiac" report** built from the existing BaZi/clash engine
  output, with the loud non-definitive caveat.
- (Optional, if cheap to add) **iCal/.ics export of saved favourites**, **multi-day comparison export**.

The explanation generator must be **honest**: it only narrates factors the engine actually computed,
tags exact vs graded, shows confidence grades, restates non-definitiveness, and never invents a reason.
It's a templated natural-language rendering of real factor data — not a fortune.

### Gating mechanics (client side)
- A single `entitlement` module exposes `isPaid()` and the licence state. Free features never check it.
- Paid actions are wrapped by a `<Gate>` component: if not paid, show an inline upgrade card (price,
  what you unlock, "升级 / Upgrade" → checkout) instead of executing.
- The licence key (when validated) is stored locally (localStorage) like settings; revalidate on load
  with a cached grace period so the app still works offline after first validation.
- **Do not hard-fail offline:** if previously validated and within grace, treat as paid even with no
  network. If never validated, paid features stay locked.

### Verification (the part that needs a backend)
- Use **Lemon Squeezy** (merchant-of-record: handles tax/VAT/GST + compliance globally, important for
  a Singapore seller selling worldwide) with **license keys**.
- Two products/variants: **年度 Annual — US$8/yr** (subscription; key tied to subscription lifecycle,
  auto-expires on lapse) and **永久 Lifetime — US$88 one-off** (single-payment licence; see note below).
- A tiny **Cloudflare Worker** (free tier) is the verifier: the app POSTs the pasted key to the Worker;
  the Worker calls Lemon Squeezy's `/v1/licenses/validate`, checks the returned `store_id` + `product_id`
  match the hard-coded expected IDs (so a key from another product can't unlock this app), and returns
  {valid, tier, expires}. The Worker holds the LS API token as a secret — never put it in client code.
  Worker source lives in the repo under `worker/` with its own README + `wrangler.toml`; CI does NOT
  deploy it (separate `wrangler deploy` step the owner runs once).
- Cache the positive result in localStorage with an expiry; re-validate periodically, not every action.

**Acceptance:** free tier works with zero network and zero key; paid actions show the upgrade card
when locked; a valid key (from the LS test mode) unlocks them; an invalid/foreign-product key is
rejected; the LS API token never appears in any client bundle (grep the build output to prove it);
offline-after-activation still works within grace.

---

## WS-4 — Save / favourite dates (free tier, storage)
- Let users star a day (from the list, calendar, or day sheet). Saved dates persist locally
  (localStorage, same privacy posture — nothing transmitted) under a versioned key.
- A "收藏 / Saved" view lists them with verdict + quick reasons; tap reopens the day sheet; unstar removes.
- Saved set is the input to the paid multi-day export (WS-3) and optional .ics.
- This is the one genuinely-free storage feature; keep it simple and private. No accounts.

**Acceptance:** star/unstar works from all three surfaces; saved list survives reload; clearing is possible;
no network calls; works offline.

---

## WS-5 — Lucky red theme
Add a **红运 / Lucky Red** theme alongside light/dark/contrast, grounded in the existing OKLCH token
system (do NOT hand-pick hex outside the token pipeline). Festive cinnabar/vermilion paper feel —
red-tinted surfaces, gold-ish accents — but it **must pass the same WCAG-AA contrast gate** on every
token pair, and keep brand-seal distinct from verdict-忌 red so verdicts stay unambiguous (this is
already a project rule; the red theme makes it harder, so verify carefully — verdict good/bad/warn must
remain distinguishable, incl. under CVD simulation). Wire it into the theme toggle + settings + the
generated CSS. Extend `test/color.test.js` to include the red theme in all 3-theme loops (it becomes 4).

**Acceptance:** red theme selectable + persisted; color gate passes for red too (AA all pairs, verdicts
distinguishable incl. CVD); seal ≠ verdict-忌; no raw hex outside tokens.

---

## New / extended gates (wire into `npm test`)
- `test/color.test.js` — add the red theme; all pairs AA across **4** themes; CVD distinguishability holds.
- `test/docs.test.js` — assert `ACADEMY` shape (chapters w/ id/title/story/glossaryLinks, links resolve
  to real glossary ids) and that Academy factual caveats ("versions differ"/"未纳入") appear where due.
- `test/entitlement.test.js` (new) — pure-logic test of the entitlement state machine: locked by default;
  unlocks on a mocked valid response; stays locked on invalid/expired/foreign-product; offline-grace
  behaves; **no secret/token string present in `src/`** (grep assertion).
- `test/assets.test.js` (new, light) — every SVG icon/diagram component has a `<title>`/alt; icons use
  `currentColor` (grep); no `http(s)://` image src in components (offline guarantee).
- SSR — add anchors for the home page and the Academy.

## Honest architecture notes (read before building payments)
- **A static site cannot gate paid features by itself.** Anything purely client-side can be bypassed
  via DevTools. The Cloudflare Worker + Lemon Squeezy licence check is the minimum honest mechanism.
  This is the first time the app needs *any* server; keep it to the one stateless verifier so the
  privacy story barely changes (no user DB, no PII; the Worker just relays a key check).
- **The $88 "lifetime" needs an explicit decision.** A Lemon Squeezy *subscription* key expires if the
  subscription lapses; a true one-off lifetime should be a **single-payment product** whose licence has
  no expiry (or a very long one) and is validated the same way — so it keeps working regardless of any
  subscription tooling. Implement Lifetime as a separate single-payment product/variant, not a
  subscription, and have the Worker return tier='lifetime' with no expiry. Document that if Lemon
  Squeezy is ever dropped, lifetime keys must still be honoured (keep a local allowlist/fallback plan).
- **WhatsApp/email export need no API or backend.** WhatsApp = a `https://wa.me/?text=...` deep link
  with the encoded explanation; email = a `mailto:?subject=...&body=...`. Both are free and offline-safe.
  Only the *gating* of these behind the licence requires the Worker — the export mechanism itself is trivial.
- **Pricing display:** show US$8/yr and US$88 once; Lemon Squeezy handles local currency/tax at checkout.
- **Keep the free tier genuinely useful** — the whole calculator, all learning content, saved dates, all
  themes. Paywall only the export/explanation conveniences. This protects the "传统文化 reference"
  positioning that matters for app-store/China review later, and is the more honest model.

## Out of scope (later)
Source-selectable 通书 traditions; 方位 compass; deeper 八字 (调候/刑冲合会); 繁體 i18n; external
ephemeris differential harness; native app-store packaging (Capacitor). Tracked in master prompt Parts 2–4.
