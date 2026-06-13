// Honest, factor-derived explanation generator (Phase 3 WS-3) — the paid "why this day" narrative.
// It ONLY narrates factors the engine actually computed; tags each line exact (computed fact) vs
// graded (traditional reading); shows confidence grades; restates non-definitiveness; invents nothing.
// It is a templated rendering of real factor data — not a fortune.
import { rankHours, hourClass, MARRIAGE_OMIT_ZH, MARRIAGE_OMIT_EN, BURIAL_OMIT_ZH, BURIAL_OMIT_EN } from '../engine/tongshu.js';

const gradeLabel = (g, lang) => g === 'H' ? (lang === 'en' ? 'H' : '高') : g === 'M' ? (lang === 'en' ? 'M' : '中') : '';

// Returns { title:[zh,en], lines:[{zh,en,tag:'exact'|'graded',grade?}], caveats:[[zh,en]] }
export function buildExplanation(day, dv, selActs, profile) {
  const lines = [];
  const push = (zh, en, tag, grade) => lines.push({ zh, en, tag, grade });

  // 1) overall verdict for the chosen activities (graded interpretation of the net score)
  if (selActs && selActs.length && dv && dv.perActivity.length) {
    push(`所选事项综合：${dv.verdict}（净分 ${dv.score > 0 ? '+' : ''}${dv.score}）`,
      `Overall for your activities: ${dv.verdictEn} (net ${dv.score > 0 ? '+' : ''}${dv.score})`, 'graded');
    dv.perActivity.forEach(p => {
      const f = (p.v.factors || []).find(x => x.strong) || (p.v.factors || [])[0];
      push(`· ${p.act.zh}：${p.v.verdict}${f ? '，主因 ' + f.sign + f.zh : ''}`,
        `· ${p.act.en}: ${p.v.verdictEn}${f ? ', mainly ' + f.sign + f.en : ''}`, 'graded', f && f.grade);
    });
  }
  // 2) 建除 officer (graded)
  if (day.officer) push(`值「${day.officer}日」：${day.officerNote}`, `Day-officer ${day.officer}: ${day.officerNoteEn}`, 'graded');
  // 3) 黄道/黑道 path god (graded reading of a computed god)
  push(`${day.god}（${day.isYellow ? '黄道·吉' : '黑道·凶'}）`, `${day.god} (${day.isYellow ? 'yellow-path, auspicious' : 'black-path, inauspicious'})`, 'graded');
  // 4) 二十八宿 (graded)
  const mg = day.mansionGood === true ? ['吉', 'good'] : day.mansionGood === false ? ['凶', 'adverse'] : ['平', 'neutral'];
  push(`${day.mansion}宿（${mg[0]}）`, `${day.mansion} mansion (${mg[1]})`, 'graded');
  // 5) 神煞 with confidence grades (graded)
  const good = day.shensha.list.filter(s => s.type === 'good');
  const bad = day.shensha.list.filter(s => s.type === 'bad');
  if (good.length) push(`吉神：${good.map(s => s.zh + '(' + gradeLabel(s.grade) + ')').join('、')}`, `Benefics: ${good.map(s => s.en + '(' + gradeLabel(s.grade, 'en') + ')').join(', ')}`, 'graded');
  if (bad.length) push(`凶煞：${bad.map(s => s.zh + '(' + gradeLabel(s.grade) + ')').join('、')}`, `Malefics: ${bad.map(s => s.en + '(' + gradeLabel(s.grade, 'en') + ')').join(', ')}`, 'graded');
  if (day.shensha.hasStrongJie && day.shensha.badCount > 0) push('吉神可解部分凶煞（从神不从煞）', 'Benefics offset some ills', 'graded');
  // strong, dissolvable-resistant flags (graded)
  if (day.officer === '破') push('月破：诸吉难解', 'Month-Breaker: not dissolvable', 'graded');
  if (day.shousi) push('受死：大凶', 'Receiving-Death: gravely ill', 'graded');
  if (day.siliSijue) push(`${day.siliSijue.type}：气交脱，大事忌`, `${day.siliSijue.en}: qi in transition, avoid major acts`, 'graded');
  // 6) 冲煞 — clash target is an exact computation
  push(`冲${day.clash.clashZodiac}（煞${day.clash.dir}方）`, `Clashes ${day.clash.clashZodiac} (sha to the ${day.clash.dir})`, 'exact');
  if (dv && dv.benmingChong) push('冲你本命生肖', 'Clashes your natal zodiac', 'exact');
  if (dv && dv.clashedPersons && dv.clashedPersons.length) push(`冲同行 ${dv.clashedPersons.length} 人生肖`, `Clashes ${dv.clashedPersons.length} companion sign(s)`, 'exact');
  // 7) best double-hour — exact branch relations
  const hr = rankHours(day); const best = hr.order[0];
  if (best && hourClass(best.w).key === 'good') push(`最佳时辰：${best.branchZh}时（${best.range}）`, `Best hour: ${best.branchZh} (${best.range})`, 'exact');

  // caveats — always restate non-definitive; add omitted-item notes that apply
  const caveats = [['推算参考，非定论；婚丧、动土、开业等大事请以纸本通书或择日师为准。', 'Computed guidance, not definitive; for weighty matters confirm with a printed almanac or a specialist.']];
  const marriage = (selActs || []).some(a => a.themes && a.themes.includes('marriage'));
  const burial = (selActs || []).some(a => a.themes && a.themes.includes('burial'));
  if (marriage) caveats.push([MARRIAGE_OMIT_ZH, MARRIAGE_OMIT_EN]);
  if (burial) caveats.push([BURIAL_OMIT_ZH, BURIAL_OMIT_EN]);

  const title = [`${day.greg.y}-${String(day.greg.m).padStart(2, '0')}-${String(day.greg.d).padStart(2, '0')} ${day.dayGanzhi}日：${dv && selActs.length ? dv.verdict : '—'}`,
    `${day.greg.y}-${String(day.greg.m).padStart(2, '0')}-${String(day.greg.d).padStart(2, '0')} (${day.dayGanzhi}): ${dv && selActs.length ? dv.verdictEn : '—'}`];
  return { title, lines, caveats };
}

// Render the explanation to plain text for WhatsApp / email / a downloadable card.
export function explanationToText(exp, lang = 'zh') {
  const en = lang === 'en';
  const tag = l => l.tag === 'exact' ? (en ? ' [exact]' : '［精确］') : (en ? ' [graded]' : '［分级］');
  const L = a => en ? a[1] : a[0];
  const head = en ? 'Tong Shu Date Selector' : '通書擇日';
  const out = [head, L(exp.title), ''];
  exp.lines.forEach(l => out.push('— ' + (en ? l.en : l.zh) + tag(l)));
  out.push('');
  exp.caveats.forEach(c => out.push(L(c)));
  out.push('', en ? '[exact] = verifiable computation · [graded] = traditional reading (H/M confidence)'
    : '［精确］＝可验证推算 · ［分级］＝传统断语（高/中置信）');
  return out.join('\n');
}
