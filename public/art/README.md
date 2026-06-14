# Bundled vector art (home hero + lesson covers)

These are on-palette **SVG** illustrations (generated with Recraft 4.1 via the Higgsfield connector,
locked to the app's cinnabar/jade/gold/terra/plum palette). They render on the **light** theme; the
dark / contrast / 红运 themes fall back to the themeable inline SVG so art always reads on its
background. Everything else (icons, diagrams, other illustrations) stays themeable SVG.

## Files
`hero.svg` · `sky.svg` · `bargain.svg` · `wheel.svg` · `court.svg` · `spirits.svg` · `yourturn.svg`
- `hero` = the home launcher scene; the other six are the Academy chapter covers.
- They are real vector (`<svg>`), so they're crisp at any size and only tens of KB each.

## How to swap or remove
1. Replace `public/art/<name>.svg` with your own (any aspect ratio; a warm/cream ground reads best on
   the light theme). Or drop a new file and add its `<name>` to `ART_AVAILABLE` in `src/assets/art.jsx`.
2. To remove a piece, delete its name from `ART_AVAILABLE` — that surface reverts to the themeable
   inline SVG automatically. A missing/offline file also falls back on its own.

## Notes
- Bundled art does **not** recolour per theme — that's why it's light-theme-only by design.
- Keep it original / licensed (these were generated for this project). Don't commit copyrighted images.
- Served as static assets; they deploy to `…/tongshu/art/<name>.svg`.
