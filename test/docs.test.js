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
console.log(fail ? `${fail} problem(s)` : `✅ docs lint clean — ${keys.length} scored 神煞 covered with matching grades; omitted list mirrors engine`);
process.exit(fail ? 1 : 0);
