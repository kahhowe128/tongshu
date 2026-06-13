// Hours three-state classifier gate (Phase 2 Feature 1).
// Asserts the disambiguation is faithful to rankHours()'s existing weights — no new rule.
// hourClass must be exported from src/engine/tongshu.js (added in Phase 2).
import { rankHours, computeDay, gregorianToJDN, hourClass } from '../src/engine/tongshu.js';

let fail = 0; const bad = m => { fail++; console.log('❌', m); };

// 1) consistency over a year: good ⟺ yellow-path & not day-clashing
const dist = { good: 0, neutral: 0, avoid: 0 }; let n = 0;
const base = gregorianToJDN(2026, 1, 1);
for (let i = 0; i < 365; i++) {
  const day = computeDay(base + i);
  for (const r of rankHours(day).rows) {
    const c = hourClass(r.w); dist[c.key]++; n++;
    const yellow = r.tags.some(t => t.zh.startsWith('黄道时'));
    const clash = r.tags.some(t => t.zh.includes('日破时'));
    if (clash && c.key === 'good') bad(`day-clash hour classified good (${day.dayGanzhi} ${r.branchZh})`);
    if (!yellow && c.key === 'good') bad(`black-path hour classified good (${day.dayGanzhi} ${r.branchZh})`);
  }
}
const pct = k => 100 * dist[k] / n;
console.log(`2026 hour cells: ${JSON.stringify(dist)} → good ${pct('good').toFixed(1)}% / neutral ${pct('neutral').toFixed(1)}% / avoid ${pct('avoid').toFixed(1)}%`);
if (!(pct('good') >= 40 && pct('good') <= 50)) bad('good% out of expected 40–50 band');
if (!(pct('neutral') >= 45 && pct('neutral') <= 52)) bad('neutral% out of expected 45–52 band');
if (!(pct('avoid') >= 5 && pct('avoid') <= 12)) bad('avoid% out of expected 5–12 band');

// 2) the screenshot day: 卯 is yellow-path BUT day-clash → must be 'avoid', not 'good'
const d = computeDay(gregorianToJDN(2026, 6, 16));
const mao = rankHours(d).rows.find(r => r.branchZh === '卯');
if (!mao) bad('卯 row missing'); else if (hourClass(mao.w).key === 'good') bad('卯 (day-clash) still classified good — the bug this fixes');

console.log(fail ? `${fail} problem(s)` : '✅ hours classifier gate clean — good⟺yellow&!clash; clash hours never favorable; distribution in band');
process.exit(fail ? 1 : 0);
