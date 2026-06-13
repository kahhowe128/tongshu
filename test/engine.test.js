// Engine gates — must stay 22/22; leap placement 1900–2100 = {2487, 0, 74}; 春节2026 = 2026-02-17.
import { runSelfTests, leapPlacementCheck, findLunarDate, jdnToGregorian } from '../src/engine/tongshu.js';
const t = runSelfTests();
const pass = t.filter(x => x.ok).length;
console.log(`engine gates: ${pass}/${t.length}` + (pass === t.length ? ' ✅' : ' ❌'));
t.filter(x => !x.ok).forEach(x => console.log('  FAIL:', x.zh || JSON.stringify(x)));
const lp = leapPlacementCheck(1900, 2100);
const lpOk = lp.total === 2487 && lp.bad === 0 && lp.leapCount === 74;
console.log('leap placement 1900–2100:', JSON.stringify({ total: lp.total, bad: lp.bad, leapCount: lp.leapCount }), lpOk ? '✅' : '❌');
const g = jdnToGregorian(findLunarDate(2026, 1, 1));
const cnyOk = g.y === 2026 && g.m === 2 && g.d === 17;
console.log('春节 2026:', `${g.y}-${g.m}-${g.d}`, cnyOk ? '✅' : '❌');
process.exit(pass === t.length && lpOk && cnyOk ? 0 : 1);
