# Claude Code brief — Tong Shu Phase 4 (captivating responsive site + richer calendar)

Work on the **current `main`** (Phase 0–3 live at https://kahhowe128.github.io/tongshu/). Full detail
+ per-workstream acceptance in `PHASE4_SPEC.md`. This phase is **presentation + content-shell only**.

## Locked scope decisions (do not deviate)
- **Payments untouched:** keep Lemon Squeezy + the Phase-3 tier model. Do NOT modify `worker/`, the
  `entitlement` module, `<Gate>`, pricing, or which features are free vs paid.
- **Engine frozen:** no math changes; verdict values must stay byte-identical.
- **Video/article content comes later from the owner.** Build layout + data shape + graceful empty
  states now. Never fabricate fengshui claims; never bundle copyrighted/external media.

## Guardrails (unchanged, absolute)
Bilingual 中/EN; never colour-only (icon/label always); exact-vs-graded tags intact; nothing fabricated;
omitted items stay omitted; verdicts never definitive; every gate green after each commit (`npm test`:
engine 22/22, 4-theme color AA + CVD, docs↔engine lint, hours, entitlement, assets, SSR). One commit
per workstream; re-run `npm test` after each; do an in-browser check after each.

## The headline change
`.a-app` is currently hard-capped at 540/600px — a phone column even on desktop. Introduce a real
**responsive shell**: wide multi-column layout ≥1024px (page max ~1200–1320px, persistent top/left nav,
multi-pane content), tablet mid-width, and the existing single column + bottom tabs on mobile (<768px).
Define breakpoints once as the project scale. The day-sheet's existing ≥980px right-rail dock
(`[data-sheet="1"]`) is the pattern to generalize.

## Workstreams (recommended order; each its own commit + `npm test`)
1. **WS-5 Shell & nav** first (everything else sits inside it): one responsive `AppShell` — persistent
   desktop nav (Home·Calendar·Academy·Videos·Articles·Tools·About + theme incl. 红运 + lang + upgrade),
   bottom tabs on mobile (≤5, "More" overflow). URL-hash routing unchanged. Reduced-motion honoured.
2. **WS-3 Richer calendar** — the centrepiece. Desktop two-pane "almanac desk": large month grid (each
   cell = day# + 农历 + 干支 + verdict icon+tint+label + top-宜 activity glyphs + ⭐ save), with the day
   detail rendered **inline in a right pane** (generalize the existing right-rail dock; modal stays on
   mobile). Month/agenda/list toggle remembered in the hash. Iconful + tasteful "fun" via the Phase-3
   `currentColor` SVG set; legend always visible; full keyboard + a11y; **no verdict/engine logic
   changes** (values byte-identical). Mobile = today's compact view, lightly enriched (lunar day + verdict icon).
3. **WS-1 Captivating home** — wide desktop landing: hero (seal + CTAs), trust strip, featured lessons
   (from `ACADEMY`), video + article placeholder rows (graceful empty), a live "today's almanac" teaser
   (real engine), the unchanged upgrade strip, footer. Mobile stacks. Fast first paint, SVG-first.
4. **WS-2 Lessons/Academy surface** — promote the Phase-3 `ACADEMY` to a first-class lessons index
   (illustrated card grid) + chapter reader (comfortable measure, diagrams, glossary deep-links,
   prev/next, progress, cross-link to a CASES example + "try it" → calculator). Content stays sourced
   from `docs/source.cjs`; docs lint green.
5. **WS-4 Video/article scaffolding** — add a `MEDIA` export (videos/articles data shape per spec) +
   responsive video grid (lazy youtube-nocookie embed when an id is present; graceful "coming soon"
   when empty) + article index/reader (bilingual body, `sourceAttribution` shown). Lint: non-empty
   article body ⇒ non-empty attribution; no external non-allowlisted media hosts. Wire into Home + nav.

Plus a **visual polish pass**: consistent spacing/type scale, cinnabar identity across the new wide
surfaces, re-run the 4-theme color gate (new components = new token pairs), performance budget
(lazy embeds, no CLS), offline PWA guarantee preserved (shells degrade gracefully; live embeds fail gracefully).

## New/extended gates (wire into `npm test`)
- `test/responsive.test.js` (SSR) — desktop-nav anchor + mobile-tab anchor present; Home/Calendar/
  Academy/Videos/Articles SSR without throwing.
- extend `test/assets.test.js` (new SVGs: `<title>`, currentColor, no external raster; youtube-nocookie lazy only).
- extend `test/docs.test.js` (`MEDIA` shape; article-body ⇒ attribution; Academy glossary links resolve).
- `test/color.test.js` — all 4 themes AA on new component pairs.
- engine + entitlement gates unchanged and green (proves no logic/payment regression).

## Out of scope
Payment/tier/Worker/pricing changes; engine math; source-selectable traditions; 方位 compass; deeper
八字; 繁體 i18n; ephemeris harness; Capacitor; real video/article *content* (owner supplies later).

When done: push; report the live URL, what each commit changed, and confirm (a) desktop is now a wide
multi-column site while mobile stays the phone layout, (b) the calendar is the richer two-pane desk,
(c) video/article shells are ready for content drop-in, (d) all gates incl. payments untouched are green.
Note anything only a human can visually verify (the wide-desktop aesthetic, illustration quality).
