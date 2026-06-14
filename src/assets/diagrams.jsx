// Educational diagrams (Phase 3 WS-2) — inline, themeable SVG (theme tokens + currentColor),
// print-safe, each with a <title> for a11y. Consumed by the Academy (WS-1) and the guide.
// Schematic by design; marked TODO where the art could later be refined.
import React from 'react';

// colourful palette (Phase 5) — uses the vivid per-theme --ill-* accents so diagrams pop yet still theme
const VAR = { ink: 'currentColor', soft: 'var(--ink-soft)', faint: 'var(--ill-ink)', line: 'var(--line-2)', seal: 'var(--ill-cinnabar)', good: 'var(--ill-jade)', bad: 'var(--ill-terra)', warn: 'var(--ill-gold)', plum: 'var(--ill-plum)' };
const cx = 100, cy = 100;
const onCircle = (r, deg) => [cx + r * Math.cos((deg - 90) * Math.PI / 180), cy + r * Math.sin((deg - 90) * Math.PI / 180)];

// 五行 generating (sheng, green ring) + overcoming (ke, red star)
function Wuxing() {
  const els = ['木', '火', '土', '金', '水'];
  const pts = els.map((_, i) => onCircle(74, i * 72));
  const line = (a, b, stroke) => <line key={a + '-' + b + stroke} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={stroke} strokeWidth="1.6" />;
  return (<>
    {els.map((_, i) => line(i, (i + 1) % 5, VAR.good))}
    {els.map((_, i) => line(i, (i + 2) % 5, VAR.bad))}
    {pts.map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r="15" fill="var(--surface)" stroke={VAR.seal} strokeWidth="1.6" /><text x={p[0]} y={p[1] + 5} textAnchor="middle" fontSize="15" fill={VAR.ink} fontFamily="var(--font-serif)">{els[i]}</text></g>)}
  </>);
}

// 建除十二神 cycle — 12 officers,黄道(good)/黑道(warn) coloured
function JianchuCycle() {
  const offs = '建除满平定执破危成收开闭'.split('');
  const bright = [1, 4, 5, 8, 9, 10]; // 除定执成开 + 危 family (schematic)
  return (<>{offs.map((o, i) => { const [x, y] = onCircle(76, i * 30); const good = bright.includes(i); return (<g key={i}><circle cx={x} cy={y} r="13" fill={good ? 'var(--ill-jadeSoft)' : 'var(--ill-goldSoft)'} stroke={good ? VAR.good : VAR.warn} strokeWidth="1.4" /><text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill={good ? VAR.good : VAR.warn} fontFamily="var(--font-serif)">{o}</text></g>); })}<circle cx={cx} cy={cy} r="30" fill="none" stroke={VAR.line} strokeWidth="1" strokeDasharray="3 3" /></>);
}

