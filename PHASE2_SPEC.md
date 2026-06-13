# Tong Shu — Phase 2 feature spec (for Claude Code)

Four UX changes on top of the validated repo (`tongshu-app-repo.zip` / the split project).
**Engine logic is correct and must not change.** Three of these are pure presentation; one
(the calendar heat-strip) reuses `computeDay` + the existing day-verdict function with no new rules.
Every acceptance gate from before must still pass: engine 22/22, color AA ×3 themes, docs↔engine
lint, SSR ×4. Add the new gates listed at the end.

Files referenced are from the split repo: `src/engine/tongshu.js` (pure engine), `src/App.jsx`
(the component), `src/styles.js` (CSS), `src/design/tokens.js`, `docs/source.cjs` (docs single source).

---

## Feature 1 — Hours: three states, not tick / no-tick  ★ correctness fix

**Problem (confirmed against the engine).** The day sheet's "12 double-hours" grid currently ticks
every yellow-path hour. But `rankHours` (in `src/engine/tongshu.js`) already computes a signed weight
`w` per hour, and a yellow-path hour that **clashes the day branch** (日破时, −3) nets to a *negative*
score. Example — 2026-06-16 (辛酉 day), hour 卯: yellow-path **but** day-clash → `w = −1`. The current
UI shows it ticked, which is misleading. "No tick" also conflates genuinely-bad hours with neutral ones.

**Fix.** Render each hour in one of three states, driven *only* by the sign of the existing `w`
(no new rule, no new sources). Add this tiny pure helper to `src/engine/tongshu.js` and **export it**:

```js
// Three-state label for an hour, derived solely from rankHours()'s existing weight `w`.
// good ⟺ yellow-path with no day-clash (w≥2); avoid ⟺ black-path or day-clash (w≤-1); else neutral.
// Verified over 2026: 43.8% good / 47.9% neutral / 8.3% avoid; good⟺yellow&!clash holds exactly.
export function hourClass(w) {
  if (w >= 2) return { key: 'good', zh: '吉', en: 'Favorable' };
  if (w <= -1) return { key: 'avoid', zh: '忌', en: 'Avoid' };
  return { key: 'neutral', zh: '平', en: 'Neutral' };
}
```

**UI (day sheet, the `D.hours` / hours accordion).** Replace the tick column with a state pill per
hour cell:
- good → green pill "吉 / Favorable" (use `--good` / `--good-soft`)
- neutral → grey pill "平 / Neutral" (use `--neutral` / `--neutral-soft` or `--ink-faint`)
- avoid → red pill "忌 / Avoid" (use `--bad` / `--bad-soft`)
Keep the existing reason text (the `tags` already carry 黄道时·god / 时冲日支（日破时） / 六合 / 三合 /
害日支). Each cell must show **icon-or-text label + reason**, never colour alone (a11y rule already in
the project). Add a one-line legend under the grid: "吉 favorable · 平 neutral · 忌 avoid (clash/black-path)".
Add a short explanatory line (bilingual), wired to the existing glossary deep-link `#g=zeshi`:
> 时辰按精确规则排序（时之黄道/黑道 + 时支冲合日支）；时家神煞未纳入。
> Hours ranked by exact rules (hour path-god + hour-vs-day branch); hour-family spirits omitted.

**Acceptance:** no hour with a day-clash is shown as favorable; every black-path hour is neutral or
avoid; legend present; reason shown on every cell; deep-link resolves.

---

## Feature 2 — Find page: overall calendar heat-strip  ★ new view

Add a **month calendar** to the Find page (between the Date-range card and the ranked list) that
colours each day by its verdict for the currently-selected activities — so the user can eyeball
good/bad clusters instead of reading a list. This reuses the **existing** per-day verdict; no new logic.

**Data.** For each day in the visible month, call the same `computeDay` + day-verdict function the
ranked list already uses (the thing that yields `dv.color` ∈ {green, red, amber, grey} and the verdict
label). Cell background uses the verdict color token (`--good/-soft`, `--bad/-soft`, `--warn/-soft`,
`--neutral-soft`). The grid already has `.a-cell` styles in `src/styles.js` (the Calendar tab uses
them) — reuse that class; add a verdict-tint modifier.

