# 通書擇日 · Tong Shu Date Selector

Bilingual Chinese-almanac (通书／黄历) date-selection calculator. The astronomical/calendrical
layer (干支, 节气, 农历置闰, 冲煞, 时辰) is computed exactly with Meeus-grade algorithms; the
interpretive layer (建除, 黄黑道, 二十八宿, 神煞宜忌) encodes named classical rules — chiefly
《协纪辨方书》 — with explicit H/M confidence grades. **Computed guidance, never definitive.**
100% client-side: works offline, collects nothing, transmits nothing.

## Structure
- `src/engine/tongshu.js` — pure, dependency-free engine (159 exports; 22 built-in gates)
- `src/design/tokens.js` — design tokens, single source (OKLCH-derived; WCAG-AA gated)
- `src/styles.js` — generated theme CSS + static styles
- `src/App.jsx` — the app (settings persist in the URL hash *and* localStorage via one codec)
- `docs/source.cjs` → `scripts/gen-docs.mjs` → `src/docs.gen.js` + `public/guide/` — one
  documentation source feeds the in-app Learn tab, the website guide page, and the PDF
- `test/` — engine · color · docs↔engine · SSR gates (all run in CI on every push)

## Commands
```bash
npm ci                 # install
npm run docs           # regenerate docs surfaces from docs/source.cjs
npm test               # all gates (engine 22/22, color AA, docs lint, SSR ×4)
npm run dev            # local dev server
npm run build          # production build → dist/
npm run pdf            # print the user-guide PDF from the same HTML (needs playwright chromium)
```

## Integrity rules (do not regress)
Never fabricate; omitted items stay omitted until a verified source exists; every datum is
tagged exact (computed) or graded (tradition); historical claims stay attributed; the docs'
omitted list must mirror the engine's omission flags (`test/docs.test.js` enforces this).

Deep links: `#v=learn` opens a tab; `#g=td` opens a glossary entry. Share links carry full settings.
