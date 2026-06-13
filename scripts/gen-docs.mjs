// scripts/gen-docs.mjs — single source (docs/source.js) → src/docs.gen.js + public/guide/index.html
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const D = createRequire(import.meta.url)('../docs/source.cjs');

// ---- sanity on shapes ----
const pair = x => Array.isArray(x) && x.length === 2 && x.every(s => typeof s === 'string');
['what','not','method','privacy','src'].forEach(k => { if (!pair(D.ABOUT[k])) throw 'ABOUT.'+k; });
D.QUICK.concat(D.PERSONALIZE, D.TOOLS).forEach((s,i) => { if (!pair(s)) throw 'list '+i; });
D.READ.forEach(r => { if (!pair(r.k) || !pair(r.d)) throw 'READ'; });
['exact','graded','omitted','disclaimer'].forEach(k => { if (!pair(D.TRUST[k])) throw 'TRUST.'+k; });
D.FAQ.forEach(f => { if (!pair(f.q) || !pair(f.a)) throw 'FAQ'; });
D.HIST.forEach(h => { if (!pair(h.t) || !pair(h.p)) throw 'HIST'; });
const ids = new Set();
D.GLOSS.forEach(g => {
  if (ids.has(g.id)) throw 'dup id ' + g.id; ids.add(g.id);
  if (typeof g.cat !== 'number' || g.cat < 0 || g.cat >= D.GLOSS_CATS.length) throw 'cat ' + g.id;
  if (!g.zh || !g.py || !g.en || !pair(g.d)) throw 'gloss shape ' + g.id;
  if (g.g && !['H','M','略'].includes(g.g)) throw 'grade ' + g.id;
});
(D.CASES || []).forEach(c => {
  if (!c.id || !pair(c.title) || !pair(c.scenario) || !pair(c.reading)) throw 'CASE shape ' + (c.id || '?');
  if (!Array.isArray(c.steps) || !c.steps.length || !c.steps.every(pair)) throw 'CASE steps ' + c.id;
  if (c.note && !pair(c.note)) throw 'CASE note ' + c.id;
  if (c.links && (!Array.isArray(c.links) || !c.links.every(id => ids.has(id)))) throw 'CASE links ' + c.id;
});
console.log('shapes OK — gloss entries:', D.GLOSS.length, '| cats:', D.GLOSS_CATS.length, '| cases:', (D.CASES || []).length);

// ---- (1) in-app consts ----
const DOCS = { v: D.V, about: D.ABOUT, quick: D.QUICK, read: D.READ, personalize: D.PERSONALIZE, tools: D.TOOLS, trust: D.TRUST, faq: D.FAQ, hist: D.HIST, cases: D.CASES || [] };
let inapp = '// GENERATED from docs/source.js by scripts/gen-docs.mjs — single source; do not hand-edit.\n'
  + 'export const DOCS = ' + JSON.stringify(DOCS) + ';\n'
  + 'export const GLOSS_CATS = ' + JSON.stringify(D.GLOSS_CATS) + ';\n'
  + 'export const GLOSSARY = ' + JSON.stringify(D.GLOSS) + ';\n';
if (inapp.includes('`') || inapp.includes('${')) throw 'unsafe chars for splice';
fs.writeFileSync(path.join(__dirname, '../src/docs.gen.js'), inapp);

// ---- (3) HTML guide ----
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const bi = (p, tag) => `<${tag||'p'} class="zh">${esc(p[0])}</${tag||'p'}><${tag||'p'} class="en">${esc(p[1])}</${tag||'p'}>`;
const h2 = (zh, en, id) => `<h2 id="${id}"><span class="hz">${esc(zh)}</span><span class="he">${esc(en)}</span></h2>`;
const pill = g => g ? `<span class="pill ${g==='H'?'ph':g==='M'?'pm':'po'}">${g}</span>` : '';

const toc = [
  ['about','关于本应用','About'],['quick','快速上手','Quick start'],['read','读懂一天','Reading a day'],
  ['cases','用例','Examples'],['personalize','个人化','Personalize'],['tools','工具','Tools'],['trust','信任与边界','Trust & limits'],
  ['faq','常见问题','FAQ'],['hist','历法源流','How the calendar science came about'],['gloss','词汇表','Glossary'],
];

