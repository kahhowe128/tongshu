# Bundled raster art (home hero + lesson covers)

Drop image files here to replace the themeable SVG illustrations on the **home hero** and **lesson
covers** with your own painterly art. Everything else (icons, diagrams, all other illustrations) stays
themeable SVG.

## How
1. Add a file named exactly one of:
   `hero.webp` · `sky.webp` · `bargain.webp` · `wheel.webp` · `court.webp` · `spirits.webp` · `yourturn.webp`
   - `hero` = the home hero scene; the rest are the six Academy chapter covers.
   - Recommended: **WebP or AVIF**, ~1000–1400px on the long edge, **under ~150 KB** each.
2. In `src/assets/art.jsx`, add that name to `ART_AVAILABLE`.
3. Rebuild / push. That surface now shows your image; if the file is missing or you're offline and it
   isn't cached, it falls back to the colourful SVG automatically.

## Notes
- Bundled raster does **not** recolour per theme (light / dark / contrast / 红运) — it's fixed art, so
  pick something that reads on a warm cream background (the default theme).
- Keep it original / licensed — do not commit copyrighted images.
- These files are served as static assets (not hashed); they deploy to `…/tongshu/art/<name>.webp`.
