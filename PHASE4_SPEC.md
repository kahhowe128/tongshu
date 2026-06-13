# Tong Shu — Phase 4 spec (for Claude Code): captivating responsive content site + richer calendar

Builds on the **current `main`** (Phase 0–3 live at https://kahhowe128.github.io/tongshu/). This phase
is **presentation + content-shell only**. Confirmed scope decisions from the owner:
- **Payments unchanged:** keep Lemon Squeezy + the Phase-3 tier model (free = whole calculator + all
  learning + saved dates + all themes; paid = rich WhatsApp/email/PDF export *with* the honest
  factor-derived explanation). **Do NOT touch `worker/`, the `entitlement` module, `<Gate>`, pricing,
  or the tier split.**
- **Engine frozen** as always; this phase changes layout, navigation, visuals, and content scaffolding
  — not math, not the docs *facts*, not the verification gates.
- **Video/article content will be supplied later by the owner.** Build the *layout and the data shape*
  now with clean placeholders; do NOT fabricate fengshui claims or embed any copyrighted video/article.

All standing guardrails hold: bilingual 中/EN; never colour-only; exact-vs-graded tags intact;
nothing fabricated; omitted items stay omitted; verdicts never definitive; every gate green after each
commit (`npm test` incl. the 4-theme color gate, docs↔engine lint, hours, entitlement, assets, SSR).

Ship each workstream as its own commit; re-run `npm test` after each.

---

## The core problem to fix (read first)
Today `.a-app` is hard-capped at **max-width 540px (600px ≥768px)** — i.e. a phone-width column
centered on every screen. That's why it doesn't feel like a website on a PC. The day-sheet already
docks to a 480px right rail at ≥980px (`.a-root[data-sheet="1"]`), proving the responsive plumbing
exists. Phase 4 introduces a **true responsive shell**: a wide multi-column layout for the *content*
surfaces on desktop, the existing single column on mobile — same React, one codebase, CSS-driven.

**Responsive contract (make this explicit in CSS, token-driven, no magic numbers scattered around):**
- **Mobile (< 768px):** essentially today's experience — single column, bottom tab bar, full-width
  sheets. Don't regress it.
- **Tablet (768–1023px):** widen content to ~720–820px; keep bottom tabs or move to a top bar (your call,
  but be consistent).
- **Desktop (≥ 1024px):** **break the 540/600 cap.** Use a real page max-width (~1200–1320px), a
  **persistent left/top navigation** (replacing the bottom tab bar — keep bottom tabs mobile-only),
  and **multi-column content** (see WS-2/WS-3). The day-sheet's existing right-rail dock pattern can be
  generalized into the desktop layout grid.
Define the breakpoints once as the project's responsive scale; reuse everywhere.

---

## WS-1 — Captivating home / landing (the front door)
Phase 3 already made Home the default tab. Phase 4 makes it *beautiful and wide on desktop*. Goal:
a visitor lands and immediately gets "this is a trustworthy, lovely fengshui-almanac site," sees
lessons + (placeholder) videos/articles, and can step into the calculator.

Desktop layout (≥1024px): a proper landing page, full page-width, sections stacked with generous
rhythm:
1. **Hero band** — seal motif + the cinnabar identity, headline + subhead (bilingual), two CTAs
   ("选个吉日 / Find a date" → calculator, "开始学习 / Start learning" → Academy). A tasteful original
   SVG backdrop (reuse WS-2 art from Phase 3; no stock photos). Respect the red theme.
2. **Trust strip** — the three pills (verifiable astronomy / honestly graded / offline-private) as
   cards with the new icons, each linking to proof (Accuracy tool, a Learn anchor).
3. **Featured lessons** — a horizontal card row pulling the Academy chapters (cover illustration +
   title + one-line teaser → opens the chapter). This is real content (the Phase-3 `ACADEMY` source).
4. **Videos** *(placeholder shell)* — a responsive video-card grid wired to a `MEDIA.videos` data
   array (see WS-4) that is currently empty/placeholder; renders "coming soon" gracefully when empty.
5. **Articles** *(placeholder shell)* — an article-card list wired to `MEDIA.articles`, same pattern.
6. **Today's almanac teaser** — a small live widget showing *today's* verdict snapshot (computed by the
   real engine) with a "查看完整 / See full day" link into the day sheet. Free, real, and a great hook.
7. **Upgrade strip** — the existing Phase-3 free-vs-paid card (unchanged logic), styled to fit.
8. **Footer** — Learn, Academy, Examples, guide PDF, About, disclaimer, version.

Mobile: the same sections stack into the single column; hero compresses; card rows become horizontal
scrollers or stacks. Fast first paint — defer/lazy anything heavy; SVG over raster.

**Acceptance:** desktop home spans the wide layout (not the 540px column); mobile stacks cleanly; the
"today" teaser shows a real computed verdict; empty video/article shells render gracefully; all CTAs route.

---

## WS-2 — Lessons / 学堂 Academy as a first-class, captivating surface
The Phase-3 Academy (story chapters in the `ACADEMY` docs single-source) currently lives inside the
Learn tab. Phase 4 promotes it to a proper **lessons section** with delightful presentation:
- A **lessons index** (desktop: multi-column card grid with each chapter's original illustration;
  mobile: single column) — chapter number, title, teaser, "约 X 分钟 / ~X min read".
- A **chapter reader** view: comfortable reading measure (~64ch) centered on desktop, the chapter's
  illustration + any diagrams (the Phase-3 SVGs: leap-month, 60-cycle wheel, 28宿 ring, 建除 court,
  五行 pentagram), inline glossary deep-links, prev/next chapter nav, and a progress indicator.
- Keep all content sourced from `docs/source.cjs` (`ACADEMY`, `GLOSS`, `CASES`) — single source, no
  drift, still flows to the website guide + PDF. Stories may be vivid; facts stay attributed/graded.
- Cross-link: end of each chapter → a relevant worked Example (CASES) and "试试看 / Try it" → calculator.

**Acceptance:** lessons index + reader render responsively; illustrations/diagrams theme correctly
(incl. red + dark + contrast); glossary links resolve; content still comes only from the docs source;
docs lint stays green.

---

## WS-3 — The calendar: wider, more iconful, more fun (free tier, presentation only)
Make the date-selection calendar the centrepiece it deserves to be — **richer icons and a genuinely
enjoyable wide layout on desktop**, the compact view on mobile. **No engine/verdict logic changes** —
this is visual enrichment of the existing heat-strip + day data.

Desktop (≥1024px) — a **two-pane "almanac desk"**:
- **Left/main pane:** a large month calendar. Each day cell is richer than the mobile dot:
  - the civil day number + lunar day (农历) + the day's 干支 (already computed),
  - the verdict as **icon + tint + label** (✓宜 / ✗忌 / ～参考 / ·中性 — never colour-only),
  - small **activity-friendly icons** (from the Phase-3 SVG set) hinting the day's top 宜 items
    (e.g. a tiny "marriage" / "moving" / "travel" glyph) — decorative shorthand for the computed
    per-activity result, not new logic,
  - a ⭐ affordance to save/favourite (Phase-3 free feature),
  - festive flourishes in the red theme (lucky-day accents) that still pass contrast.
- **Right pane:** the day detail — reuse the existing day sheet, but on desktop render it *inline in
  the right pane* (generalize the existing `[data-sheet="1"]` right-rail dock) so selecting a day
  updates the pane without a modal. Mobile keeps the bottom-sheet modal.
- A **month/agenda/list segmented control** (the Phase-2 List⇄Calendar toggle, extended): Month grid,
  or a scrollable agenda, or the ranked list — user choice, remembered in the URL hash.
- Activity filter + range live in a compact toolbar above the calendar (desktop) / in the existing
  controls (mobile).

Iconography & "fun" (keep it tasteful, not noisy):
- Use the Phase-3 `currentColor` SVG icon set throughout; add any missing activity glyphs.
- Verdict glyphs get a subtle, consistent visual language; lucky days (strong 宜) can carry a small
  flourish. Hover/press states on desktop (`@media (hover:hover)`), tap states on mobile.
- Legend always visible (✓宜 ✗忌 ～参考 ·中性 + the hour 吉/平/忌 legend from Phase 2).
- **Accessibility is non-negotiable:** every icon has a `<title>`/aria-label; nothing communicated by
  colour or icon alone — text label always present; full keyboard nav of the grid; reduced-motion honoured.

Mobile (< 768px): the existing compact calendar/heat-strip, lightly enriched (lunar day + a small
verdict icon per cell), bottom-sheet day detail. Do not bloat the mobile cell or hurt performance
(≤31 day-computations/month, memoized as today).

**Acceptance:** desktop shows the two-pane almanac desk spanning the wide layout; selecting a day
updates the right pane inline (no modal) on desktop, modal on mobile; cells show lunar+干支+verdict
icon+label+save; icons theme under all 4 themes; legend present; keyboard + reduced-motion + a11y pass;
verdict values are byte-identical to the engine (no logic change); mobile unchanged in behaviour.

---

## WS-4 — Video + article content scaffolding (layout now, content later)
The owner will supply real videos/articles later. Build the **data shape + responsive presentation**
now so dropping content in is trivial and safe.
- Add a `MEDIA` export to the docs single source (or a dedicated `content/media.cjs` if cleaner):
  ```js
  const MEDIA = {
    videos: [
      // { id, title:[zh,en], teaser:[zh,en], poster:'assets/...svg', src:'', // src empty for now
      //   provider:'youtube'|'file'|'', duration:'', tags:[] }
    ],
    articles: [
      // { id, title:[zh,en], excerpt:[zh,en], cover:'assets/...svg', body:[zh,en]|null, // body later
      //   author:'', date:'', tags:[], sourceAttribution:'' }
    ],
  };
  ```
- **Video gallery:** responsive card grid (desktop multi-col, mobile single). Each card: poster (SVG
  placeholder for now), title, teaser, duration badge. Empty `videos` → a graceful "课程视频即将上线 /
  Video lessons coming soon" state, not a blank hole. When `src` is a YouTube id, embed via the
  privacy-friendly `youtube-nocookie.com` iframe **lazily** (no autoplay, no tracking on load); when a
  file URL, a native `<video>`; never bundle copyrighted media.
- **Article reader:** list/index + a reader view (same comfortable measure as the Academy reader).
  Body is bilingual `[zh,en]`; render markdown-ish or plain paragraphs. Empty body → "敬请期待 /
  Coming soon". Every article carries a `sourceAttribution` field and must show it when present
  (integrity: attribute sources; never present unsourced claims as fact).
- Wire both into the Home featured rows (WS-1) and give them their own nav entries (desktop nav +
  mobile tab or Learn sub-section).
- **Integrity gate:** since content is owner-supplied later, add a lint that any *non-empty* article
  body must have a non-empty `sourceAttribution` (forces attribution discipline), and that no media
  `src`/`poster` points to an external non-allowlisted host except the youtube-nocookie embed case.

**Acceptance:** video grid + article index/reader render responsively with graceful empty states;
the embed path is lazy + privacy-friendly; the data shape is documented; the attribution lint passes;
no copyrighted/external assets bundled.

---

## WS-5 — Navigation & shell unification
- **Desktop (≥1024px):** replace the bottom tab bar with a **persistent top or left nav**: brand/seal,
  primary links (首页 Home · 黄历 Calendar · 学堂 Academy · 视频 Videos · 文章 Articles · 工具 Tools ·
  关于 About), the theme switcher (incl. 红运 Red), language toggle, and the upgrade button. Active-route
  highlight; keyboard accessible.
- **Mobile (<768px):** keep the bottom tab bar (it works); fold the less-used items behind a "更多/More"
  entry if the bar gets crowded. Keep it to ≤5 primary tabs.
- One responsive `AppShell` component decides nav placement by breakpoint; routes/tabs unchanged in
  behaviour. Persist the active section in the URL hash like today.
- Smooth, tasteful transitions (respect `prefers-reduced-motion`). No layout shift on load.

**Acceptance:** desktop shows persistent nav + wide layout; mobile shows bottom tabs; switching width
reflows without breaking; deep-links/URL-hash routing still works; reduced-motion honoured.

---

## Visual polish pass (applies across all WS)
- Generous, consistent spacing scale; clear type hierarchy; the cinnabar/woodblock identity carried
  through. Reuse the Phase-3 SVG icon/illustration system everywhere; fill any gaps with new themeable
  `currentColor` SVGs (alt text on all).
- The four themes (light / dark / contrast / 红运 red) must all look intentional on the *new* wide
  surfaces — re-run the color gate after layout work since new components introduce new token pairs.
- Performance budget: SVG-first, lazy-load video embeds and any below-the-fold imagery, no CLS, fast
  first paint. The PWA/offline guarantee for the free app must survive (content shells degrade
  gracefully offline; only live video embeds require network, and they fail gracefully).

## New / extended gates (wire into `npm test`)
- `test/responsive.test.js` (light/SSR-based) — assert the shell renders a desktop-nav anchor and a
  mobile-tab anchor; assert Home/Calendar/Academy/Videos/Articles sections SSR without throwing.
- Extend `test/assets.test.js` — new icons/illustrations have `<title>`, use `currentColor`, no external
  raster/image hosts (except the youtube-nocookie embed allowance, which must be lazy).
- Extend `test/docs.test.js` — `MEDIA` shape valid; non-empty article body ⇒ non-empty `sourceAttribution`;
  Academy still resolves glossary links.
- `test/color.test.js` — re-confirm all 4 themes AA on the new component token pairs.
- **Engine + entitlement gates unchanged and must stay green** (proves no logic/payment regression).

## Explicitly out of scope (do NOT do here)
Any change to payment/tiers/Worker/pricing; engine math; source-selectable 通书 traditions; 方位
compass; deeper 八字; 繁體 i18n; the external ephemeris harness; Capacitor packaging. Real video/article
*content* (owner supplies later — this phase is the shell only).

## Owner actions (none required to ship the layout)
This phase needs no new accounts or secrets. After it ships, the owner will: supply video ids/files +
article bodies (drop into `MEDIA`), and review the wide-desktop look on a real screen (the one thing
the coding agent can't visually verify).