let body = '';
body += `<section id="about">${h2('关于本应用','About this app','about')}${bi(D.ABOUT.what)}${bi(D.ABOUT.not)}<h3>方法 <i>Method</i></h3>${bi(D.ABOUT.method)}<h3>隐私 <i>Privacy</i></h3>${bi(D.ABOUT.privacy)}<p class="src">${esc(D.ABOUT.src[0])}<br>${esc(D.ABOUT.src[1])}</p></section>`;
body += `<section id="quick">${h2('快速上手','Quick start','quick')}<ol>${D.QUICK.map(s=>`<li>${bi(s,'span')}</li>`).join('')}</ol></section>`;
body += `<section id="read">${h2('读懂一天','Reading a day page','read')}<p class="note zh">日页自上而下的每个元素：</p><p class="note en">Every element of the day sheet, top to bottom:</p><dl>${D.READ.map(r=>`<dt>${esc(r.k[0])} <i>${esc(r.k[1])}</i></dt><dd>${bi(r.d,'span')}</dd>`).join('')}</dl></section>`;
body += `<section id="cases">${h2('用例','Examples','cases')}<p class="note zh">跟着真实场景走一遍，看工具如何帮你择日。</p><p class="note en">Walk real scenarios end-to-end to see how the tool helps.</p>${(D.CASES||[]).map(c=>`<h3>${esc(c.title[0])} <i>${esc(c.title[1])}</i></h3><p class="note zh">${esc(c.scenario[0])}</p><p class="note en">${esc(c.scenario[1])}</p><ol>${c.steps.map(s=>`<li>${bi(s,'span')}</li>`).join('')}</ol><p class="zh"><b>解读：</b>${esc(c.reading[0])}</p><p class="en"><b>Reading: </b>${esc(c.reading[1])}</p>${c.note?`<div class="omit">${bi(c.note)}</div>`:''}`).join('')}</section>`;
body += `<section id="personalize">${h2('个人化','Personalize','personalize')}<ul>${D.PERSONALIZE.map(s=>`<li>${bi(s,'span')}</li>`).join('')}</ul></section>`;
body += `<section id="tools">${h2('工具','Tools','tools')}<ul>${D.TOOLS.map(s=>`<li>${bi(s,'span')}</li>`).join('')}</ul></section>`;
body += `<section id="trust">${h2('信任与边界','Trust & limits','trust')}${bi(D.TRUST.exact)}${bi(D.TRUST.graded)}<div class="omit">${bi(D.TRUST.omitted)}</div><div class="disc">${bi(D.TRUST.disclaimer)}</div></section>`;
body += `<section id="faq">${h2('常见问题','FAQ','faq')}${D.FAQ.map(f=>`<h3>${esc(f.q[0])} <i>${esc(f.q[1])}</i></h3>${bi(f.a)}`).join('')}</section>`;
body += `<section id="hist">${h2('历法源流','How the calendar science came about','hist')}${D.HIST.map(h=>`<h3>${esc(h.t[0])} <i>${esc(h.t[1])}</i></h3>${bi(h.p)}`).join('')}</section>`;
body += `<section id="gloss">${h2('词汇表','Glossary','gloss')}<p class="note zh">H＝高置信（诸书一致），M＝中置信（版本或异），略＝未纳入计分；词条附典籍出处。</p><p class="note en">H = high confidence (cross-source consensus), M = medium (versions vary), 略 = omitted from scoring; entries carry source attributions.</p>`;
D.GLOSS_CATS.forEach((c, ci) => {
  const items = D.GLOSS.filter(g => g.cat === ci);
  body += `<h3 class="gcat">${esc(c[0])} <i>${esc(c[1])}</i></h3><table class="gt"><thead><tr><th class="c1">术语 Term</th><th>释义 Meaning</th><th class="c3">级</th></tr></thead><tbody>`;
  items.forEach(g => {
    body += `<tr id="gl-${g.id}"><td class="c1"><b>${esc(g.zh)}</b><br><span class="py">${esc(g.py)}</span><br><span class="ge">${esc(g.en)}</span></td><td><span class="zh">${esc(g.d[0])}</span><br><span class="en">${esc(g.d[1])}</span>${g.src?`<br><span class="src">出处 Source: ${esc(g.src)}</span>`:''}</td><td class="c3">${pill(g.g)}</td></tr>`;
  });
  body += `</tbody></table>`;
});
body += `</section>`;

