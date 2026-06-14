// Raster art slot (Phase 5) — lets you drop bundled painterly images onto the marketing surfaces
// (home hero + lesson covers) while keeping the themeable SVG everywhere else, with a graceful fallback.
//
// HOW TO ADD ART (no code change beyond this one list):
//   1. Put an image at  public/art/<name>.webp  (recommended: webp/avif, ~1000–1400px, < 150 KB).
//      Names: hero · sky · bargain · wheel · court · spirits · yourturn  (see public/art/README.md).
//   2. Add that <name> to ART_AVAILABLE below. That surface then shows your raster; everything else
//      keeps the colourful SVG.
//
// Trade-offs (by design): bundled raster does NOT recolour per theme (light/dark/contrast/红运) and
// adds weight. If the file is missing or you're offline and it isn't cached, it falls back to the SVG.
import React from 'react';
import { Illustration } from './illustrations.jsx';

export const ART_AVAILABLE = new Set([
  // 'hero', 'sky', 'bargain', 'wheel', 'court', 'spirits', 'yourturn',
]);

export function Art({ name, alt, size = 320, className, style, lang = 'zh' }) {
  const [failed, setFailed] = React.useState(false);
  if (!name || !ART_AVAILABLE.has(name) || failed) {
    return <Illustration name={name} lang={lang} size={size} className={className} style={style} />;
  }
  return (
    <img src={'art/' + name + '.webp'} alt={alt || name} loading="lazy" decoding="async"
      onError={() => setFailed(true)}
      className={'a-illus ' + (className || '')}
      style={{ maxWidth: size, width: '100%', height: 'auto', display: 'block', ...style }} />
  );
}
