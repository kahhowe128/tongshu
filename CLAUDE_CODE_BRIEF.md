# Claude Code brief — Tong Shu: deploy, then Phase 2 features

This repo is a pre-validated Vite + React PWA (bilingual Chinese-almanac date selector). The
astronomical engine is correct and gated; do not change engine math. Two jobs, in order.

## Guardrails (apply to everything)
- DO NOT modify the math in `src/engine/tongshu.js`, `docs/source.cjs` factual content, or any
  existing test's pass thresholds. You may ADD exports/tests.
- After every change, all gates must stay green:
  `npm test` → engine 22/22 · color ALL PASS ×3 themes · docs↔engine lint clean · SSR 4/4 · hours gate.
- Keep the integrity rules: every datum tagged exact (computed) vs graded (tradition); nothing
  fabricated; omitted items stay omitted; verdicts never definitive; bilingual 中/EN throughout.
- Accessibility: never colour-only — every verdict/state carries an icon or text label.

## JOB 1 — ship it live (no local build needed; CI builds)
1. From a clean checkout: `npm ci` then `npm test`. Expected exactly:
   engine 22/22; leap 1900–2100 {total:2487,bad:0,leapCount:74}; 春节 2026 = 2026-02-17;
   color ALL PASS on light/dark/contrast; docs lint clean (24 scored 神煞, omitted list mirrors
   engine); SSR find/learn/learn-EN/tools all present; hours gate clean. Do not proceed if any differ.
2. `npm run build` as a sanity check (CI also builds).
3. Commit "Phase 0+1: engine split, PWA, gates, CI"; push to `main`.
   - If the push is rejected for workflow scope, run `gh auth refresh -h github.com -s workflow` (or
     create the repo + push via the GitHub connector) and retry.
4. Enable Pages with **GitHub Actions** as the source (Settings → Pages), or via API:
   `gh api repos/{owner}/{repo}/pages -X POST -f build_type=workflow` (use PUT if it already exists).
5. Watch the Actions run; when build AND deploy are green, report the Actions URL and the live URL
   `https://{owner}.github.io/{repo}/`. The CI runs every gate + prints the guide PDF + builds + deploys.

## JOB 2 — Phase 2 features (see PHASE2_SPEC.md for full detail + acceptance per feature)
Implement these four, each behind its own commit, re-running `npm test` after each:
1. **Hours three-state** (correctness fix): add+export `hourClass(w)` in the engine (exact code in the
   spec; it only labels rankHours()'s existing weight — no new rule), then render good/neutral/avoid
   pills with reasons + a legend in the day-sheet hour grid. `test/hours.test.js` already exists and
   must pass. This fixes a real bug: yellow-path hours that clash the day (e.g. 卯 on 2026-06-16) were
   shown as favorable but actually score negative.
2. **Find calendar heat-strip**: a month grid on the Find page colouring each day by the SAME verdict
   the ranked list uses; tap a day → existing day sheet; List⇄Calendar toggle; state in the URL hash.
3. **Activity side tab**: split the Activities picker into 日常/Everyday (default) and 凶事/Inauspicious
   (funerary/negative) via a single auditable `CATEGORY_TABS` map; selections persist across tabs.
4. **Examples/case-study**: author a `CASES` export in `docs/source.cjs` (5 scenarios: wedding, opening,
   moving, burial, travel); flow it through `scripts/gen-docs.mjs` to the in-app Learn tab + website
   guide + PDF; link terms via existing glossary deep-links; restate non-definitive + omitted caveats.
   Extend `test/docs.test.js` to assert CASES shape + caveats; extend `test/ssr.test.js` for calendar
   + Examples anchors.
Plus the small fix: day-sheet header overlapping the page `h1` on narrow widths (z-index/stacking).

Wire the new gates into the `test` script in package.json (add hours.test.js to the chain).
When done, push; report the live URL and a one-line summary of what each commit changed.
