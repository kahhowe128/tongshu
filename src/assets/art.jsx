// Bundled vector art (Phase 6) — on-palette illustrations generated with Recraft 4.1 (via Higgsfield),
// exported as SVG so they're crisp and tiny, for the marketing surfaces: home hero + 6 lesson covers.
//
// THEME BEHAVIOUR (by design): these vectors are baked for the LIGHT theme (warm cream ground). On the
// dark / contrast / 红运 themes we fall back to the themeable inline SVG (illustrations.jsx) so the art
// always reads on its background and still recolours per theme. If a file is missing or you're offline
// and it isn't cached, it also falls back automatically.
//
// TO SWAP ART: replace public/art/<name>.svg (names below). To remove a piece, delete its name here.
import React from 'react';
import { Illustration } from './illustrations.jsx';

export const ART_AVAILABLE = new Set([
  'hero', 'sky', 'bargain', 'wheel', 'court', 'spirits', 'yourturn',
  'terms', 'zodiacclash', 'hours', 'openshop',
  'openshop_read', 'openshop_tea', 'openshop_almanac', 'openshop_clash', 'openshop_hour',
]);

// Photoreal pieces are bundled as .webp; everything else is on-palette .svg vector.
export const ART_PHOTO = new Set([
  'openshop', 'openshop_read', 'openshop_tea', 'openshop_almanac', 'openshop_clash', 'openshop_hour',
]);

export function Art({ name, alt, size = 320, className, style, lang = 'zh', theme = 'light', onlyLight = false }) {
  const [failed, setFailed] = React.useState(false);
  // Lesson art shows on every theme; the big hero is light-only (onlyLight) so the dark / contrast / 红运
  // launcher falls back to the themeable inline SVG instead of a bright block.
  const useArt = name && ART_AVAILABLE.has(name) && !failed && (!onlyLight || theme === 'light');
  if (!useArt) {
    return <Illustration name={name} lang={lang} size={size} className={className} style={style} />;
  }
  const ext = ART_PHOTO.has(name) ? 'webp' : 'svg';
  return (
    <img src={'art/' + name + '.' + ext} alt={alt || name} loading="lazy" decoding="async"
      onError={() => setFailed(true)}
      className={'a-illus ' + (className || '')}
      style={{ maxWidth: size, width: '100%', height: 'auto', display: 'block', ...style }} />
  );
}
