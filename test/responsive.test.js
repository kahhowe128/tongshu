// Responsive shell gate (Phase 4 WS-5): the persistent desktop nav AND the mobile tab bar both render,
// and every primary route SSRs without throwing. CSS decides which nav is visible per breakpoint.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let esbuild;
try { esbuild = require('esbuild'); } catch { console.log('SKIP responsive.test — esbuild not installed (CI always runs this)'); process.exit(0); }
const React = require('react');
const { renderToString } = require('react-dom/server');
fs.mkdirSync('.cache', { recursive: true });
esbuild.buildSync({ entryPoints: ['src/App.jsx'], bundle: true, platform: 'node', format: 'cjs', outfile: '.cache/app.resp.cjs', external: ['react', 'react-dom'], jsx: 'automatic', logLevel: 'silent' });
const App = require(process.cwd() + '/.cache/app.resp.cjs').default;

let fail = 0; const bad = m => { fail++; console.log('❌', m); };
// each route must render, and carry its stable screen class (proves the screen — not just the nav — rendered)
const routes = [
  { tab: 'home', cls: 'a-home' },
  { tab: 'find', cls: 'a-find' },
  { tab: 'academy', cls: 'a-academy' },
  { tab: 'videos', cls: 'a-videos' },
  { tab: 'articles', cls: 'a-articles' },
  { tab: 'tools', cls: 'a-screen' },
  { tab: 'learn', cls: 'a-screen' },
];
for (const r of routes) {
  let html = '';
  try { html = renderToString(React.createElement(App, { initialTab: r.tab })); }
  catch (e) { bad(`route ${r.tab} threw: ${e.message}`); continue; }
  if (!html.includes('a-dnav')) bad(`route ${r.tab}: persistent desktop nav (a-dnav) missing`);
  if (!html.includes('a-tabs')) bad(`route ${r.tab}: mobile tab bar (a-tabs) missing`);
  if (!html.includes(r.cls)) bad(`route ${r.tab}: screen class "${r.cls}" missing`);
}
// the desktop nav must list the primary sections (bilingual labels present)
const home = renderToString(React.createElement(App, { initialTab: 'home' }));
['首页', '黄历', '学堂', '视频', '文章', '工具', '关于'].forEach(s => { if (!home.includes(s)) bad(`desktop nav missing label: ${s}`); });
console.log(fail ? `${fail} problem(s)` : '✅ responsive gate clean — desktop nav + mobile tabs both render; Home/Calendar/Academy/Videos/Articles/Tools/About SSR without throwing');
process.exit(fail ? 1 : 0);