// 60 甲子 wheel — 10 stems (outer) × 12 branches (inner)
function GanzhiWheel() {
  const stems = '甲乙丙丁戊己庚辛壬癸'.split(''), branches = '子丑寅卯辰巳午未申酉戌亥'.split('');
  return (<>
    <circle cx={cx} cy={cy} r="86" fill="none" stroke={VAR.line} strokeWidth="1" />
    <circle cx={cx} cy={cy} r="56" fill="none" stroke={VAR.line} strokeWidth="1" />
    {stems.map((s, i) => { const [x, y] = onCircle(86, i * 36); return <text key={'s' + i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={VAR.seal} fontFamily="var(--font-serif)">{s}</text>; })}
    {branches.map((b, i) => { const [x, y] = onCircle(56, i * 30); return <text key={'b' + i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={VAR.soft} fontFamily="var(--font-serif)">{b}</text>; })}
    <text x={cx} y={cy + 5} textAnchor="middle" fontSize="20" fill={VAR.ink} fontFamily="var(--font-serif)">60</text>
  </>);
}

// 28 宿 ⇄ 七曜 ring — 28 ticks in 4 groups, luminary markers
function MansionRing() {
  const yao = '日月火水木金土'.split('');
  return (<><circle cx={cx} cy={cy} r="80" fill="none" stroke={VAR.line} strokeWidth="1" />
    {Array.from({ length: 28 }, (_, i) => { const [x1, y1] = onCircle(74, i * (360 / 28)); const [x2, y2] = onCircle(86, i * (360 / 28)); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 7 === 0 ? VAR.seal : VAR.faint} strokeWidth={i % 7 === 0 ? '2' : '1'} />; })}
    {yao.map((y, i) => { const [x, yy] = onCircle(52, i * (360 / 7)); return <text key={i} x={x} y={yy + 4} textAnchor="middle" fontSize="12" fill={VAR.soft} fontFamily="var(--font-serif)">{y}</text>; })}
  </>);
}

// 无中气置闰 — month timeline; the month with no 中气 becomes leap
function LeapDiagram() {
  const months = [0, 1, 2, 3, 4, 5];
  return (<>
    <line x1="14" y1="60" x2="226" y2="60" stroke={VAR.line} strokeWidth="1.5" />
    {months.map(m => { const x = 28 + m * 36; const leap = m === 3; return (<g key={m}>
      <rect x={x - 14} y="46" width="28" height="28" rx="4" fill={leap ? 'var(--ill-goldSoft)' : 'var(--surface-2)'} stroke={leap ? VAR.warn : VAR.line} strokeWidth="1.4" />
      {!leap && <circle cx={x} cy="36" r="3" fill={VAR.seal} />}
      <text x={x} y="64" textAnchor="middle" fontSize="11" fill={leap ? VAR.warn : VAR.soft} fontFamily="var(--font-serif)">{leap ? '闰' : '中'}</text>
    </g>); })}
    <text x="120" y="96" textAnchor="middle" fontSize="11" fill={VAR.faint}>● = 中气 · 无中气之月置闰 / month without a zhongqi becomes leap</text>
  </>);
}

// annotated day-page — schematic of a day sheet with callouts
function DayPage() {
  const rows = [['干支 ganzhi', VAR.seal], ['建除 officer', VAR.ink], ['宿 mansion', VAR.ink], ['神煞 spirits', VAR.warn], ['时辰 hours', VAR.good]];
  return (<><rect x="14" y="14" width="212" height="172" rx="8" fill="var(--surface)" stroke={VAR.line} strokeWidth="1.5" />
    <rect x="14" y="14" width="212" height="34" rx="8" fill="var(--good-soft)" /><text x="26" y="36" fontSize="14" fill={VAR.good} fontFamily="var(--font-serif)">✓ 宜 / Favorable</text>
    {rows.map((r, i) => (<g key={i}><line x1="26" y1={64 + i * 24} x2="214" y2={64 + i * 24} stroke={VAR.line} strokeWidth="0.8" /><text x="26" y={60 + i * 24} fontSize="11" fill={r[1]} fontFamily="var(--font-serif)">{r[0]}</text></g>))}
  </>);
}

const D = {
  wuxing: { t: ['五行生克', 'Five phases: generating & overcoming'], vb: '0 0 200 200', body: <Wuxing /> },
  jianchu: { t: ['建除十二神', 'The twelve day-officers'], vb: '0 0 200 200', body: <JianchuCycle /> },
  ganzhi: { t: ['六十甲子', 'The sexagenary wheel'], vb: '0 0 200 200', body: <GanzhiWheel /> },
  mansion: { t: ['二十八宿与七曜', '28 mansions and the seven luminaries'], vb: '0 0 200 200', body: <MansionRing /> },
  leap: { t: ['无中气置闰', 'The no-zhongqi leap-month rule'], vb: '0 0 240 110', body: <LeapDiagram /> },
  daypage: { t: ['一日通书页', 'A day-sheet, annotated'], vb: '0 0 240 200', body: <DayPage /> },
};

export function Diagram({ name, lang = 'zh', size = 200, className, style }) {
  const d = D[name]; if (!d) return null;
  const title = lang === 'en' ? d.t[1] : d.t[0];
  return (
    <figure className={'a-figure ' + (className || '')} style={style} role="group" aria-label={title}>
      <svg viewBox={d.vb} width="100%" style={{ maxWidth: size, height: 'auto', display: 'block', margin: '0 auto' }} fill="none">
        <title>{title}</title>
        {d.body}
      </svg>
      <figcaption className="a-figcap">{lang === 'en' ? d.t[1] : d.t[0]}</figcaption>
    </figure>
  );
}

export const DIAGRAM_NAMES = Object.keys(D);
