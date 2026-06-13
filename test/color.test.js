// WCAG AA gate on every used token pair, all 3 themes; CVD distinguishability report (Machado 2009).
import { TOKENS } from '../src/design/tokens.js';
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lum = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const CR = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const PAIRS = [
  ['ink','bg',4.5],['ink','surface',4.5],['ink','surface2',4.5],
  ['inkSoft','surface',4.5],['inkSoft','surface2',4.5],
  ['inkFaint','surface',4.5],['inkFaint','surface2',4.5],['inkFaint','bg',4.5],
  ['good','goodSoft',4.5],['good','surface',4.5],['good','surface2',4.5],
  ['bad','badSoft',4.5],['bad','surface',4.5],['bad','surface2',4.5],
  ['warn','warnSoft',4.5],['warn','surface',4.5],['warn','surface2',4.5],
  ['neutral','neutralSoft',4.5],['neutral','surface',4.5],
  ['onSeal','seal',4.5],['seal','surface',4.5],['seal','surface2',4.5],
  ['line2','surface',1.6],['lineStrong','surface',3.0],['focus','surface',3.0],
];
let fails = 0;
for (const th of ['light','dark','contrast','red']) {
  const t = TOKENS[th]; const bad = [];
  let worst = null;
  for (const [fg, bg, min] of PAIRS) {
    if (!t[fg] || !t[bg] || t[fg][0] !== '#' || t[bg][0] !== '#') continue;
    const r = CR(t[fg], t[bg]);
    if (r < min) { fails++; bad.push(`${fg}/${bg}=${r.toFixed(2)}`); }
    if (min === 4.5 && (!worst || r < worst.r)) worst = { p: fg + '/' + bg, r };
  }
  console.log(`[${th}] ${bad.length ? 'FAILS: ' + bad.join(', ') : 'ALL PASS'} (worst text pair ${worst.p} ${worst.r.toFixed(2)}:1)`);
}
const M = {
  protan: [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
  deutan: [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
  tritan: [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
};
const lab = sr => { const [r,g,b] = sr.map(c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  const l = Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b), m = Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b), s = Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  return [0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s]; };
const g2s = c => c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c, 1/2.4) - 0.055;
const sim = (h, m) => { const [r,g,b] = rgb(h).map(lin); return m.map(row => g2s(Math.min(1, Math.max(0, row[0]*r+row[1]*g+row[2]*b)))); };
const dE = (a,b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
const minPair = L => { let m = 1e9; for (let i = 0; i < L.length; i++) for (let j = i+1; j < L.length; j++) m = Math.min(m, dE(L[i], L[j])); return m.toFixed(3); };
for (const th of ['light','dark','contrast','red']) {
  const t = TOKENS[th]; const set = ['good','bad','warn','neutral'].map(k => t[k]);
  const out = Object.entries(M).map(([n,m]) => `${n}=${minPair(set.map(h => lab(sim(h, m))))}`).join(' ');
  console.log(`[${th}] CVD min ΔE: ${out}`);
}
process.exit(fails ? 1 : 0);
