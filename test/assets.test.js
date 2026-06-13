// Asset lint (Phase 3 WS-2): every SVG carries a <title>; icons inherit currentColor;
// nothing external or raster; the system covers tabs / categories / verdicts / actions / diagrams.
import fs from 'node:fs';
let fail = 0; const bad = m => { fail++; console.log('❌', m); };
const files = ['src/assets/icons.jsx', 'src/assets/diagrams.jsx', 'src/assets/illustrations.jsx'];
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const svgs = (t.match(/<svg[\s>]/g) || []).length;
  const titles = (t.match(/<title>/g) || []).length;
  if (svgs === 0) bad(`${f}: no <svg>`);
  if (titles < svgs) bad(`${f}: ${svgs} <svg> but ${titles} <title> — every SVG needs a <title>`);
  if (/https?:\/\//.test(t)) bad(`${f}: external URL present — assets must be fully offline`);
  if (/<img\b/.test(t)) bad(`${f}: <img> present — use inline SVG`);
  if (/(?:stroke|fill)\s*=\s*"#[0-9a-fA-F]{3,8}"/.test(t)) bad(`${f}: hard-coded hex colour — use currentColor / theme vars (themeable)`);
}
const icons = fs.readFileSync('src/assets/icons.jsx', 'utf8');
if (!icons.includes('currentColor')) bad('icons.jsx: icons must inherit currentColor');
['home', 'find', 'calendar', 'learn', 'academy', 'tools', 'settings', 'save', 'share', 'export', 'catHealth', 'catMarriage', 'catInauspicious', 'vGood', 'vBad'].forEach(n => { if (!new RegExp('\\b' + n + ':').test(icons)) bad(`icons.jsx: missing icon "${n}"`); });
const diagrams = fs.readFileSync('src/assets/diagrams.jsx', 'utf8');
['wuxing', 'jianchu', 'ganzhi', 'mansion', 'leap', 'daypage'].forEach(n => { if (!new RegExp('\\b' + n + ':').test(diagrams)) bad(`diagrams.jsx: missing diagram "${n}"`); });
const illus = fs.readFileSync('src/assets/illustrations.jsx', 'utf8');
['sky', 'bargain', 'wheel', 'court', 'spirits', 'yourturn'].forEach(n => { if (!new RegExp('\\b' + n + ':').test(illus)) bad(`illustrations.jsx: missing illustration "${n}"`); });
// WS-4: any video embed must be the privacy-friendly youtube-nocookie iframe, loaded lazily
const app = fs.readFileSync('src/App.jsx', 'utf8');
if (/youtube/i.test(app)) {
  if (/youtube\.com\/embed/i.test(app)) bad('App.jsx: use youtube-nocookie.com, not youtube.com/embed');
  if (!/youtube-nocookie\.com/.test(app)) bad('App.jsx: youtube embeds must use youtube-nocookie.com');
  if (!/loading="lazy"|loading={['"]lazy/.test(app)) bad('App.jsx: youtube embeds must be lazy (loading="lazy")');
}
console.log(fail ? `${fail} problem(s)` : '✅ assets lint clean — every SVG titled; icons currentColor; no external/raster refs; youtube-nocookie lazy embed only');
process.exit(fail ? 1 : 0);