const html = `<!doctype html>
<html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(D.V.title[0])} · ${esc(D.V.title[1])}</title>
<meta name="description" content="通书择日使用指南：快速上手、读懂一天、信任与边界、历法源流与完整词汇表。Bilingual user guide for the Tong Shu Date Selector.">
<style>
:root{--ink:#26211c;--soft:#5c544a;--faint:#8b8276;--line:#e3dcd0;--seal:#a8432f;--paper:#faf6ee;--good:#2e6f4e;--warn:#9a6a1f;}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.7 "Noto Serif CJK SC","Noto Serif SC","Songti SC","SimSun",serif;}
.wrap{max-width:820px;margin:0 auto;padding:32px 22px 64px;}
header{border-bottom:3px double var(--seal);padding-bottom:18px;margin-bottom:22px;display:flex;gap:16px;align-items:center;}
.sealbox{flex:none;width:64px;height:64px;background:var(--seal);border-radius:10px;color:#fff;display:grid;grid-template-columns:1fr 1fr;place-items:center;font-size:22px;font-weight:700;line-height:1;padding:6px;}
h1{margin:0;font-size:24px}h1 .e{display:block;font-size:13px;color:var(--soft);font-weight:400;letter-spacing:.04em}
.meta{color:var(--faint);font-size:12px;margin-top:4px}
nav.toc{columns:2;gap:24px;font-size:13.5px;margin:14px 0 6px;}nav.toc a{display:block;color:var(--ink);text-decoration:none;padding:3px 0;border-bottom:1px dotted var(--line);}nav.toc a i{color:var(--faint);font-style:normal;font-size:11.5px;margin-left:6px;}
h2{font-size:19px;border-left:4px solid var(--seal);padding-left:10px;margin:34px 0 10px;}h2 .he{display:block;font-size:12px;color:var(--faint);font-weight:400;letter-spacing:.05em;}
h3{font-size:15px;margin:18px 0 6px;}h3 i,dt i{color:var(--faint);font-style:normal;font-size:12px;font-weight:400;margin-left:6px;}
p{margin:7px 0}.en{color:var(--soft);font-size:13px;font-family:Georgia,"Times New Roman",serif;}
ol,ul{padding-left:22px;margin:8px 0}li{margin:7px 0}li .zh{display:block}li .en{display:block}
dl{margin:8px 0}dt{font-weight:700;margin-top:12px}dd{margin:2px 0 0 0}dd .zh{display:block}dd .en{display:block}
.note{color:var(--soft);font-size:13px}
.omit{border:1px solid var(--line);border-left:4px solid var(--warn);background:#fff;border-radius:8px;padding:10px 14px;margin:12px 0;}
.disc{border:1px dashed var(--seal);color:var(--seal);border-radius:8px;padding:9px 14px;margin:12px 0;font-weight:600;}
.src{color:var(--faint);font-size:12px;}
table.gt{width:100%;border-collapse:collapse;margin:8px 0 18px;font-size:13.5px;background:#fff;}
.gt th,.gt td{border:1px solid var(--line);padding:8px 10px;vertical-align:top;text-align:left;}
.gt thead th{background:#f2ecdf;font-size:12px;letter-spacing:.06em;}
.gt .c1{width:24%}.gt .c3{width:7%;text-align:center}.py{color:var(--faint);font-size:12px}.ge{color:var(--soft);font-size:12px;font-family:Georgia,serif}
.pill{display:inline-block;font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;border:1px solid;}
.ph{color:var(--good);border-color:var(--good)}.pm{color:var(--warn);border-color:var(--warn)}.po{color:var(--faint);border-color:var(--faint)}
.gcat{background:#f2ecdf;border-radius:6px;padding:5px 10px;}
footer{margin-top:40px;border-top:3px double var(--seal);padding-top:14px;color:var(--soft);font-size:12.5px;}
tr:target{outline:2px solid var(--seal);outline-offset:-2px;}
@media print{
 @page{size:A4;margin:16mm 15mm;}
 body{background:#fff;font-size:11.5pt}.wrap{max-width:none;padding:0}
 nav.toc a{border:0}section{break-inside:auto}h2{break-after:avoid;margin-top:22px}h3{break-after:avoid}
 .gt tr{break-inside:avoid}.sealbox{print-color-adjust:exact;-webkit-print-color-adjust:exact}
 #quick,#cases,#trust,#hist,#gloss{break-before:page}
}
</style></head><body><div class="wrap">
<header><div class="sealbox"><span>通</span><span>書</span><span>擇</span><span>日</span></div>
<div><h1>${esc(D.V.title[0])}<span class="e">${esc(D.V.title[1])}</span></h1>
<div class="meta">版本 Version ${esc(D.V.ver)} · ${esc(D.V.date)} · 中文／English · 可直接打印 Print-ready (A4) · <a href="tongshu-guide.pdf" style="color:var(--seal)">⬇ PDF</a></div></div></header>
<nav class="toc">${toc.map(t=>`<a href="#${t[0]}">${esc(t[1])}<i>${esc(t[2])}</i></a>`).join('')}</nav>
${body}
<footer><p>${esc(D.TRUST.disclaimer[0])}<br>${esc(D.TRUST.disclaimer[1])}</p>
<p class="src">${esc(D.ABOUT.src[0])}<br>${esc(D.ABOUT.src[1])}</p></footer>
</div></body></html>`;
const guideDir = path.join(__dirname, '../public/guide');
fs.mkdirSync(guideDir, { recursive: true });
fs.writeFileSync(path.join(guideDir, 'index.html'), html);
console.log('wrote src/docs.gen.js', inapp.length, '| public/guide/index.html', html.length);
