// Spot illustrations for the Academy chapters (Phase 3 WS-2). Original, simple two-tone line art
// using theme tokens (no raw hex, no external assets, no realistic likenesses). Each <svg> has a
// <title> for a11y. TODO: these are clean schematic compositions; an illustrator could refine them
// later without changing the API (name -> figure).
import React from 'react';

const S = 'var(--seal)', G = 'var(--good)', W = 'var(--warn)', SOFT = 'var(--ink-soft)', LINE = 'var(--line-2)';

// 1. Looking up at the sky — horizon, sun, moon, a gnomon casting a shadow
const sky = (<g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
  <circle cx="52" cy="40" r="14" stroke={W} /><g stroke={W}><path d="M52 18v-7M52 69v-1M30 40h-7M81 40h-1M37 25l-4-4M67 25l4-4" /></g>
  <path d="M120 34a13 13 0 1 0 0 22 16 16 0 0 1 0-22z" stroke={S} />
  <path d="M16 92h128" stroke={SOFT} /><path d="M70 92V60M70 60l22 14" stroke={S} />
</g>);

// 2. The sun and moon's bargain — sun + moon meeting over an equals/handshake
const bargain = (<g fill="none" strokeWidth="2" strokeLinecap="round">
  <circle cx="44" cy="50" r="16" stroke={W} /><g stroke={W}><path d="M44 24v-6M44 82v-6M14 50h-6M80 50h-2M24 30l-4-4M64 30l4-4" /></g>
  <path d="M128 32a18 18 0 1 0 0 36 22 22 0 0 1 0-36z" stroke={S} />
  <path d="M70 46h24M70 56h24" stroke={SOFT} />
</g>);

// 3. The wheel of sixty names — concentric ring with ticks
const wheel = (<g fill="none" strokeLinecap="round">
  <circle cx="80" cy="56" r="40" stroke={LINE} strokeWidth="2" /><circle cx="80" cy="56" r="26" stroke={LINE} strokeWidth="1.5" />
  {Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return <line key={i} x1={80 + 40 * Math.cos(a)} y1={56 + 40 * Math.sin(a)} x2={80 + 33 * Math.cos(a)} y2={56 + 33 * Math.sin(a)} stroke={i % 3 === 0 ? S : SOFT} strokeWidth={i % 3 === 0 ? 2.5 : 1.5} />; })}
  <text x="80" y="62" textAnchor="middle" fontSize="18" fill={S} fontFamily="var(--font-serif)" stroke="none">甲子</text>
</g>);

// 4. The court of twelve officers — an archway with a seal
const court = (<g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M34 96V46a46 26 0 0 1 92 0v50" stroke={SOFT} />
  <path d="M48 96V52M112 96V52" stroke={SOFT} />
  <rect x="68" y="40" width="24" height="24" rx="4" fill={S} stroke="none" /><text x="80" y="58" textAnchor="middle" fontSize="15" fill="var(--on-seal)" fontFamily="var(--font-serif)" stroke="none">吉</text>
</g>);

// 5. Spirits, good and ill — two balanced roundels
const spirits = (<g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="52" cy="56" r="26" fill="var(--good-soft)" stroke={G} /><path d="M40 56l8 9 16-18" stroke={G} />
  <circle cx="116" cy="56" r="26" fill="var(--bad-soft)" stroke={W} /><path d="M106 46l20 20M126 46l-20 20" stroke={W} />
</g>);

// 6. Your turn — a small calendar with a chosen, starred day
const yourturn = (<g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <rect x="40" y="26" width="80" height="66" rx="6" stroke={SOFT} /><path d="M40 42h80M60 20v12M100 20v12" stroke={SOFT} />
  {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={56 + (i % 3) * 24} cy={56 + Math.floor(i / 3) * 18} r="3" fill={LINE} stroke="none" />)}
  <path d="M80 56l3.4 6.9 7.6.9-5.5 5.3 1.3 7.5L80 79l-6.8 3.5 1.3-7.5-5.5-5.3 7.6-.9z" fill={S} stroke="none" />
</g>);

const ILL = {
  sky: { t: ['抬头看天', 'Looking up at the sky'], body: sky },
  bargain: { t: ['太阳和月亮的约定', "The sun and moon's bargain"], body: bargain },
  wheel: { t: ['六十个名字的轮盘', 'The wheel of sixty names'], body: wheel },
  court: { t: ['十二神之庭', 'The court of twelve officers'], body: court },
  spirits: { t: ['吉神与凶煞', 'Spirits, good and ill'], body: spirits },
  yourturn: { t: ['轮到你了', 'Your turn'], body: yourturn },
};

export function Illustration({ name, lang = 'zh', size = 160, className, style }) {
  const il = ILL[name]; if (!il) return null;
  const title = lang === 'en' ? il.t[1] : il.t[0];
  return (
    <svg viewBox="0 0 160 110" width="100%" className={'a-illus ' + (className || '')} style={{ maxWidth: size, height: 'auto', display: 'block', ...style }} role="img" aria-label={title}>
      <title>{title}</title>
      {il.body}
    </svg>
  );
}

export const ILLUSTRATION_NAMES = Object.keys(ILL);