**Behaviour.**
- A month grid (Mon–Sun or Sun–Sat — match the existing Calendar tab's convention), with ‹ › to page
  months, defaulting to the start of the current range.
- Tap a day → opens the existing day sheet (`setSelJDN(jdn)`) — identical to tapping a list row.
- Respect the active range: days outside the chosen From–To are dimmed (`.a-cell.out` exists).
- If zodiac screening is on, clashed days keep the existing ⚠ treatment.
- Each cell shows the civil day number + a verdict dot/tint; **icon/label not colour-only** — keep the
  tiny verdict glyph (✓ ✗ ～ ·) the list already uses (`vIcon`).
- A segmented control lets the user switch **List ⇄ Calendar** for the results (keep both; don't remove
  the list). Default to whichever you like; remember it in the same settings hash.

**Performance.** A month is ≤31 day-computations; fine to compute inline. Memoize per (month,
activity-set) like the list does.

**Acceptance:** calendar renders for the current month; tapping a day opens the same sheet as the list;
colours match the list's verdict for the same day; List⇄Calendar toggle works and round-trips in the URL.

---

## Feature 3 — Move "negative" activities into a side tab  ★ declutter

The Activities picker currently shows every category inline, including funerary/inauspicious ones.
Group the activity categories into **two tabs** within the Activities card:

- **日常 / Everyday** (default tab): Health, Marriage, Home, Business, Travel, Ritual, Agriculture, Misc
  — i.e. all the auspicious/neutral categories.
- **凶事 / Inauspicious** (secondary tab): the funerary/negative group — Funerary (Burial, Encoffin,
  Move coffin, Repair grave, Erect tombstone, Exhume, End/Begin mourning) and anything else clearly
  inauspicious (e.g. Demolish, Break-ground-for-grave). Keep Home's ordinary items (Move house, etc.)
  in Everyday.

Implementation: a small segmented control (`.a-seg`, already styled) at the top of the Activities card
toggling which category set renders. Selections persist across tab switches (don't clear `selIds`).
A selected item in the hidden tab still counts — show a small "(+N from 凶事)" hint on the inactive tab
label if any are selected there. Keep the existing category labels and the per-category chip layout.

Define the category split in one place (a `CATEGORY_TABS` map) so it's auditable; don't scatter the
classification. Confirm the exact category keys from the current `catGroups` / `catLabel` source before
moving them.

**Acceptance:** funerary items no longer appear under Everyday; toggling tabs preserves selections;
a date computed with a funerary activity selected still works; the inactive-tab hint counts correctly.

---

## Feature 4 — Case-study / examples page  ★ new content (the "how to use it" driver)

Add a **用例 / Examples** surface that walks real scenarios end-to-end, so a newcomer sees *why* the tool
helps. Two acceptable forms — pick the one that fits the codebase cleanly:
(a) a new section in the existing **Learn** tab (simplest, reuses the docs single-source), or
(b) a route/page if you add routing.

Author the content in the **docs single source** (`docs/source.cjs`) as a new `CASES` export, so it
flows to the in-app Learn tab, the website guide, and the PDF exactly like the other docs (this keeps
the "one source, no drift" guarantee and the docs lint intact). Shape:

```js
const CASES = [
  {
    id: 'wedding',
    title: ['挑一个嫁娶吉日', 'Choosing a wedding date'],
    scenario: ['想在秋天办婚礼，新娘属兔，想避开冲煞与三娘煞。',
               'A couple wants an autumn wedding; the bride is a Rabbit; avoid clashes and Three-Maiden Sha.'],
    steps: [  // each [zh, en]
      ['在「凶事/日常」选 嫁娶；设置里填女命生肖＝兔。', 'Pick Wedding; set bride zodiac = Rabbit in Settings.'],
      ['范围选未来90天，打开生肖筛除。', 'Range = next 90 days; turn on zodiac screening.'],
      ['用日历视图看绿色聚集的周段。', 'Use the calendar view to spot green clusters.'],
      ['点开候选日：看大利月是否相符、三娘煞是否标红、神煞吉凶。',
       'Open a candidate: check marriage-month luck, Three-Maiden flag, and spirit grades.'],
    ],
    reading: ['绿色＝净吉；若见三娘煞或冲新娘生肖则降级。最终以纸本通书或择日师确认。',
              'Green = net-favorable; Three-Maiden or a clash with the bride demotes it. Confirm with an almanac or specialist.'],
    note: ['不将日与周堂本应用未纳入（版本分歧），故婚课请专业复核。',
           'Bujiang/Zhoutang are omitted (versions differ) — have weddings professionally reviewed.'],
  },
  // Add 3–4 more: 开业 (opening a business), 搬家 (moving house), 安葬 (burial), 出行 (travel).
];
module.exports = { /* ...existing exports..., */ CASES };
```

Then in `scripts/gen-docs.mjs`: add a `CASES` block to the in-app `DOCS` object, render a "用例
Examples" `<section>` into the website guide HTML (same bilingual `bi()` / `h2()` pattern), and add it
to the PDF flow if the PDF builder enumerates sections (it renders from the same HTML, so it's automatic).

In-app: render the cases in the Learn tab as accordions (the `acc(...)` helper exists), each showing
scenario → numbered steps → "reading" → caveat note. Link each case's relevant terms via the existing
glossary deep-links (e.g. 三娘煞 `#g=sanniang`, 大利月 `#g=dali`).

**Integrity:** every case must restate the non-definitive framing and any omitted-item caveat that
applies (weddings → Bujiang/Zhoutang omitted; burial → mountain-facing omitted). No invented certainty.

**Acceptance:** Examples appear in-app, on the website guide, and in the PDF, all from `docs/source.cjs`;
the docs lint still passes; case glossary links resolve.

---

## Also fix (small)
- **Day-sheet header overlap:** when the day sheet is open, its verdict title visually overlaps the
  "Find a date" `h1` on narrow widths (z-index/stacking in the sheet overlay). Ensure the sheet's
  backdrop/heading sits above the page content and the page `h1` doesn't bleed through.

## New acceptance gates (add to `test/`)
1. `test/hours.test.js` — import `rankHours`, `hourClass`, `computeDay`, `gregorianToJDN`; for a sweep
   of 2026 assert: no day-clash hour classifies `good`; every `good` hour is yellow-path & not clashing;
   distribution roughly 40–50% good / 45–50% neutral / 5–12% avoid. (Reference run: 1917/2098/365.)
2. Extend `test/docs.test.js` — assert `CASES` exists, every case has `id/title/scenario/steps/reading`,
   each case body references at least one valid glossary id, and the omitted-item caveat phrasing
   ("未纳入" / "omitted") appears in wedding & burial cases.
3. Existing `test/ssr.test.js` — add a render assertion for the calendar view (an anchor string from
   the heat-strip) and the Examples section.

## Out of scope (leave for later phases)
Saved/favourite dates & templates, source-selectable 通书 traditions, the 方位 compass, deeper 八字
(调候/刑冲合会), 繁體 i18n, the external ephemeris differential harness, app-store packaging. These need
storage/network/stores and are tracked in PARTS 2–4 of the master prompt.
