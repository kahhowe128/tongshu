// SSR smoke: bundle App with esbuild, renderToString 4 states via props, assert anchors.
// Requires devDependencies (esbuild, react) — runs in CI / after `npm ci`.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let esbuild;
try { esbuild = require('esbuild'); } catch { console.log('SKIP ssr.test — esbuild not installed (run `npm ci` first; CI always runs this)'); process.exit(0); }
const React = require('react');
const { renderToString } = require('react-dom/server');
fs.mkdirSync('.cache', { recursive: true });
esbuild.buildSync({ entryPoints: ['src/App.jsx'], bundle: true, platform: 'node', format: 'cjs',
  outfile: '.cache/app.test.cjs', external: ['react', 'react-dom'], jsx: 'automatic', logLevel: 'silent' });
const App = require(process.cwd() + '/.cache/app.test.cjs').default;
const variants = [
  { name: 'find (default)', props: {}, expect: ['通書擇日', '择日', '学习', '日历'] },
  { name: 'find · calendar', props: { initialFindView: 'cal' }, expect: ['日历', '范围外日期变淡'] },
  { name: 'learn', props: { initialTab: 'learn' }, expect: ['快速上手', '词汇表', '历法源流', '天德', '协纪辨方书', '未纳入之神煞', '引擎自检'] },
  { name: 'learn · EN', props: { initialTab: 'learn', initialLang: 'en' }, expect: ['Quick start', 'Glossary', 'Heavenly stems', 'never definitive'] },
  { name: 'tools', props: { initialTab: 'tools' }, expect: ['引擎自检', '二十八宿'] },
];
let fail = 0;
for (const v of variants) {
  try {
    const html = renderToString(React.createElement(App, v.props));
    const miss = v.expect.filter(s => !html.includes(s));
    if (miss.length) { fail++; console.log(`❌ ${v.name} missing:`, miss); }
    else console.log(`✅ ${v.name} — ${html.length} chars, ${v.expect.length} anchors`);
  } catch (e) { fail++; console.log(`❌ ${v.name} THREW:`, e.message); }
}
process.exit(fail ? 1 : 0);
