// Spot illustrations (Phase 5 redesign) — colourful, layered art driven by the per-theme --ill-*
// accent palette (no raw hex, no external assets, no realistic likenesses). Each <svg> has a <title>.
// Vivid in the warm light theme; adapts to dark / contrast / 红运. API unchanged: name -> figure.
import React from 'react';

const C = 'var(--ill-cinnabar)', J = 'var(--ill-jade)', G = 'var(--ill-gold)', T = 'var(--ill-terra)', P = 'var(--ill-plum)',
  INK = 'var(--ill-ink)', PAPER = 'var(--ill-paper)', JS = 'var(--ill-jadeSoft)', GS = 'var(--ill-goldSoft)', TS = 'var(--ill-terraSoft)', PS = 'var(--ill-plumSoft)';
const SERIF = 'var(--font-serif)';

const ticks = (cx, cy, r1, r2, col) => Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={col} strokeWidth="1.8" strokeLinecap="round" />; });
const blossom = (cx, cy, r, k) => <g key={k}>{Array.from({ length: 5 }, (_, i) => { const a = i * 72 * Math.PI / 180; return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={r * 0.8} fill={C} />; })}<circle cx={cx} cy={cy} r={r * 0.5} fill={G} /></g>;
const sun = (cx, cy, r) => <g><circle cx={cx} cy={cy} r={r * 1.7} fill={GS} /><circle cx={cx} cy={cy} r={r} fill={G} /><g stroke={T} strokeWidth="2.2" strokeLinecap="round">{Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return <line key={i} x1={cx + (r + 3) * Math.cos(a)} y1={cy + (r + 3) * Math.sin(a)} x2={cx + (r + 8) * Math.cos(a)} y2={cy + (r + 8) * Math.sin(a)} />; })}</g></g>;

// chapter figures
const sky = (<g fill="none">{sun(46, 46, 15)}<path d="M118 30 a16 16 0 1 0 0 30 20 20 0 0 1 0-30z" fill={P} /><line x1="16" y1="88" x2="144" y2="88" stroke={J} strokeWidth="3" strokeLinecap="round" /><path d="M72 88 V60 l18 12" fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" /></g>);
const bargain = (<g fill="none">{sun(44, 55, 15)}<path d="M128 38 a18 18 0 1 0 0 36 22 22 0 0 1 0-36z" fill={P} /><g stroke={J} strokeWidth="2.6" strokeLinecap="round"><line x1="74" y1="50" x2="96" y2="50" /><line x1="74" y1="62" x2="96" y2="62" /></g></g>);
const wheel = (<g fill="none"><circle cx="80" cy="55" r="40" fill={PAPER} stroke={J} strokeWidth="6" /><circle cx="80" cy="55" r="26" stroke={G} strokeWidth="2" />{ticks(80, 55, 30, 36, G)}<text x="80" y="62" textAnchor="middle" fontSize="18" fill={C} fontFamily={SERIF}>甲子</text></g>);
const court = (<g fill="none"><circle cx="80" cy="22" r="4" fill={G} /><path d="M34 96 V52 a46 26 0 0 1 92 0 V96" stroke={C} strokeWidth="3" strokeLinejoin="round" /><path d="M50 96 V58 M110 96 V58" stroke={C} strokeWidth="2.4" /><rect x="66" y="44" width="28" height="28" rx="5" fill={C} /><text x="80" y="63" textAnchor="middle" fontSize="16" fill={PAPER} fontFamily={SERIF}>吉</text></g>);
const spirits = (<g fill="none"><circle cx="54" cy="55" r="26" fill={JS} stroke={J} strokeWidth="2.6" /><path d="M42 55 l8 9 16-18" stroke={J} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="112" cy="55" r="26" fill={TS} stroke={C} strokeWidth="2.6" /><path d="M102 45 l20 20 M122 45 l-20 20" stroke={C} strokeWidth="3" strokeLinecap="round" /></g>);
const yourturn = (<g fill="none"><rect x="40" y="26" width="80" height="66" rx="8" fill={GS} stroke={INK} strokeWidth="2" /><path d="M40 44 h80 M60 20 v12 M100 20 v12" stroke={INK} strokeWidth="2" strokeLinecap="round" />{[0, 1, 2, 3].map(i => <circle key={i} cx={56 + (i % 3) * 24} cy={58 + Math.floor(i / 3) * 18} r="3" fill={i % 2 ? J : G} />)}<path d="M80 58 l3.4 6.9 7.6.9-5.5 5.3 1.3 7.5L80 81l-6.8 3.5 1.3-7.5-5.5-5.3 7.6-.9z" fill={C} /></g>);

// big hero scene for the home
const hero = (<g fill="none"><circle cx="110" cy="86" r="78" fill={GS} />{sun(50, 46, 15)}<path d="M178 44 a17 17 0 1 0 0 30 21 21 0 0 1 0-30z" fill={P} /><circle cx="110" cy="92" r="50" fill={PAPER} stroke={J} strokeWidth="7" /><circle cx="110" cy="92" r="33" stroke={G} strokeWidth="2" />{ticks(110, 92, 37, 44, G)}<text x="110" y="100" textAnchor="middle" fontSize="22" fill={C} fontFamily={SERIF}>甲子</text><path d="M86 150 q14 -34 44 -56" stroke={J} strokeWidth="3" strokeLinecap="round" />{blossom(112, 100, 5, 'b1')}{blossom(95, 122, 4, 'b2')}<circle cx="40" cy="120" r="3" fill={C} /><circle cx="186" cy="110" r="3" fill={G} /></g>);

const ILL = {
  sky: { t: ['抬头看天', 'Looking up at the sky'], vb: '0 0 160 110', body: sky },
  bargain: { t: ['太阳和月亮的约定', "The sun and moon's bargain"], vb: '0 0 160 110', body: bargain },
  wheel: { t: ['六十个名字的轮盘', 'The wheel of sixty names'], vb: '0 0 160 110', body: wheel },
  court: { t: ['十二神之庭', 'The court of twelve officers'], vb: '0 0 160 110', body: court },
  spirits: { t: ['吉神与凶煞', 'Spirits, good and ill'], vb: '0 0 160 110', body: spirits },
  yourturn: { t: ['轮到你了', 'Your turn'], vb: '0 0 160 110', body: yourturn },
  hero: { t: ['通书择日', 'The Chinese almanac'], vb: '0 0 220 168', body: hero },
};

export function Illustration({ name, lang = 'zh', size = 160, className, style }) {
  const il = ILL[name]; if (!il) return null;
  const title = lang === 'en' ? il.t[1] : il.t[0];
  return (
    <svg viewBox={il.vb} width="100%" className={'a-illus ' + (className || '')} style={{ maxWidth: size, height: 'auto', display: 'block', ...style }} role="img" aria-label={title}>
      <title>{title}</title>
      {il.body}
    </svg>
  );
}

export const ILLUSTRATION_NAMES = Object.keys(ILL);
