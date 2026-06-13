// Docs ↔ engine contract: every scored 神煞 has a glossary entry with matching grade;
// the omitted list mirrors the engine's omission flags; deep-link ids resolve.
import { SHENSHA_RULES } from '../src/engine/tongshu.js';
import { DOCS, GLOSSARY } from '../src/docs.gen.js';
let fail = 0; const bad = m => { fail++; console.log('❌', m); };
const keys = Object.keys(SHENSHA_RULES);
keys.forEach(k => {
  const g = GLOSSARY.find(e => e.zh === k || e.zh.split('·').includes(k) || e.zh.split('／').includes(k));
  if (!g) return bad(`scored 神煞 missing from glossary: ${k}`);
  if (g.g !== SHENSHA_RULES[k].grade) bad(`grade mismatch ${k}: engine=${SHENSHA_RULES[k].grade} gloss=${g.g}`);
});
const omitText = DOCS.trust.omitted.join(' ') + ' ' + (GLOSSARY.find(e => e.id === 'omit') || { d: [''] }).d.join(' ');
['胎神','不将','周堂','山向','墓运','财神','福神','贵神','时家','天愿','月恩','时德','五合','鸣吠','游祸','五墓','月刑']
  .forEach(n => { if (!omitText.includes(n)) bad(`omitted-list missing noun: ${n}`); });
if (!(omitText.includes('大耗') || omitText.includes('大小耗'))) bad('omitted-list missing 大耗/小耗');
keys.forEach(k => { if (omitText.includes(k) && k !== '土王用事') bad(`scored 神煞 listed as omitted: ${k}`); });
['wuxing','ss'].forEach(id => { if (!GLOSSARY.find(e => e.id === id)) bad(`popover gid unresolved: ${id}`); });
const allTxt = JSON.stringify(GLOSSARY);
['建除满平定执破危成收开闭'.split(''), ['青龙','明堂','天刑','朱雀','金匮','天德','白虎','玉堂','天牢','玄武','司命','勾陈']]
  .flat().forEach(n => { if (!allTxt.includes(n)) bad(`officer/path-god missing: ${n}`); });
// CASES (Phase 2 Feature 4): shape, glossary deep-links resolve, omitted caveats present
const cases = DOCS.cases || [];
if (cases.length < 5) bad(`CASES too few: expected ≥5, got ${cases.length}`);
const glossIds = new Set(GLOSSARY.map(g => g.id));
cases.forEach(c => {
  ['id', 'title', 'scenario', 'steps', 'reading'].forEach(k => { if (!c[k]) bad(`case ${c.id || '?'} missing ${k}`); });
  if (!Array.isArray(c.steps) || !c.steps.length) bad(`case ${c.id} has no steps`);
  const links = c.links || [];
  if (!links.some(id => glossIds.has(id))) bad(`case ${c.id} references no valid glossary id`);
  links.forEach(id => { if (!glossIds.has(id)) bad(`case ${c.id} bad glossary id: ${id}`); });
});
['wedding', 'burial'].forEach(id => { const c = cases.find(x => x.id === id); if (!c) return bad(`missing case: ${id}`); const txt = JSON.stringify(c); if (!txt.includes('未纳入')) bad(`case ${id} missing 未纳入 caveat`); if (!/omitted/i.test(txt)) bad(`case ${id} missing "omitted" caveat`); });

// ACADEMY (Phase 3 WS-1): shape, glossary deep-links resolve, honesty caveat where due
const academy = DOCS.academy || [];
if (academy.length < 5) bad(`ACADEMY too few: expected ≥5, got ${academy.length}`);
academy.forEach(c => {
  ['id', 'title', 'story', 'glossaryLinks'].forEach(k => { if (!c[k]) bad(`academy ${c.id || '?'} missing ${k}`); });
  if (!Array.isArray(c.glossaryLinks) || !c.glossaryLinks.length) bad(`academy ${c.id} has no glossaryLinks`);
  (c.glossaryLinks || []).forEach(id => { if (!glossIds.has(id)) bad(`academy ${c.id} unresolved glossary id: ${id}`); });
});
const spiritsCh = academy.find(c => c.id === 'spirits');
if (!spiritsCh) bad('academy missing the spirits chapter (teaches the honesty principle)');
else { const txt = JSON.stringify(spiritsCh); if (!txt.includes('未纳入')) bad('academy spirits chapter missing 未纳入 caveat'); if (!/omitted/i.test(txt)) bad('academy spirits chapter missing "omitted" caveat'); }
// MEDIA (Phase 4 WS-4): shape, attribution discipline, no external non-allowlisted media hosts
const media = DOCS.media || { videos: [], articles: [] };
const hostOk = u => !u || /^assets\//.test(u) || /^(https?:)?\/\/(www\.)?youtube-nocookie\.com\//.test(u);
(media.videos || []).forEach(v => {
  if (!v.id || !Array.isArray(v.title) || !Array.isArray(v.teaser)) bad(`media video shape: ${v.id || '?'}`);
  if (v.poster && !hostOk(v.poster)) bad(`media video poster external host: ${v.id}`);
  if (v.provider === 'file' && v.src && !hostOk(v.src)) bad(`media video file src external host: ${v.id}`);
});
(media.articles || []).forEach(a => {
  if (!a.id || !Array.isArray(a.title) || !Array.isArray(a.excerpt)) bad(`media article shape: ${a.id || '?'}`);
  if (a.body && a.body[0] && a.body[0].trim() && !(a.sourceAttribution || '').trim()) bad(`media article with a body needs sourceAttribution: ${a.id}`);
  if (a.cover && !hostOk(a.cover)) bad(`media article cover external host: ${a.id}`);
});
console.log(fail ? `${fail} problem(s)` : `✅ docs lint clean — ${keys.length} scored 神煞; omitted mirrors engine; ${cases.length} cases + ${academy.length} academy + media ${(media.videos || []).length}v/${(media.articles || []).length}a; links resolve`);
process.exit(fail ? 1 : 0);
