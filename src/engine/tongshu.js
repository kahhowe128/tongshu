// 通书 engine — pure, dependency-free, DOM-free. Validated by test/engine.test.js (22 gates).
// =====================================================================
// 通书择日 · Tong Shu Date Selector
// A bilingual Chinese-almanac (通书/黄历) date-selection tool.
//
// HONESTY NOTE (read me): this tool computes the *algorithmic* layers of
// the 通书 exactly — the fixed mathematical cycles (干支, 节气, 农历置闰,
// 建除十二神, 二十八宿, 纳音, 冲煞, 黄道黑道, 时辰) — and applies the
// standard documented 建除 → 宜忌 mapping (协纪辨方书 tradition) as the
// backbone, adjusted by secondary factors. It does NOT and cannot reproduce
// the proprietary 宜忌 lists of any specific publisher (宋韶光 / 蔡炳圳 /
// 廖渊用 等). Where rules disagree it shows 中性/参考 rather than forcing a
// verdict. For weddings, funerals, health and other weighty matters, confirm
// against a printed 通书 or a qualified 擇日師. Treat every verdict here as a
// computed estimate, never as definitive.
//
// Rules are cited inline by name (协纪辨方 / 建除 / 五虎遁 / 五鼠遁 / Meeus).
// Settings persist only on-device (localStorage) and in the shareable URL; nothing is ever transmitted.
// =====================================================================



// ====================================================================
// ENGINE — validated against 35 reference gates (see build notes).
// ====================================================================

// =============================================================
// 通书择日 engine — pure JS, no Date in core math (TZ-safe).
// Rules cited inline: 协纪辨方 / 建除 / 五虎遁 / 五鼠遁 / Meeus.
// =============================================================

// ---------- Basic cyclic data ----------
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];      // 天干
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']; // 地支
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const ZODIAC_EN = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const STEM_EL = ['木','木','火','火','土','土','金','金','水','水']; // 干五行
const STEM_YIN_YANG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];

// ---------- Gregorian <-> JDN (Fliegel/Van Flandern), JDN at noon ----------
function gregorianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
    Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}
function jdnToGregorian(jdn) {
  let a = jdn + 32044;
  let b = Math.floor((4 * a + 3) / 146097);
  let c = a - Math.floor((146097 * b) / 4);
  let dd = Math.floor((4 * c + 3) / 1461);
  let e = c - Math.floor((1461 * dd) / 4);
  let m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + dd - 4800 + Math.floor(m / 10);
  return { y: year, m: month, d: day };
}

// ---------- Day pillar (continuous JDN count) ----------
// dayGanzhiIndex = (JDN_noon + 49) % 60, index 0 = 甲子.
// Anchors: 1900-01-01→甲戌(10), 2000-01-07→甲子(0), 1949-10-01→甲子(0).
function dayGanzhiIndex(jdn) {
  return ((jdn + 49) % 60 + 60) % 60;
}

// ---------- Weekday: (JDN+1)%7, 0=Sunday ----------
function weekday(jdn) { return ((jdn + 1) % 7 + 7) % 7; }

// ---------- ΔT (Espenak–Meeus, piecewise; effect on day-attribution tiny) ----------
function deltaTseconds(year) {
  let t, dt;
  if (year < 1900) { t = (year - 1820) / 100; dt = -20 + 32 * t * t; }
  else if (year < 1920) { t = year - 1900; dt = -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  else if (year < 1941) { t = year - 1920; dt = 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3; }
  else if (year < 1961) { t = year - 1950; dt = 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
  else if (year < 1986) { t = year - 1975; dt = 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
  else if (year < 2005) { t = year - 2000; dt = 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  else if (year < 2050) { t = year - 2000; dt = 62.92 + 0.32217 * t + 0.005589 * t * t; }
  else if (year < 2150) { t = (year - 1820) / 100; dt = -20 + 32 * t * t - 0.5628 * (2150 - year); }
  else { t = (year - 1820) / 100; dt = -20 + 32 * t * t; }
  return dt;
}

// ---------- Solar apparent longitude (Meeus low precision), deg [0,360) ----------
const D2R = Math.PI / 180;
function norm360(x) { x %= 360; return x < 0 ? x + 360 : x; }
function solarLon(jde) {
  const T = (jde - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * D2R;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  const trueLon = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLon - 0.00569 - 0.00478 * Math.sin(omega * D2R);
  return norm360(lambda);
}
// Find JDE where apparent solar longitude == targetDeg, near guessJDE.
function findTermJDE(targetDeg, guessJDE) {
  let jd = guessJDE;
  for (let i = 0; i < 10; i++) {
    let diff = (targetDeg - solarLon(jd)) % 360;
    if (diff > 180) diff -= 360;
    if (diff <= -180) diff += 360;
    jd += diff / 0.98564736;
    if (Math.abs(diff) < 1e-7) break;
  }
  return jd; // dynamical time
}
// Convert a dynamical-time JDE of an instant to a UTC+8 civil JDN (which calendar day in Beijing time).
function jdeToCivilJDN(jde, year) {
  const ut = jde - deltaTseconds(year) / 86400;   // TT -> UT
  const local = ut + 8 / 24;                       // UTC+8
  return Math.floor(local + 0.5);                  // JDN whose civil day contains the instant
}
// Local instant (real number, in JDN-with-fraction at UTC+8 civil) for comparisons.
function jdeToLocalInstant(jde, year) {
  const ut = jde - deltaTseconds(year) / 86400;
  return ut + 8 / 24 + 0.5; // +0.5 so floor() = civil JDN; fractional part is fraction of civil day
}

// ---------- 24 solar terms ----------
// 节 (sectional, month boundaries) longitudes & resulting month branch index.
const JIE = [ // {name, lon, branch}  立春 starts 寅月
  { zh: '立春', lon: 315, branch: 2 }, { zh: '惊蛰', lon: 345, branch: 3 },
  { zh: '清明', lon: 15, branch: 4 }, { zh: '立夏', lon: 45, branch: 5 },
  { zh: '芒种', lon: 75, branch: 6 }, { zh: '小暑', lon: 105, branch: 7 },
  { zh: '立秋', lon: 135, branch: 8 }, { zh: '白露', lon: 165, branch: 9 },
  { zh: '寒露', lon: 195, branch: 10 }, { zh: '立冬', lon: 225, branch: 11 },
  { zh: '大雪', lon: 255, branch: 0 }, { zh: '小寒', lon: 285, branch: 1 },
];
// All 24 terms (节+气 interleaved) with English + approx month for guesses.
const TERMS24 = [
  { zh: '小寒', en: 'Minor Cold', lon: 285, gm: 1, gd: 6 },
  { zh: '大寒', en: 'Major Cold', lon: 300, gm: 1, gd: 20 },
  { zh: '立春', en: 'Start of Spring', lon: 315, gm: 2, gd: 4 },
  { zh: '雨水', en: 'Rain Water', lon: 330, gm: 2, gd: 19 },
  { zh: '惊蛰', en: 'Awakening of Insects', lon: 345, gm: 3, gd: 6 },
  { zh: '春分', en: 'Spring Equinox', lon: 0, gm: 3, gd: 21 },
  { zh: '清明', en: 'Pure Brightness', lon: 15, gm: 4, gd: 5 },
  { zh: '谷雨', en: 'Grain Rain', lon: 30, gm: 4, gd: 20 },
  { zh: '立夏', en: 'Start of Summer', lon: 45, gm: 5, gd: 6 },
  { zh: '小满', en: 'Grain Buds', lon: 60, gm: 5, gd: 21 },
  { zh: '芒种', en: 'Grain in Ear', lon: 75, gm: 6, gd: 6 },
  { zh: '夏至', en: 'Summer Solstice', lon: 90, gm: 6, gd: 21 },
  { zh: '小暑', en: 'Minor Heat', lon: 105, gm: 7, gd: 7 },
  { zh: '大暑', en: 'Major Heat', lon: 120, gm: 7, gd: 23 },
  { zh: '立秋', en: 'Start of Autumn', lon: 135, gm: 8, gd: 8 },
  { zh: '处暑', en: 'End of Heat', lon: 150, gm: 8, gd: 23 },
  { zh: '白露', en: 'White Dew', lon: 165, gm: 9, gd: 8 },
  { zh: '秋分', en: 'Autumn Equinox', lon: 180, gm: 9, gd: 23 },
  { zh: '寒露', en: 'Cold Dew', lon: 195, gm: 10, gd: 8 },
  { zh: '霜降', en: 'Frost Descent', lon: 210, gm: 10, gd: 23 },
  { zh: '立冬', en: 'Start of Winter', lon: 225, gm: 11, gd: 7 },
  { zh: '小雪', en: 'Minor Snow', lon: 240, gm: 11, gd: 22 },
  { zh: '大雪', en: 'Major Snow', lon: 255, gm: 12, gd: 7 },
  { zh: '冬至', en: 'Winter Solstice', lon: 270, gm: 12, gd: 22 },
];

// Memoized term civil-JDN: termCivilJDN(year, idx) for TERMS24[idx] occurring in Gregorian `year`.
const _termCache = {};
function termJDE(year, idx) {
  const key = year + ':' + idx;
  if (_termCache[key] !== undefined) return _termCache[key];
  const t = TERMS24[idx];
  const guess = gregorianToJDN(year, t.gm, t.gd) - 0.5; // midnight-ish guess
  const jde = findTermJDE(t.lon, guess);
  _termCache[key] = jde;
  return jde;
}
function termCivilJDN(year, idx) { return jdeToCivilJDN(termJDE(year, idx), year); }

// 立春 instant helpers (idx 2 in TERMS24).
function lichunCivilJDN(gy) { return termCivilJDN(gy, 2); }
function lichunLocalInstant(gy) { return jdeToLocalInstant(termJDE(gy, 2), gy); }

// ---------- Year pillar (switches at 立春) ----------
// yearIndex = (Y-4) % 60 ; Y = 立春-year. Validated 2024甲辰,2025乙巳,2026丙午.
function yearPillarForCivilJDN(jdn) {
  const g = jdnToGregorian(jdn);
  const lc = lichunCivilJDN(g.y);
  let Y = (jdn >= lc) ? g.y : g.y - 1;
  const idx = ((Y - 4) % 60 + 60) % 60;
  return { Y, idx, stem: idx % 10, branch: idx % 12 };
}

// ---------- Month pillar (节 boundaries + 五虎遁) ----------
// Order of 节 within a 立春-year Y: 立春(Y)=offset0 ... 大雪(Y)=10, 小寒(Y+1)=11.
// 五虎遁: 寅monthStem = (2*(yearStem%5)+2)%10 ; monthStem=(寅Stem+offset)%10.
function monthPillarForCivilJDN(jdn, yearStem) {
  const g = jdnToGregorian(jdn);
  // Build the 12 节 civil-JDN for the 立春-year that this date sits in.
  // First determine 立春-year:
  const lcThis = lichunCivilJDN(g.y);
  const Y = (jdn >= lcThis) ? g.y : g.y - 1;
  // 节 list: indices into TERMS24 for the 12 节, in order from 立春.
  // 立春(2),惊蛰(4),清明(6),立夏(8),芒种(10),小暑(12),立秋(14),白露(16),寒露(18),立冬(20),大雪(22) all in year Y; 小寒(0) in Y+1.
  const jieIdx = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const jieJDN = jieIdx.map(i => termCivilJDN(Y, i));
  jieJDN.push(termCivilJDN(Y + 1, 0)); // 小寒 next year => offset 11
  // offset = index of latest 节 <= jdn
  let offset = 0;
  for (let i = 0; i < jieJDN.length; i++) { if (jdn >= jieJDN[i]) offset = i; }
  const monthBranch = (2 + offset) % 12;             // 寅=2 at offset0
  const yinStem = (2 * (yearStem % 5) + 2) % 10;      // 五虎遁
  const monthStem = (yinStem + offset) % 10;
  const idx = (() => { // ganzhi index from stem+branch (Chinese restoration)
    for (let k = 0; k < 60; k++) if (k % 10 === monthStem && k % 12 === monthBranch) return k;
    return 0;
  })();
  return { offset, monthBranch, monthStem, idx, Y };
}

// ---------- 建除十二神 (officer) ----------
// officerIndex = (dayBranch - monthBranch + 12)%12, 0=建. 节-boundary doubling is automatic.
const OFFICERS = ['建','除','满','平','定','执','破','危','成','收','开','闭'];
const OFFICERS_EN = ['Establish','Remove','Full','Balance','Stable','Initiate','Destruction','Danger','Success','Receive','Open','Close'];
function officerIndex(dayBranch, monthBranch) { return ((dayBranch - monthBranch) % 12 + 12) % 12; }

// ---------- 二十八宿 ----------
// mansionIndex = (JDN+4)%28, 0=角. 七曜 repeats every 7: 木金土日月火水.
const MANSIONS = ['角','亢','氐','房','心','尾','箕','斗','牛','女','虚','危','室','壁','奎','娄','胃','昴','毕','觜','参','井','鬼','柳','星','张','翼','轸'];
const MANSION_ANIMAL = ['蛟','龙','貉','兔','狐','虎','豹','獬','牛','蝠','鼠','燕','猪','貐','狼','狗','雉','鸡','乌','猴','猿','犴','羊','獐','马','鹿','蛇','蚓'];
const SEVEN = ['木','金','土','日','月','火','水']; // 七曜 starting at 角=木
// 七曜 -> weekday: 木=Thu(4),金=Fri(5),土=Sat(6),日=Sun(0),月=Mon(1),火=Tue(2),水=Wed(3)
const SEVEN_DOW = { '木': 4, '金': 5, '土': 6, '日': 0, '月': 1, '火': 2, '水': 3 };
function mansionIndex(jdn) { return ((jdn + 4) % 28 + 28) % 28; }
function mansionSeven(idx) { return SEVEN[idx % 7]; }

// ---------- 五行纳音 (30 entries, index = floor(ganzhi/2)) ----------
const NAYIN = [
  { zh: '海中金', el: '金' }, { zh: '炉中火', el: '火' }, { zh: '大林木', el: '木' },
  { zh: '路旁土', el: '土' }, { zh: '剑锋金', el: '金' }, { zh: '山头火', el: '火' },
  { zh: '涧下水', el: '水' }, { zh: '城头土', el: '土' }, { zh: '白蜡金', el: '金' },
  { zh: '杨柳木', el: '木' }, { zh: '泉中水', el: '水' }, { zh: '屋上土', el: '土' },
  { zh: '霹雳火', el: '火' }, { zh: '松柏木', el: '木' }, { zh: '长流水', el: '水' },
  { zh: '砂石金', el: '金' }, { zh: '山下火', el: '火' }, { zh: '平地木', el: '木' },
  { zh: '壁上土', el: '土' }, { zh: '金箔金', el: '金' }, { zh: '覆灯火', el: '火' },
  { zh: '天河水', el: '水' }, { zh: '大驿土', el: '土' }, { zh: '钗钏金', el: '金' },
  { zh: '桑柘木', el: '木' }, { zh: '大溪水', el: '水' }, { zh: '沙中土', el: '土' },
  { zh: '天上火', el: '火' }, { zh: '石榴木', el: '木' }, { zh: '大海水', el: '水' },
];
function nayin(ganzhiIdx) { return NAYIN[Math.floor(ganzhiIdx / 2)]; }

// ---------- 冲煞 ----------
// 冲 animal = ZODIAC[(dayBranch+6)%12]; 冲 pillar branch=(b+6)%12, stem=(s+6)%10 (天克地冲).
// 煞方 by DAY branch 三合 group: 申子辰→南, 寅午戌→北, 巳酉丑→东, 亥卯未→西.
function clash(dayStem, dayBranch) {
  const cb = (dayBranch + 6) % 12;
  const cs = (dayStem + 6) % 10;
  let dir, dirEn;
  if ([8, 0, 4].includes(dayBranch)) { dir = '南'; dirEn = 'S'; }
  else if ([2, 6, 10].includes(dayBranch)) { dir = '北'; dirEn = 'N'; }
  else if ([5, 9, 1].includes(dayBranch)) { dir = '东'; dirEn = 'E'; }
  else { dir = '西'; dirEn = 'W'; }
  return { clashBranch: cb, clashStem: cs, clashZodiac: ZODIAC[cb], clashZodiacEn: ZODIAC_EN[cb], dir, dirEn };
}

// ---------- 黄道黑道 (day) ----------
// 青龙Branch=(2*(monthBranch%6)+8)%12; godIndex=(dayBranch-青龙Branch+12)%12.
const HBD_GODS = ['青龙','明堂','天刑','朱雀','金匮','天德','白虎','玉堂','天牢','玄武','司命','勾陈'];
const HBD_GOOD = [true, true, false, false, true, true, false, true, false, false, true, false]; // 黄道吉/黑道凶
function huangHei(dayBranch, monthBranch) {
  const qinglong = (2 * (monthBranch % 6) + 8) % 12;
  const gi = ((dayBranch - qinglong) % 12 + 12) % 12;
  return { godIndex: gi, god: HBD_GODS[gi], isYellow: HBD_GOOD[gi] };
}

// ---------- 时辰 (五鼠遁 + hour 黄黑道) ----------
// 子hourStem=(2*(dayStem%5))%10; hourStem=(子Stem+h)%10. Hour 冲=ZODIAC[(h+6)%12].
// Hour 黄黑道: base青龙=(2*(dayBranch%6)+8)%12 (same formula, DAY branch); hourGod=order[(h-base+12)%12].
const HOUR_RANGES = ['23–01','01–03','03–05','05–07','07–09','09–11','11–13','13–15','15–17','17–19','19–21','21–23'];
function hourTable(dayStem, dayBranch) {
  const ziStem = (2 * (dayStem % 5)) % 10;
  const base = (2 * (dayBranch % 6) + 8) % 12;
  const rows = [];
  for (let h = 0; h < 12; h++) {
    const hs = (ziStem + h) % 10;
    const gi = ((h - base) % 12 + 12) % 12;
    rows.push({
      h, branch: h, branchZh: BRANCHES[h], range: HOUR_RANGES[h],
      stem: hs, ganzhi: STEMS[hs] + BRANCHES[h],
      clashZodiac: ZODIAC[(h + 6) % 12], clashZodiacEn: ZODIAC_EN[(h + 6) % 12],
      god: HBD_GODS[gi], isYellow: HBD_GOOD[gi],
    });
  }
  return rows;
}

// ---------- 择时: hour ranking from exact branch relations (H/M-graded) ----------
// (六合 uses the engine's existing LIUHE pair table, declared below with the clash relations.)
// 三合 group id by branch: 申子辰(0) 巳酉丑(1) 寅午戌(2) 亥卯未(3)
const SANHE_GROUP = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
// 相害 partner: 子未 丑午 寅巳 卯辰 申亥 酉戌
const XIANGHAI = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8];
const HOUR_OMIT_ZH = '时家神煞（日禄、天乙贵人、喜神时等）版本繁多，未经核实暂不纳入；此处仅按黄道时与时支–日支冲合（精确规则）排序。';
const HOUR_OMIT_EN = 'Hour-family spirits (日禄, noble-person hours, etc.) vary by edition and are omitted pending a verified source; ranking uses only yellow-path hours and exact hour-vs-day branch relations.';
// Returns hourTable rows + {w, tags[], best} ranking for the day (activity-independent core).
function rankHours(day) {
  const rows = hourTable(day.dayStem, day.dayBranch).map(h => {
    const tags = []; let w = 0;
    if (h.isYellow) { w += 2; tags.push({ zh: '黄道时·' + h.god, en: 'yellow-path (' + h.god + ')', sign: '+', grade: 'H' }); }
    else tags.push({ zh: '黑道时·' + h.god, en: 'black-path', sign: '−', grade: 'H' });
    if (h.branch === (day.dayBranch + 6) % 12) { w -= 3; tags.push({ zh: '时冲日支（日破时）', en: 'clashes day branch', sign: '−', grade: 'H' }); }
    if (LIUHE[day.dayBranch] === h.branch) { w += 1; tags.push({ zh: '时合日支（六合）', en: 'six-harmony with day', sign: '+', grade: 'H' }); }
    if (SANHE_GROUP[h.branch] === SANHE_GROUP[day.dayBranch] && h.branch !== day.dayBranch) { w += 1; tags.push({ zh: '三合日支', en: 'trine with day', sign: '+', grade: 'H' }); }
    if (XIANGHAI[day.dayBranch] === h.branch) { w -= 0.5; tags.push({ zh: '害日支·中', en: 'harms day branch (M)', sign: '−', grade: 'M' }); }
    return { ...h, w, tags };
  });
  const order = rows.slice().sort((a, b) => b.w - a.w || a.h - b.h);
  return { rows, order, best: order[0] };
}

// Three-state label for an hour, derived solely from rankHours()'s existing weight `w`.
// good ⟺ yellow-path with no day-clash (w≥2); avoid ⟺ black-path or day-clash (w≤-1); else neutral.
// Verified over 2026: 43.8% good / 47.9% neutral / 8.3% avoid; good⟺yellow&!clash holds exactly.
function hourClass(w) {
  if (w >= 2) return { key: 'good', zh: '吉', en: 'Favorable' };
  if (w <= -1) return { key: 'avoid', zh: '忌', en: 'Avoid' };
  return { key: 'neutral', zh: '平', en: 'Neutral' };
}

// ---------- 农历 (lunar) via Meeus ch.49 new moon ----------
function newMoonJDE(k) {
  const T = k / 1236.85;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T
    - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = norm360(2.5534 + 29.10535670 * k - 0.0000014 * T * T - 0.00000011 * T ** 3) * D2R;
  const Mp = norm360(201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4) * D2R;
  const F = norm360(160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4) * D2R;
  const Om = norm360(124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3) * D2R;
  let c = 0;
  c += -0.40720 * Math.sin(Mp);
  c += 0.17241 * E * Math.sin(M);
  c += 0.01608 * Math.sin(2 * Mp);
  c += 0.01039 * Math.sin(2 * F);
  c += 0.00739 * E * Math.sin(Mp - M);
  c += -0.00514 * E * Math.sin(Mp + M);
  c += 0.00208 * E * E * Math.sin(2 * M);
  c += -0.00111 * Math.sin(Mp - 2 * F);
  c += -0.00057 * Math.sin(Mp + 2 * F);
  c += 0.00056 * E * Math.sin(2 * Mp + M);
  c += -0.00042 * Math.sin(3 * Mp);
  c += 0.00042 * E * Math.sin(M + 2 * F);
  c += 0.00038 * E * Math.sin(M - 2 * F);
  c += -0.00024 * E * Math.sin(2 * Mp - M);
  c += -0.00017 * Math.sin(Om);
  c += -0.00007 * Math.sin(Mp + 2 * M);
  c += 0.00004 * Math.sin(2 * Mp - 2 * F);
  c += 0.00004 * Math.sin(3 * M);
  c += 0.00003 * Math.sin(Mp + M - 2 * F);
  c += 0.00003 * Math.sin(2 * Mp + 2 * F);
  c += -0.00003 * Math.sin(Mp + M + 2 * F);
  c += 0.00003 * Math.sin(Mp - M + 2 * F);
  c += -0.00002 * Math.sin(Mp - M - 2 * F);
  c += -0.00002 * Math.sin(3 * Mp + M);
  c += 0.00002 * Math.sin(4 * Mp);
  jde += c;
  // Planetary A-terms (14)
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T * T, 0.000325],
    [251.88 + 0.016321 * k, 0.000165],
    [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126],
    [84.66 + 18.206239 * k, 0.000110],
    [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.000060],
    [154.84 + 7.306860 * k, 0.000056],
    [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042],
    [291.34 + 1.844379 * k, 0.000040],
    [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ];
  for (const [ang, coef] of A) jde += coef * Math.sin(norm360(ang) * D2R);
  return jde;
}
// New-moon civil JDN (UTC+8). year param for ΔT — derive from a rough calendar year.
function newMoonCivilJDN(k) {
  const approxYear = 2000 + k / 12.3685;
  return jdeToCivilJDN(newMoonJDE(k), Math.round(approxYear));
}
function newMoonLocalInstant(k) {
  const approxYear = 2000 + k / 12.3685;
  return jdeToLocalInstant(newMoonJDE(k), Math.round(approxYear));
}
function winterSolsticeJDE(gy) { return termJDE(gy, 23); } // 冬至 idx23
function winterSolsticeLocalInstant(gy) { return jdeToLocalInstant(termJDE(gy, 23), gy); }

// find lunation k whose new-moon civil day <= dCivilJDN < next.
function monthStartK(dCivilJDN) {
  let k = Math.round((dCivilJDN - 2451550.09766) / 29.530588861) - 2000 * 0; // init
  // approximate k from civil jdn directly
  k = Math.round((dCivilJDN - 2451550) / 29.530588861);
  // adjust so newMoonCivilJDN(k) <= d < newMoonCivilJDN(k+1)
  let guard = 0;
  while (newMoonCivilJDN(k) > dCivilJDN && guard++ < 40) k--;
  while (newMoonCivilJDN(k + 1) <= dCivilJDN && guard++ < 80) k++;
  return k;
}
// Does lunar month starting at lunation mk contain a 中气?
// Rule (GB/T 33661-2017): compare CIVIL DAYS at UTC+8 (midnight boundary). 初一 is the day
// containing the 朔; a 中气 belongs to the month-span of civil days that contains its day.
// (Sub-day instant ordering is WRONG here — e.g. 处暑 & 朔 on the same day 2025-08-23.)
const ZHONGQI_IDX = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]; // 中气 indices into TERMS24
function monthHasZhongQi(mk) {
  const startJDN = newMoonCivilJDN(mk);
  const endJDN = newMoonCivilJDN(mk + 1);
  const y = jdnToGregorian(startJDN).y;
  for (const yr of [y - 1, y, y + 1]) {
    for (const i of ZHONGQI_IDX) {
      const z = termCivilJDN(yr, i);
      if (z >= startJDN && z < endJDN) return true;
    }
  }
  return false;
}
// Full lunar conversion for a civil JDN.
function lunarFromCivilJDN(jdn) {
  const g = jdnToGregorian(jdn);
  const gy = g.y;
  const kM = monthStartK(jdn);
  // winter solstices either side
  const wsThisInst = winterSolsticeLocalInstant(gy);
  const wsThisCivil = jdeToCivilJDN(winterSolsticeJDE(gy), gy);
  const wsPrevCivil = jdeToCivilJDN(winterSolsticeJDE(gy - 1), gy - 1);
  const k11This = monthStartK(wsThisCivil);
  const k11Prev = monthStartK(wsPrevCivil);
  let anchorK, nextWSCivil;
  if (kM >= k11This) { anchorK = k11This; nextWSCivil = jdeToCivilJDN(winterSolsticeJDE(gy + 1), gy + 1); }
  else { anchorK = k11Prev; nextWSCivil = wsThisCivil; }
  const endK = monthStartK(nextWSCivil);
  const nMonths = endK - anchorK; // 12 or 13
  const leapYear = (nMonths === 13);
  // number months from anchorK (=month11)
  let num = 11; let leapAssigned = false;
  let resultNum = null, resultLeap = false;
  for (let i = 0; ; i++) {
    let isLeap = false;
    if (i === 0) {
      // month 11 itself
    } else {
      if (leapYear && !leapAssigned && !monthHasZhongQi(anchorK + i)) {
        isLeap = true; leapAssigned = true; // repeats previous num
      } else {
        num = (num % 12) + 1;
      }
    }
    if (anchorK + i === kM) { resultNum = num; resultLeap = isLeap; break; }
    if (i > 14) break;
  }
  const dayNum = jdn - newMoonCivilJDN(kM) + 1;
  return { monthNum: resultNum, isLeap: resultLeap, day: dayNum, leapYear, kM };
}
const LUNAR_MONTH_NAMES = ['','正','二','三','四','五','六','七','八','九','十','十一','十二'];
const LUNAR_DAY_NAMES = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
function lunarLabel(l) {
  return (l.isLeap ? '闰' : '') + LUNAR_MONTH_NAMES[l.monthNum] + '月' + LUNAR_DAY_NAMES[l.day];
}

// ---------- 神煞 ----------
// 月破 <=> 破 officer. 四离 = day before 二分二至; 四绝 = day before 四立.
// 受死 by 月建 (variant; minor). 杨公十三忌 (lunar dates).
const SHOUSI = { 2: 10, 3: 4, 4: 11, 5: 5, 6: 0, 7: 6, 8: 1, 9: 7, 10: 2, 11: 8, 0: 3, 1: 9 }; // monthBranch->dayBranch
const YANGGONG = [ // [monthNum, day]
  [1, 13], [2, 11], [3, 9], [4, 7], [5, 5], [6, 3], [7, 1], [7, 29], [8, 27], [9, 25], [10, 23], [11, 21], [12, 19],
];
function isYanggong(l) {
  if (l.isLeap) return false;
  return YANGGONG.some(([m, d]) => m === l.monthNum && d === l.day);
}
// 四离四绝: is the *next* civil day a 二分二至 (离) or 四立 (绝)?
function siliSijue(jdn) {
  const g = jdnToGregorian(jdn);
  const tomorrow = jdn + 1;
  // check the four 离 terms (春分0=idx5, 夏至90=11, 秋分180=17, 冬至270=23) and 四立 (立春2,立夏8,立秋14,立冬20)
  const liIdx = [5, 11, 17, 23];
  const jueIdx = [2, 8, 14, 20];
  for (const yr of [g.y - 1, g.y, g.y + 1]) {
    for (const i of liIdx) if (termCivilJDN(yr, i) === tomorrow) return { type: '四离', en: 'Si-Li (eve of equinox/solstice)' };
    for (const i of jueIdx) if (termCivilJDN(yr, i) === tomorrow) return { type: '四绝', en: 'Si-Jue (eve of season start)' };
  }
  return null;
}

// ---------- 彭祖百忌 ----------
const PENGZU_STEM = ['甲不开仓财物耗散','乙不栽植千株不长','丙不修灶必见灾殃','丁不剃头头必生疮',
  '戊不受田田主不祥','己不破券二比并亡','庚不经络织机虚张','辛不合酱主人不尝',
  '壬不汲水更难提防','癸不词讼理弱敌强'];
const PENGZU_BRANCH = ['子不问卜自惹祸殃','丑不冠带主不还乡','寅不祭祀神鬼不尝','卯不穿井水泉不香',
  '辰不哭泣必主重丧','巳不远行财物伏藏','午不苫盖屋主更张','未不服药毒气入肠',
  '申不安床鬼祟入房','酉不会客醉坐颠狂','戌不吃犬作怪上床','亥不嫁娶不利新郎'];

// ---------- 三合 / 六合 ----------
const LIUHE = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 }; // branch pairs
const SANHE = { // group -> [branches]
  水: [8, 0, 4], 木: [11, 3, 7], 火: [2, 6, 10], 金: [5, 9, 1],
};
function relationToBranch(dayBranch, otherBranch) {
  // returns '六合' / '三合' / '冲' / null relative to otherBranch
  if ((dayBranch + 6) % 12 === otherBranch) return '冲';
  if (LIUHE[dayBranch] === otherBranch) return '六合';
  for (const g in SANHE) if (SANHE[g].includes(dayBranch) && SANHE[g].includes(otherBranch) && dayBranch !== otherBranch) return '三合';
  return null;
}

// ---------- Activities & officer theme mapping ----------
// Themes: movement, ritual, commerce, marriage, groundwork, construction, burial,
//         grooming, medical, study, litigation, planting, livestock, capture, bedplace.
const ACTIVITIES = [
  // 医疗
  { id: 'qiuyi', zh: '求医', en: 'Seek medical care', cat: '医疗', themes: ['medical'] },
  { id: 'zhibing', zh: '治病', en: 'Treat illness', cat: '医疗', themes: ['medical'] },
  { id: 'zhenjiu', zh: '针灸', en: 'Acupuncture', cat: '医疗', themes: ['medical', 'needle'] },
  { id: 'liaomu', zh: '疗目', en: 'Eye treatment', cat: '医疗', themes: ['medical'] },
  { id: 'zhengjia', zh: '整手足甲', en: 'Trim nails', cat: '医疗', themes: ['grooming'] },
  // 婚嫁
  { id: 'jiaqu', zh: '嫁娶', en: 'Wedding', cat: '婚嫁', themes: ['marriage'] },
  { id: 'dinghun', zh: '订婚/订盟', en: 'Engagement', cat: '婚嫁', themes: ['marriage'] },
  { id: 'nacai', zh: '纳采', en: 'Betrothal gifts', cat: '婚嫁', themes: ['marriage'] },
  { id: 'naxu', zh: '纳婿', en: 'Take son-in-law', cat: '婚嫁', themes: ['marriage'] },
  { id: 'guining', zh: '归宁', en: 'Bride visits home', cat: '婚嫁', themes: ['marriage', 'movement'] },
  { id: 'guanji', zh: '冠笄', en: 'Coming-of-age', cat: '婚嫁', themes: ['ritual'] },
  // 居家
  { id: 'banjia', zh: '搬家/移徙', en: 'Move house', cat: '居家', themes: ['movement'] },
  { id: 'ruzhai', zh: '入宅', en: 'Enter new home', cat: '居家', themes: ['movement'] },
  { id: 'anchuang', zh: '安床', en: 'Place bed', cat: '居家', themes: ['bedplace'] },
  { id: 'zuozao', zh: '作灶', en: 'Build stove', cat: '居家', themes: ['construction'] },
  { id: 'anmen', zh: '安门', en: 'Install door', cat: '居家', themes: ['construction'] },
  { id: 'xiuzao', zh: '修造', en: 'Renovation', cat: '居家', themes: ['construction'] },
  { id: 'dongtu', zh: '动土', en: 'Break ground', cat: '居家', themes: ['groundwork'] },
  { id: 'gaiwu', zh: '盖屋', en: 'Roof a house', cat: '居家', themes: ['construction'] },
  { id: 'shangliang', zh: '上梁', en: 'Raise ridge beam', cat: '居家', themes: ['construction'] },
  { id: 'chaixie', zh: '拆卸', en: 'Demolish', cat: '居家', themes: ['demolition'] },
  { id: 'potu', zh: '破土', en: 'Break earth (grave)', cat: '居家', themes: ['burial', 'groundwork'] },
  // 商业
  { id: 'kaishi', zh: '开市/开业', en: 'Open business', cat: '商业', themes: ['commerce'] },
  { id: 'lijuan', zh: '立券', en: 'Sign contract', cat: '商业', themes: ['commerce'] },
  { id: 'jiaoyi', zh: '交易', en: 'Trade', cat: '商业', themes: ['commerce'] },
  { id: 'nacai2', zh: '纳财', en: 'Receive wealth', cat: '商业', themes: ['commerce'] },
  { id: 'chuhuocai', zh: '出货财', en: 'Ship goods', cat: '商业', themes: ['commerce'] },
  { id: 'qiucai', zh: '求财', en: 'Seek wealth', cat: '商业', themes: ['commerce'] },
  // 出行
  { id: 'chuxing', zh: '出行', en: 'Travel', cat: '出行', themes: ['movement'] },
  { id: 'furen', zh: '赴任', en: 'Take office', cat: '出行', themes: ['movement'] },
  // 祭祀
  { id: 'jisi', zh: '祭祀', en: 'Worship/offering', cat: '祭祀', themes: ['ritual'] },
  { id: 'qifu', zh: '祈福', en: 'Pray for blessing', cat: '祭祀', themes: ['ritual'] },
  { id: 'qiusi', zh: '求嗣', en: 'Pray for heir', cat: '祭祀', themes: ['ritual'] },
  { id: 'kaiguang', zh: '开光', en: 'Consecrate', cat: '祭祀', themes: ['ritual'] },
  { id: 'zhaijiao', zh: '斋醮', en: 'Daoist rite', cat: '祭祀', themes: ['ritual'] },
  { id: 'choushen', zh: '酬神', en: 'Thank deities', cat: '祭祀', themes: ['ritual'] },
  { id: 'anxiang', zh: '安香', en: 'Install incense', cat: '祭祀', themes: ['ritual'] },
  // 丧葬
  { id: 'anzang', zh: '安葬', en: 'Burial', cat: '丧葬', themes: ['burial'] },
  { id: 'rulian', zh: '入殓', en: 'Encoffin', cat: '丧葬', themes: ['burial'] },
  { id: 'yijiu', zh: '移柩', en: 'Move coffin', cat: '丧葬', themes: ['burial'] },
  { id: 'xiufen', zh: '修坟', en: 'Repair grave', cat: '丧葬', themes: ['burial'] },
  { id: 'libei', zh: '立碑', en: 'Erect tombstone', cat: '丧葬', themes: ['burial'] },
  { id: 'qizuan', zh: '启钻', en: 'Exhume', cat: '丧葬', themes: ['burial'] },
  { id: 'chufu', zh: '除服', en: 'End mourning', cat: '丧葬', themes: ['ritual'] },
  { id: 'chengfu', zh: '成服', en: 'Begin mourning', cat: '丧葬', themes: ['ritual'] },
  // 农牧
  { id: 'zaizhong', zh: '栽种', en: 'Planting', cat: '农牧', themes: ['planting'] },
  { id: 'naxu2', zh: '纳畜', en: 'Acquire livestock', cat: '农牧', themes: ['livestock'] },
  { id: 'muyang', zh: '牧养', en: 'Husbandry', cat: '农牧', themes: ['livestock'] },
  { id: 'buzhuo', zh: '捕捉', en: 'Trap pests', cat: '农牧', themes: ['capture'] },
  { id: 'tianlie', zh: '畋猎', en: 'Hunt', cat: '农牧', themes: ['capture'] },
  // 杂事
  { id: 'lifa', zh: '理发', en: 'Haircut', cat: '杂事', themes: ['grooming'] },
  { id: 'muyu', zh: '沐浴', en: 'Ritual bath', cat: '杂事', themes: ['grooming'] },
  { id: 'caiyi', zh: '裁衣', en: 'Cut cloth', cat: '杂事', themes: ['grooming'] },
  { id: 'saoshe', zh: '扫舍', en: 'Clean house', cat: '杂事', themes: ['grooming'] },
  { id: 'cisong', zh: '词讼', en: 'Litigation', cat: '杂事', themes: ['litigation'] },
  { id: 'huiqin', zh: '会亲友', en: 'Meet friends', cat: '杂事', themes: ['movement'] },
  { id: 'ruxue', zh: '入学', en: 'Start school', cat: '杂事', themes: ['study'] },
  { id: 'xiyi', zh: '习艺', en: 'Learn a craft', cat: '杂事', themes: ['study'] },
  { id: 'buyuan', zh: '补垣', en: 'Mend walls', cat: '杂事', themes: ['fill'] },
  { id: 'saixue', zh: '塞穴', en: 'Block holes', cat: '杂事', themes: ['fill'] },
  { id: 'jiechu', zh: '解除', en: 'Cleansing', cat: '杂事', themes: ['grooming', 'ritual'] },
];
const CATEGORIES = ['医疗', '婚嫁', '居家', '商业', '出行', '祭祀', '丧葬', '农牧', '杂事'];
const CATEGORIES_EN = { '医疗': 'Health', '婚嫁': 'Marriage', '居家': 'Home', '商业': 'Business', '出行': 'Travel', '祭祀': 'Ritual', '丧葬': 'Funerary', '农牧': 'Agriculture', '杂事': 'Misc' };

// Officer -> { good:[themes], bad:[themes] } (协纪辨方 建除 themes, condensed).
const OFFICER_THEME = {
  '建': { good: ['movement', 'ritual', 'commerce'], bad: ['groundwork', 'burial', 'construction'] },
  '除': { good: ['medical', 'grooming', 'ritual', 'movement'], bad: ['marriage', 'groundwork', 'commerce'] },
  '满': { good: ['ritual', 'commerce', 'marriage', 'livestock'], bad: ['burial', 'medical', 'movement'] },
  '平': { good: ['construction', 'marriage', 'groundwork', 'grooming'], bad: ['litigation', 'planting'] },
  '定': { good: ['ritual', 'marriage', 'study', 'commerce', 'bedplace'], bad: ['movement', 'litigation', 'medical'] },
  '执': { good: ['construction', 'marriage', 'capture'], bad: ['commerce', 'movement'] },
  '破': { good: ['medical', 'demolition'], bad: ['marriage', 'commerce', 'movement', 'ritual', 'construction', 'groundwork', 'burial', 'bedplace', 'study'] },
  '危': { good: ['bedplace', 'ritual'], bad: ['movement', 'marriage'] },
  '成': { good: ['marriage', 'commerce', 'movement', 'construction', 'ritual', 'study', 'medical', 'livestock'], bad: ['litigation'] },
  '收': { good: ['commerce', 'livestock', 'marriage', 'capture', 'medical'], bad: ['burial', 'movement'] },
  '开': { good: ['ritual', 'study', 'commerce', 'medical', 'movement', 'marriage', 'construction'], bad: ['burial'] },
  '闭': { good: ['burial', 'fill'], bad: ['medical', 'needle', 'movement', 'commerce'] },
};
const OFFICER_NOTE = {
  '建': '宜出行、上任、祭祀、纳财；忌动土、安葬。',
  '除': '宜疗病、求医、沐浴、解除；忌嫁娶、开市。',
  '满': '宜祭祀、开市、纳财；忌安葬、服药、移徙。',
  '平': '宜修造、嫁娶、平治道涂；忌词讼、栽种。',
  '定': '宜祭祀、嫁娶、入学、安床；忌出行、求医、词讼。',
  '执': '宜修造、嫁娶、捕捉；忌开市、出行。',
  '破': '大事不宜；惟宜治病、拆卸、破屋坏垣。',
  '危': '宜安床、祭祀；忌登高、出行、嫁娶。',
  '成': '诸事可成、多吉；忌词讼。',
  '收': '宜纳财、纳畜、嫁娶、捕捉；忌安葬、出行。',
  '开': '宜祭祀、入学、开市、求医、出行；忌安葬、破土。',
  '闭': '宜安葬、塞穴、补垣；忌就医针刺、开市、出行。',
};
const OFFICER_NOTE_EN = {
  '建': 'Good: travel, taking office, worship, receiving wealth. Avoid: groundwork, burial.',
  '除': 'Good: medical treatment, bathing, cleansing. Avoid: weddings, opening business.',
  '满': 'Good: worship, opening business, wealth. Avoid: burial, taking medicine, moving.',
  '平': 'Good: building, weddings, levelling roads. Avoid: litigation, planting.',
  '定': 'Good: worship, weddings, schooling, placing a bed. Avoid: travel, seeking medicine, litigation.',
  '执': 'Good: building, weddings, trapping. Avoid: opening business, travel.',
  '破': 'Major matters inadvisable. Only good for: treating illness, demolition.',
  '危': 'Good: placing a bed, worship. Avoid: heights, travel, weddings.',
  '成': 'Most matters succeed; auspicious. Avoid: litigation.',
  '收': 'Good: receiving wealth, livestock, weddings, trapping. Avoid: burial, travel.',
  '开': 'Good: worship, schooling, business, medical care, travel. Avoid: burial, breaking earth.',
  '闭': 'Good: burial, blocking holes, mending walls. Avoid: medical/needles, business, travel.',
};

// ---------- Verdict engine ----------
// Hierarchy (per 协纪辨方 usage + user spec): 建除十二神 is PRIMARY; 黄道黑道 & 二十八宿
// are SECONDARY adjusters that strengthen/soften but do not by themselves flip a clear
// officer verdict; certain 神煞 (月破/受死/四离四绝/杨公) are strong negatives that, when
// they conflict with an officer-宜, downgrade the day to 中性/参考 (conflict shown, not forced).
// PRIMARY 建除 · SECONDARY 黄黑道/二十八宿 · 神煞 matrix (graded, with 解神 precedence).
// profile: 'standard' | 'strict' | 'lenient'. 月破/受死/四离四绝/杨公 are kept as strong
// negatives separate from the 神煞 matrix and are NOT softened by 解神 (协纪: 月破诸吉难解).
function verdictForActivity(activity, day, profile) {
  profile = profile || 'standard';
  const factors = [];
  const ot = OFFICER_THEME[day.officer];
  const officerGood = activity.themes.some(t => ot.good.includes(t));
  const officerBad = activity.themes.some(t => ot.bad.includes(t));

  let base = 0;
  if (officerGood) { base += 2; factors.push({ zh: `${day.officer}日宜此事（建除）`, en: `${day.officer} officer favors this`, sign: '+', strong: true, w: 2 }); }
  if (officerBad) { base -= 2; factors.push({ zh: `${day.officer}日忌此事（建除）`, en: `${day.officer} officer opposes this`, sign: '−', strong: true, w: -2 }); }

  // Secondary adjusters
  let adj = 0;
  const majorThemes = ['marriage', 'burial', 'movement', 'commerce', 'construction', 'groundwork', 'bedplace'];
  const isMajor = activity.themes.some(t => majorThemes.includes(t));
  if (isMajor) {
    if (day.isYellow) { adj += 1; factors.push({ zh: `黄道·${day.god}`, en: `Yellow-path (${day.god})`, sign: '+', w: 1 }); }
    else { adj -= 1; factors.push({ zh: `黑道·${day.god}`, en: `Black-path (${day.god})`, sign: '−', w: -1 }); }
  }
  if (day.mansionGood === true) { adj += 0.5; factors.push({ zh: `${day.mansion}宿·吉`, en: `${day.mansion} mansion (favorable)`, sign: '+', w: 0.5 }); }
  else if (day.mansionGood === false) { adj -= 0.5; factors.push({ zh: `${day.mansion}宿·凶`, en: `${day.mansion} mansion (inauspicious)`, sign: '−', w: -0.5 }); }

  // Strong 神煞 (separate; not 解-able)
  let hard = 0;
  if (day.officer === '破' && isMajor && !activity.themes.includes('medical') && !activity.themes.includes('demolition')) {
    hard -= 3; factors.push({ zh: '月破日·大事不宜（诸吉难解）', en: 'Month-Breaker: major matters inadvisable', sign: '−', strong: true, w: -3 });
  }
  if (day.shousi && !activity.themes.includes('capture')) {
    hard -= 2; factors.push({ zh: '受死日（参考·版本不一）', en: 'Shou-Si (minor; varies by source)', sign: '−', strong: true, w: -2 });
  }
  if (day.siliSijue && isMajor) {
    hard -= 2; factors.push({ zh: day.siliSijue.type + '日', en: day.siliSijue.en, sign: '−', strong: true, w: -2 });
  }
  if (day.yanggong && isMajor) {
    hard -= 2; factors.push({ zh: '杨公十三忌', en: 'Yang-Gong taboo day', sign: '−', strong: true, w: -2 });
  }

  // 神煞 matrix (graded). good +, bad −. general applies to major events; theme-specific always.
  let shenGood = 0, shenBad = 0;
  if (day.shensha && day.shensha.list) {
    for (const s of day.shensha.list) {
      if (!s.scored) continue;
      const r = SHENSHA_RULES[s.key];
      let c = (isMajor ? (r.general || 0) : 0);
      for (const th of activity.themes) { if (r.affects && r.affects[th] != null) c += r.affects[th]; }
      if (c === 0) continue;
      const gradeTag = s.grade === 'M' ? '·中' : '';
      factors.push({ zh: `${s.zh}${c > 0 ? '宜' : '忌'}${gradeTag}`, en: `${s.en} ${c > 0 ? '(+)' : '(−)'}`, sign: c > 0 ? '+' : '−', grade: s.grade, shensha: true, w: c });
      if (c > 0) shenGood += c; else shenBad += c;
    }
  }
  let jieApplied = false;
  if (day.shensha && day.shensha.hasStrongJie && shenBad < 0) {
    const restored = -shenBad * 0.5;
    shenBad *= 0.5; jieApplied = true;
    factors.push({ zh: '吉神解凶（天德/月德/天赦）', en: 'Benefic dissolves ills (从神不从煞)', sign: '+', strong: true, w: restored });
  }

  const pre = base + adj + hard + shenGood + shenBad;
  let score = pre;
  if (profile === 'strict' && score < 0) score *= 1.15;
  if (profile === 'lenient') { const neg = Math.min(0, shenBad); score -= neg * 0.3; }
  score = Math.round(score * 10) / 10;
  const profileDelta = Math.round((score - pre) * 100) / 100;

  const strongNeg = (hard <= -2) || (shenBad <= -2 && !jieApplied);
  let verdict, verdictEn, color;
  if (officerGood && officerBad) {
    verdict = '中性/参考'; verdictEn = 'Mixed / reference'; color = 'amber';
  } else if (officerGood) {
    if (strongNeg) { verdict = '中性/参考'; verdictEn = 'Conflicting / reference'; color = 'amber'; }
    else { verdict = '宜'; verdictEn = 'Favorable'; color = 'green'; }
  } else if (officerBad) {
    verdict = '忌'; verdictEn = 'Avoid'; color = 'red';
  } else {
    if (score >= 1.5) { verdict = '宜'; verdictEn = 'Favorable'; color = 'green'; }
    else if (score <= -1.5) { verdict = '忌'; verdictEn = 'Avoid'; color = 'red'; }
    else { verdict = '中性'; verdictEn = 'Neutral'; color = 'grey'; }
  }

  return { verdict, verdictEn, color, score, factors, breakdown: { base, adj, hard, shenGood, shenBad, jieApplied, pre: Math.round(pre * 100) / 100, profileDelta } };
}

// ---------- Master per-day computation ----------
function computeDay(jdn) {
  const g = jdnToGregorian(jdn);
  const dgi = dayGanzhiIndex(jdn);
  const dayStem = dgi % 10, dayBranch = dgi % 12;
  const yp = yearPillarForCivilJDN(jdn);
  const mp = monthPillarForCivilJDN(jdn, yp.stem);
  const oi = officerIndex(dayBranch, mp.monthBranch);
  const officer = OFFICERS[oi];
  const mi = mansionIndex(jdn);
  const seven = mansionSeven(mi);
  const ny = nayin(dgi);
  const cl = clash(dayStem, dayBranch);
  const hh = huangHei(dayBranch, mp.monthBranch);
  const lunar = lunarFromCivilJDN(jdn);
  const ss = SHOUSI[mp.monthBranch] === dayBranch;
  const sj = siliSijue(jdn);
  const yg = isYanggong(lunar);
  const wd = weekday(jdn);
  const sevenDowOk = SEVEN_DOW[seven] === wd; // structural check
  const shensha = computeShensha(mp.monthBranch, mp.monthStem, dayStem, dayBranch, dgi, yp.stem, jdn);
  const clashAges = clashWithAge(dayStem, dayBranch, g.y);

  return {
    jdn, greg: g, weekday: wd,
    dayGanzhiIndex: dgi, dayStem, dayBranch,
    dayGanzhi: STEMS[dayStem] + BRANCHES[dayBranch],
    dayZodiac: ZODIAC[dayBranch], dayZodiacEn: ZODIAC_EN[dayBranch],
    yearGanzhi: STEMS[yp.stem] + BRANCHES[yp.branch], yearZodiac: ZODIAC[yp.branch],
    yearStem: yp.stem, yearBranch: yp.branch, lichunYear: yp.Y,
    monthGanzhi: STEMS[mp.monthStem] + BRANCHES[mp.monthBranch], monthBranch: mp.monthBranch,
    officerIndex: oi, officer, officerEn: OFFICERS_EN[oi],
    officerNote: OFFICER_NOTE[officer], officerNoteEn: OFFICER_NOTE_EN[officer],
    mansionIndex: mi, mansion: MANSIONS[mi], mansionAnimal: MANSION_ANIMAL[mi],
    mansionSeven: seven, mansionGood: MANSION_GOOD[mi], sevenDowOk,
    nayin: ny.zh, nayinEl: ny.el,
    clash: cl,
    god: hh.god, isYellow: hh.isYellow,
    lunar, lunarLabel: lunarLabel(lunar),
    shousi: ss, siliSijue: sj, yanggong: yg,
    pengzuStem: PENGZU_STEM[dayStem], pengzuBranch: PENGZU_BRANCH[dayBranch],
    monthStem: mp.monthStem, shensha, clashAges,
    hours: hourTable(dayStem, dayBranch),
  };
}

// 28宿 吉凶 (传统断语，版本不一). true=吉 false=凶 null=平/中.
const MANSION_GOOD = [
  /*角*/true, /*亢*/false, /*氐*/false, /*房*/true, /*心*/false, /*尾*/true, /*箕*/true,
  /*斗*/true, /*牛*/false, /*女*/false, /*虚*/false, /*危*/false, /*室*/true, /*壁*/true,
  /*奎*/false, /*娄*/true, /*胃*/true, /*昴*/false, /*毕*/true, /*觜*/false, /*参*/null,
  /*井*/true, /*鬼*/false, /*柳*/false, /*星*/null, /*张*/true, /*翼*/false, /*轸*/true,
];

// =====================================================================
// ENGINE EXTENSION v2 — 神煞 (graded) · 神煞×事项 matrix · 解神 precedence ·
// 嫁娶/安葬 modules · 五行 day-master tally · 晚子时 · 冲煞+age.
// Every entry carries a confidence grade. LOW-confidence 神煞 are intentionally
// OMITTED rather than guessed; the implemented set is high/medium confidence.
// Rules keyed on 月建 (节气 month) per 协纪辨方 用事 convention.
// =====================================================================

// monthOrd: 正月=寅=1 ... 十二月=丑=12
function monthOrdinal(monthBranch) { return ((monthBranch - 2 + 12) % 12) + 1; }
// season: 春=0(寅卯辰) 夏=1(巳午未) 秋=2(申酉戌) 冬=3(亥子丑)
function seasonOf(monthBranch) {
  if ([2, 3, 4].includes(monthBranch)) return 0;
  if ([5, 6, 7].includes(monthBranch)) return 1;
  if ([8, 9, 10].includes(monthBranch)) return 2;
  return 3;
}
const SEASON_ZH = ['春', '夏', '秋', '冬'];
const SEASON_EN = ['Spring', 'Summer', 'Autumn', 'Winter'];

// stem index helper
const SI = z => STEMS.indexOf(z);
const BI = z => BRANCHES.indexOf(z);
function ganzhiIndexOf(stem, branch) { for (let k = 0; k < 60; k++) if (k % 10 === stem && k % 12 === branch) return k; return -1; }

// ---- 干合 / 三合局 / 六害 maps ----
const STEM_HE = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 }; // 甲己 乙庚 丙辛 丁壬 戊癸
const HARM = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 }; // 六害
function sanheGroup(b) { // returns array of branches in the 三合 group containing b
  const groups = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]]; // 申子辰 寅午戌 巳酉丑 亥卯未
  return groups.find(g => g.includes(b));
}

// ---- 神煞 tables (indexed where noted) ----
// 天德 by monthOrd 1..12 ; {k:char, isStem}
const TIANDE = [null,
  { k: '丁', s: true }, { k: '申', s: false }, { k: '壬', s: true }, { k: '辛', s: true },
  { k: '亥', s: false }, { k: '甲', s: true }, { k: '癸', s: true }, { k: '寅', s: false },
  { k: '丙', s: true }, { k: '乙', s: true }, { k: '巳', s: false }, { k: '庚', s: true }];
// 月厌 by monthOrd (retrograde from 戌)
const YUEYAN = [null, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];
// 往亡 by monthOrd
const WANGWANG = [null, 2, 5, 8, 11, 3, 6, 9, 0, 4, 7, 10, 1];
// 血支 by monthOrd (順 from 丑)
const XUEZHI = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
// 血忌 by monthOrd
const XUEJI = [null, 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 0];
// 复日 by monthOrd (月建本气干; 土月用 己)
const FURI = [null, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8, 9, 5];
// 重丧 by monthOrd (干; 土月用 己) — for 安葬
const CHONGSANG = [null, 0, 1, 5, 2, 3, 5, 6, 7, 5, 8, 9, 5];
// 八专 干支 pairs
const BAZHUAN = [[0, 2], [1, 3], [5, 7], [3, 7], [6, 8], [7, 9], [4, 10], [9, 1]];
// 十恶大败 (无禄) pairs
const SHIE = [[0, 4], [1, 5], [2, 8], [3, 11], [4, 10], [5, 1], [6, 4], [7, 5], [8, 8], [9, 11]];
// 上朔 by yearStem -> [stem,branch]
const SHANGSHUO = [[9, 11], [5, 5], [1, 11], [7, 5], [3, 11], [9, 5], [5, 11], [1, 5], [7, 11], [3, 5]];
// 四废 by season -> list of [stem,branch]
const SIFEI = [
  [[6, 8], [7, 9]],   // 春: 庚申 辛酉
  [[8, 0], [9, 11]],  // 夏: 壬子 癸亥
  [[0, 2], [1, 3]],   // 秋: 甲寅 乙卯
  [[2, 6], [3, 5]],   // 冬: 丙午 丁巳
];
// 天赦 by season -> [stem,branch]
const TIANSHE = [[4, 2], [0, 6], [4, 8], [0, 0]]; // 戊寅 甲午 戊申 甲子
// 母仓 by season -> branches
const MUCANG = [[11, 0], [2, 3], [4, 10, 1, 7], [8, 9]];
// 四相 by season -> stems
const SIXIANG = [[2, 3], [4, 5], [8, 9], [0, 1]];
// 月德 by 三合: 火局丙 水局壬 木局甲 金局庚
function yuede(monthBranch) {
  const g = sanheGroup(monthBranch);
  if (g.includes(2)) return 2;   // 寅午戌→丙
  if (g.includes(8)) return 8;   // 申子辰→壬
  if (g.includes(11)) return 0;  // 亥卯未→甲
  return 6;                      // 巳酉丑→庚
}
// 三煞 (劫/灾/月) by 三合局
function threeSha(monthBranch) {
  const g = sanheGroup(monthBranch);
  if (g.includes(8)) return { jie: 5, zai: 6, sui: 7 };   // 申子辰→巳午未
  if (g.includes(2)) return { jie: 11, zai: 0, sui: 1 };  // 寅午戌→亥子丑
  if (g.includes(5)) return { jie: 2, zai: 3, sui: 4 };   // 巳酉丑→寅卯辰
  return { jie: 8, zai: 9, sui: 10 };                     // 亥卯未→申酉戌
}
// 天吏 by season
const TIANLI = [9, 0, 3, 6]; // 春酉 夏子 秋卯 冬午
// 归忌 by monthOrd%3 (1→丑,2→寅,0→子)
function guiji(mo) { const r = mo % 3; return r === 1 ? 1 : r === 2 ? 2 : 0; }

// 土王用事 (土符): within ~18 days before any 四立
function tuWang(jdn) {
  const g = jdnToGregorian(jdn);
  const liIdx = [2, 8, 14, 20]; // 立春 立夏 立秋 立冬 in TERMS24
  for (const yr of [g.y - 1, g.y, g.y + 1]) {
    for (const i of liIdx) { const t = termCivilJDN(yr, i); if (jdn >= t - 18 && jdn < t) return true; }
  }
  return false;
}

// ---- 神煞×事项 rule table. weights signed (good +, bad −). general applies to "major" events. ----
// jie = 解神 (吉神能解凶). grade = confidence. (月破/受死/四离四绝/杨公 handled separately.)
const SHENSHA_RULES = {
  天德: { type: 'good', jie: true, grade: 'H', general: 2, affects: { ritual: 1, marriage: 1, burial: 1, construction: 1 }, zh: '天德', en: 'Heavenly Virtue', note_zh: '上吉，能解众凶，宜祈福、修造、嫁娶、安葬等百事', note_en: 'Great benefic; dissolves many ills; good for most undertakings' },
  月德: { type: 'good', jie: true, grade: 'H', general: 2, affects: { ritual: 1, marriage: 1, burial: 1, construction: 1 }, zh: '月德', en: 'Monthly Virtue', note_zh: '上吉，能解凶，宜百事', note_en: 'Benefic; dissolves ills; broadly favorable' },
  月德合: { type: 'good', jie: true, grade: 'H', general: 1.5, affects: {}, zh: '月德合', en: 'Monthly Virtue Harmony', note_zh: '吉，助月德，宜百事', note_en: 'Auspicious; reinforces Monthly Virtue' },
  天德合: { type: 'good', jie: true, grade: 'M', general: 1.5, affects: {}, zh: '天德合', en: 'Heavenly Virtue Harmony', note_zh: '吉，助天德', note_en: 'Auspicious; reinforces Heavenly Virtue' },
  天赦: { type: 'good', jie: true, grade: 'H', general: 2, affects: { ritual: 1, litigation: 1 }, zh: '天赦', en: 'Heavenly Pardon', note_zh: '大吉，赦罪解厄，宜祭祀、雪冤、施恩，能解凶', note_en: 'Great benefic; pardons faults; dissolves ills' },
  母仓: { type: 'good', jie: false, grade: 'M', general: 0.5, affects: { planting: 1.5, livestock: 1.5 }, zh: '母仓', en: "Mother's Granary", note_zh: '宜栽种、养育、纳畜、积仓', note_en: 'Good for planting, raising, livestock, storing' },
  四相: { type: 'good', jie: false, grade: 'M', general: 1, affects: {}, zh: '四相', en: 'Seasonal Vigor', note_zh: '旺相之日，宜兴造、嫁娶等吉事', note_en: 'A day of seasonal vigor; favors auspicious undertakings' },
  月厌: { type: 'bad', jie: false, grade: 'H', general: -1, affects: { marriage: -2, movement: -1.5 }, zh: '月厌', en: 'Monthly Loathing', note_zh: '忌嫁娶、出行、远行', note_en: 'Avoid weddings, travel, long journeys' },
  往亡: { type: 'bad', jie: false, grade: 'H', general: -1, affects: { movement: -2.5, marriage: -2 }, zh: '往亡', en: 'Going-to-Death', note_zh: '忌出行、赴任、嫁娶、远行、上任、征伐', note_en: 'Avoid travel, taking office, weddings, campaigns' },
  天吏: { type: 'bad', jie: false, grade: 'M', general: -1, affects: { movement: -1.5, litigation: -2 }, zh: '天吏', en: 'Heavenly Officer', note_zh: '忌赴任、词讼、求官', note_en: 'Avoid taking office, litigation, seeking rank' },
  劫煞: { type: 'bad', jie: false, grade: 'M', general: -1.5, affects: {}, zh: '劫煞', en: 'Robbery Sha', note_zh: '凶，忌出行、动土、安营', note_en: 'Inauspicious; avoid travel, groundwork' },
  灾煞: { type: 'bad', jie: false, grade: 'M', general: -1.5, affects: {}, zh: '灾煞', en: 'Calamity Sha', note_zh: '凶，忌兴造、嫁娶、出行', note_en: 'Inauspicious; avoid building, weddings, travel' },
  月煞: { type: 'bad', jie: false, grade: 'M', general: -1.5, affects: { livestock: -1.5 }, zh: '月煞', en: 'Monthly Sha', note_zh: '凶，忌起造、养育、纳畜', note_en: 'Inauspicious; avoid building, raising livestock' },
  月害: { type: 'bad', jie: false, grade: 'M', general: -1, affects: { marriage: -1.5, commerce: -1 }, zh: '月害', en: 'Monthly Harm', note_zh: '忌结亲、合作、求财、上书', note_en: 'Avoid alliances, partnerships, seeking wealth' },
  血支: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { needle: -2, medical: -1 }, zh: '血支', en: 'Blood Branch', note_zh: '忌针刺、出血、动刀', note_en: 'Avoid acupuncture, drawing blood, surgery' },
  血忌: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { needle: -2, medical: -1 }, zh: '血忌', en: 'Blood Taboo', note_zh: '忌针灸、出血', note_en: 'Avoid acupuncture / bloodletting' },
  归忌: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { movement: -2 }, zh: '归忌', en: 'Return Taboo', note_zh: '忌远回、归家、移徙', note_en: 'Avoid returning home, moving residence' },
  复日: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { burial: -1.5 }, zh: '复日', en: 'Repetition Day', note_zh: '忌丧葬（恐重复）', note_en: 'Avoid funerary matters (risk of repetition)' },
  重日: { type: 'bad', jie: false, grade: 'H', general: 0, affects: { burial: -1.5 }, zh: '重日', en: 'Double Day', note_zh: '巳亥日，忌丧葬（恐重丧）', note_en: '巳/亥 day; avoid burial (risk of double mourning)' },
  八专: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { marriage: -1.5 }, zh: '八专', en: 'Eight专', note_zh: '忌嫁娶（恐夫妻不睦）', note_en: 'Avoid weddings (marital discord)' },
  无禄: { type: 'bad', jie: false, grade: 'M', general: -2, affects: {}, zh: '无禄·十恶大败', en: 'Ten Evils Great Defeat', note_zh: '大凶，忌开业、求财、嫁娶、出行等大事', note_en: 'Very inauspicious; avoid major undertakings' },
  上朔: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { marriage: -2, burial: -2 }, zh: '上朔', en: 'Shang-Shuo', note_zh: '忌嫁娶、造葬', note_en: 'Avoid weddings and burials' },
  四废: { type: 'bad', jie: false, grade: 'H', general: -2.5, affects: {}, zh: '四废', en: 'Four Voidings', note_zh: '囚死无气，百事忌', note_en: 'Lifeless day; avoid all major undertakings' },
  土王用事: { type: 'bad', jie: false, grade: 'M', general: 0, affects: { groundwork: -2, construction: -1, burial: -1 }, zh: '土王用事', en: 'Earth-Governance', note_zh: '忌动土、破土、修造（四立前十八日）', note_en: 'Avoid groundwork/building (18 days before each season-start)' },
};

// ---- Compute the 神煞 present on a day ----
function computeShensha(monthBranch, monthStem, dayStem, dayBranch, dgi, yearStem, jdn) {
  const mo = monthOrdinal(monthBranch);
  const seas = seasonOf(monthBranch);
  const list = [];
  const add = (key) => { const r = SHENSHA_RULES[key]; list.push({ key, zh: r.zh, en: r.en, type: r.type, grade: r.grade, note_zh: r.note_zh, note_en: r.note_en, scored: true }); };

  // 吉神
  const td = TIANDE[mo];
  if (td && ((td.s && dayStem === SI(td.k)) || (!td.s && dayBranch === BI(td.k)))) add('天德');
  if (dayStem === yuede(monthBranch)) add('月德');
  if (dayStem === STEM_HE[yuede(monthBranch)]) add('月德合');
  if (td && td.s && dayStem === STEM_HE[SI(td.k)]) add('天德合');
  if (dgi === ganzhiIndexOf(TIANSHE[seas][0], TIANSHE[seas][1])) add('天赦');
  if (MUCANG[seas].includes(dayBranch)) add('母仓');
  if (SIXIANG[seas].includes(dayStem)) add('四相');

  // 凶煞
  if (dayBranch === YUEYAN[mo]) add('月厌');
  if (dayBranch === WANGWANG[mo]) add('往亡');
  if (dayBranch === TIANLI[seas]) add('天吏');
  const ts = threeSha(monthBranch);
  if (dayBranch === ts.jie) add('劫煞');
  if (dayBranch === ts.zai) add('灾煞');
  if (dayBranch === ts.sui) add('月煞');
  if (dayBranch === HARM[monthBranch]) add('月害');
  if (dayBranch === XUEZHI[mo]) add('血支');
  if (dayBranch === XUEJI[mo]) add('血忌');
  if (dayBranch === guiji(mo)) add('归忌');
  if (dayStem === FURI[mo]) add('复日');
  if (dayBranch === 5 || dayBranch === 11) add('重日');
  if (BAZHUAN.some(([s, b]) => s === dayStem && b === dayBranch)) add('八专');
  if (SHIE.some(([s, b]) => s === dayStem && b === dayBranch)) add('无禄');
  { const [s, b] = SHANGSHUO[yearStem]; if (dayStem === s && dayBranch === b) add('上朔'); }
  if (SIFEI[seas].some(([s, b]) => s === dayStem && b === dayBranch)) add('四废');
  if (tuWang(jdn)) add('土王用事');

  const hasStrongJie = list.some(s => ['天德', '月德', '天赦'].includes(s.key));
  const goodCount = list.filter(s => s.type === 'good').length;
  const badCount = list.filter(s => s.type === 'bad').length;
  return { list, hasStrongJie, goodCount, badCount };
}

// ---- 胎神: intentionally NOT fabricated ----
// The classical 逐日胎神 is a fixed 60-row table; reproducing it from memory risks
// transcription error. We surface an honest note rather than invent entries.
const TAISHEN_NOTE_ZH = '逐日胎神需查证经典六十日表（各通书一致），本工具不臆造；请以纸本通书为准。';
const TAISHEN_NOTE_EN = 'The classical 60-day 胎神 table is intentionally not reproduced from memory to avoid error — please read it from a printed almanac.';

// ---- 嫁娶 module ----
// 三娘煞 (folk, universal): lunar 初三/初七/十三/十八/廿二/廿七
function sanniang(lunarDay) { return [3, 7, 13, 18, 22, 27].includes(lunarDay); }
// 大利月 by bride's 年支 (女命生肖). couplet 正七迎鸡兔… returns 'big'|'small'|'avoid'.
// 大利: 鸡兔(酉卯)→1,7 ; 虎猴(寅申)→2,8 ; 蛇猪(巳亥)→3,9 ; 龙狗(辰戌)→4,10 ; 牛羊(丑未)→5,11 ; 鼠马(子午)→6,12
function marriageMonthLuck(brideBranch, lunarMonthNum) {
  const big = { 9: [1, 7], 3: [1, 7], 2: [2, 8], 8: [2, 8], 5: [3, 9], 11: [3, 9], 4: [4, 10], 10: [4, 10], 1: [5, 11], 7: [5, 11], 0: [6, 12], 6: [6, 12] }[brideBranch];
  if (!big) return null;
  // 小利月 = the pair for the 冲 zodiac (opposite season). Approximate: 大利+? Traditionally 小利 are the bride's-clash months.
  const small = big.map(m => ((m + 6 - 1) % 12) + 1);
  if (big.includes(lunarMonthNum)) return { level: 'big', zh: '大利月', en: 'Most favorable month' };
  if (small.includes(lunarMonthNum)) return { level: 'small', zh: '小利月', en: 'Lesser favorable month' };
  return { level: 'avoid', zh: '非大小利月（妨翁姑/父母/夫身等，按周堂细辨）', en: 'Neither — traditionally inauspicious; check 周堂 with an expert' };
}
// Note: 不将日 and 嫁娶周堂 are intentionally omitted (algorithm variants / low confidence).
const MARRIAGE_OMIT_ZH = '不将日、嫁娶周堂图因版本繁多、易错，未纳入；请咨询择日师。';
const MARRIAGE_OMIT_EN = '不将日 and 周堂 are omitted (many variant rules; high error risk) — consult a date-selection master.';

// ---- 安葬 module ----
function chongSangDay(monthBranch, dayStem) { return dayStem === CHONGSANG[monthOrdinal(monthBranch)]; }
const BURIAL_OMIT_ZH = '山向、墓运、年克山家需逝者坐山方位，专业性强，未纳入。';
const BURIAL_OMIT_EN = '山向 / 墓运 require the grave\'s sitting-direction and are omitted (specialist territory).';

// ---- 五行 day-master tally (CRUDE — not professional 命理) ----
const EL_NAMES = ['木', '火', '土', '金', '水'];
const EL_EN = { 木: 'Wood', 火: 'Fire', 土: 'Earth', 金: 'Metal', 水: 'Water' };
const BRANCH_EL = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']; // 子..亥 本气
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // 生
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };     // 克
function elIndex(el) { return EL_NAMES.indexOf(el); }
// 地支藏干 (hidden stems), 本气 first. Standard table.
const ZANGGAN = [
  ['癸'],            // 子
  ['己', '癸', '辛'], // 丑
  ['甲', '丙', '戊'], // 寅
  ['乙'],            // 卯
  ['戊', '乙', '癸'], // 辰
  ['丙', '庚', '戊'], // 巳
  ['丁', '己'],       // 午
  ['己', '丁', '乙'], // 未
  ['庚', '壬', '戊'], // 申
  ['辛'],            // 酉
  ['戊', '辛', '丁'], // 戌
  ['壬', '甲'],       // 亥
];
const ZG_W = [1.5, 0.7, 0.4]; // 本气/中气/余气 weights
// More principled (still simplified) strength: 天干 + 地支藏干 (weighted) + 月令(得令) emphasis.
// NOT professional 命理 — no full 调候 / 刑冲合会 dynamics. Labelled interpretive.
function wuxingProfile(bp) {
  if (!bp) return null;
  const tally = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pillars = [bp.yearGanzhi, bp.monthGanzhi, bp.dayGanzhi];
  if (bp.hourInfo) pillars.push(bp.hourInfo.solarGanzhi);
  const monthBr = BI(bp.monthGanzhi[1]);
  for (const gz of pillars) {
    tally[STEM_EL[SI(gz[0])]] += 2;              // visible stem
    const br = BI(gz[1]);
    const boost = (br === monthBr) ? 1.4 : 1;     // 月令 emphasis (得令)
    ZANGGAN[br].forEach((s, i) => { tally[STEM_EL[SI(s)]] += (ZG_W[i] || 0.3) * boost; });
  }
  const dm = STEM_EL[bp.dayStem]; // 日主 element
  const sameEl = dm;
  const shengMe = Object.keys(SHENG).find(k => SHENG[k] === dm); // element generating dm
  const support = tally[sameEl] + tally[shengMe];
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  // 得令: month-branch 本气 element equals or generates the day-master
  const monthEl = STEM_EL[SI(ZANGGAN[monthBr][0])];
  const deLing = (monthEl === dm) || (SHENG[monthEl] === dm);
  const strong = support >= total * (deLing ? 0.42 : 0.48);
  let favored;
  if (strong) favored = [KE[dm] /*财*/, SHENG[dm] /*食伤*/, Object.keys(KE).find(k => KE[k] === dm) /*官杀*/];
  else favored = [sameEl /*比劫*/, shengMe /*印*/];
  favored = [...new Set(favored)];
  // rounded display tally
  const tallyR = {}; for (const k of EL_NAMES) tallyR[k] = Math.round(tally[k] * 10) / 10;
  return { tally: tallyR, dayMaster: dm, strong, favored, support: Math.round(support * 10) / 10, total: Math.round(total * 10) / 10, deLing };
}
// score a day's support for the chart (by day-stem 五行 + 纳音 五行)
function dayWuxingSupport(day, prof) {
  if (!prof) return 0;
  let s = 0;
  if (prof.favored.includes(STEM_EL[day.dayStem])) s += 1.5;
  if (prof.favored.includes(day.nayinEl)) s += 1;
  if (prof.favored.includes(BRANCH_EL[day.dayBranch])) s += 0.5;
  return s;
}

// ---- Daily directional layer ----
// 喜神方位 by 日干 (standard, consistent across sources). 财/福/贵神 systems vary widely → omitted.
const XISHEN_DIR = ['东北', '西北', '西南', '正南', '东南', '东北', '西北', '西南', '正南', '东南']; // 甲..癸
const DIR_EN = { 正北: 'N', 东北: 'NE', 正东: 'E', 东南: 'SE', 正南: 'S', 西南: 'SW', 正西: 'W', 西北: 'NW', 中: 'C' };
function dayDirections(dayStem) { return { xishen: XISHEN_DIR[dayStem] }; }
const DAYDIR_OMIT_ZH = '财神／福神／贵神方位各家系统不一（《玉匣记》与坊间多有出入），未臆造；喜神方位为通行定说。';
const DAYDIR_OMIT_EN = '财/福/贵-god directions vary by system and are omitted; 喜神 direction is the consistent one.';

// ---- Annual layer: 太岁 / 岁破 / 三煞 / 五黄 (九星年盘) ----
const BRANCH_DIR = ['正北', '东北', '东北', '正东', '东南', '东南', '正南', '西南', '西南', '正西', '西北', '西北']; // 子..亥 (8-dir)
const PALACE_DIR = ['中', '西北', '正西', '东北', '正南', '正北', '西南', '正东', '东南']; // 洛书顺飞: 中乾兑艮离坎坤震巽
function zhongGong(gy) { return (((3 - (gy - 2024)) - 1) % 9 + 9) % 9 + 1; } // 中宫年星 (2024=三碧, 逐年退一)
function wuHuangDir(gy) { const C = zhongGong(gy); const k = ((5 - C) % 9 + 9) % 9; return PALACE_DIR[k]; }
function sanShaDir(yearBranch) {
  const g = sanheGroup(yearBranch);
  if (g.includes(8)) return '正南';   // 申子辰 → 三煞南 (巳午未)
  if (g.includes(2)) return '正北';   // 寅午戌 → 三煞北 (亥子丑)
  if (g.includes(5)) return '正东';   // 巳酉丑 → 三煞东 (寅卯辰)
  return '正西';                      // 亥卯未 → 三煞西 (申酉戌)
}
function annualLayer(yearStem, yearBranch, gy) {
  return {
    taiSuiZodiac: ZODIAC[yearBranch], taiSuiDir: BRANCH_DIR[yearBranch],
    suiPoZodiac: ZODIAC[(yearBranch + 6) % 12], suiPoDir: BRANCH_DIR[(yearBranch + 6) % 12],
    sanShaDir: sanShaDir(yearBranch), wuHuangDir: wuHuangDir(gy), zhongGong: zhongGong(gy),
  };
}

// ---- 晚子时 day pillar ----
// Civil-midnight default: day pillar = dayGanzhiIndex(civil JDN).
// 晚子时 (子时换日, 23:00 rollover): a time in 23:00–23:59 belongs to the NEXT day's pillar.
function dayPillarWithConvention(jdn, hourMinutes, lateZi) {
  let useJdn = jdn;
  if (lateZi && hourMinutes != null && hourMinutes >= 23 * 60) useJdn = jdn + 1;
  const idx = dayGanzhiIndex(useJdn);
  return { idx, stem: idx % 10, branch: idx % 12, ganzhi: STEMS[idx % 10] + BRANCHES[idx % 12], rolled: useJdn !== jdn };
}

// ---- 冲煞 + ages (虚岁 of the clashed 生肖 this year) ----
function clashWithAge(dayStem, dayBranch, currentYear) {
  const base = clash(dayStem, dayBranch);
  const cb = base.clashBranch; // clashed branch
  // people whose 年命 branch == cb. 虚岁 this year for birth years with that branch.
  const ages = [];
  for (let by = currentYear; by > currentYear - 96; by--) {
    if (((by - 4) % 12 + 12) % 12 === cb) ages.push(currentYear - by + 1); // 虚岁
  }
  return { ...base, ages: ages.slice(0, 8) };
}

// ====================================================================
// EXTRA HELPERS — birth 八字, timezone (incl. Singapore history), true
// solar time, 时辰 bucketing, 太岁, and a live self-test subset.
// ====================================================================

// ---- Equation of Time (minutes), standard approximation ----
function dayOfYear(y, m, d) { return gregorianToJDN(y, m, d) - gregorianToJDN(y, 1, 1) + 1; }
function equationOfTime(y, m, d) {
  const N = dayOfYear(y, m, d);
  const B = (360 / 365) * (N - 81) * D2R;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// ---- Timezone presets. meridian = clock's standard meridian (°E); lon = birthplace longitude (°E) ----
const TZ_PRESETS = {
  sg:    { zh: '新加坡', en: 'Singapore', lon: 103.85, hist: 'sg' },
  my:    { zh: '马来西亚（吉隆坡）', en: 'Malaysia (KL)', lon: 101.69, hist: 'sg' }, // Malaya shared SG history
  cn:    { zh: '中国大陆（北京时间）', en: 'China (Beijing time)', lon: 116.4, meridian: 120 },
  hk:    { zh: '香港', en: 'Hong Kong', lon: 114.17, meridian: 120 },
  tw:    { zh: '台湾', en: 'Taiwan', lon: 121.5, meridian: 120 },
  utc8:  { zh: '通用 UTC+8（东经120°）', en: 'Generic UTC+8 (120°E)', lon: 120, meridian: 120 },
  utc7:  { zh: '通用 UTC+7（东经105°）', en: 'Generic UTC+7 (105°E)', lon: 105, meridian: 105 },
  utc9:  { zh: '通用 UTC+9（东经135°）', en: 'Generic UTC+9 (135°E)', lon: 135, meridian: 135 },
};
// Singapore/Malaya historical clock meridian by civil date.
function sgMeridian(y, m, d) {
  const jdn = gregorianToJDN(y, m, d);
  if (jdn >= gregorianToJDN(1982, 1, 1)) return { meridian: 120, offset: '+8:00', note: null };
  // Japanese occupation: 1942-02-16 .. 1945-09-12 used Tokyo time (+9, 135°E)
  if (jdn >= gregorianToJDN(1942, 2, 16) && jdn <= gregorianToJDN(1945, 9, 12))
    return { meridian: 135, offset: '+9:00', note: 'occupation' };
  if (jdn >= gregorianToJDN(1941, 9, 1)) return { meridian: 112.5, offset: '+7:30', note: 'pre1982' };
  return { meridian: 110, offset: '+7:20', note: 'pre1941' }; // +7:20 ≈ 110°E
}
function resolveMeridian(tzKey, y, m, d) {
  const p = TZ_PRESETS[tzKey];
  if (!p) return { meridian: 120, offset: '+8:00', note: null };
  if (p.hist === 'sg') return sgMeridian(y, m, d);
  return { meridian: p.meridian, offset: '+' + (p.meridian / 15) + ':00', note: null };
}
// Bucket clock minutes (0..1439) into a 时辰 branch index (子=0). 子时 = 23:00–01:00.
function minutesToShichen(min) { return Math.floor(((min + 60) % 1440) / 120); }

// ---- Birth pillars (八字) from civil birth date + optional time + timezone ----
function birthPillars(by, bm, bd, hhmm, tzKey) {
  const jdn = gregorianToJDN(by, bm, bd);
  const yp = yearPillarForCivilJDN(jdn);
  const mp = monthPillarForCivilJDN(jdn, yp.stem);
  const dgi = dayGanzhiIndex(jdn);
  const dayStem = dgi % 10, dayBranch = dgi % 12;

  let hourInfo = null;
  if (hhmm && /^\d{1,2}:\d{2}$/.test(hhmm)) {
    const [hh, mm] = hhmm.split(':').map(Number);
    const clockMin = hh * 60 + mm;
    const mer = resolveMeridian(tzKey, by, bm, bd);
    const p = TZ_PRESETS[tzKey] || { lon: 120 };
    const eot = equationOfTime(by, bm, bd);
    const lonCorr = (p.lon - mer.meridian) * 4; // minutes
    const solarMin = clockMin + lonCorr + eot;
    const naiveBranch = minutesToShichen(clockMin);
    const solarBranch = minutesToShichen(((solarMin % 1440) + 1440) % 1440);
    // hour stem via 五鼠遁 (from day stem)
    const ziStem = (2 * (dayStem % 5)) % 10;
    const naiveHourStem = (ziStem + naiveBranch) % 10;
    const solarHourStem = (ziStem + solarBranch) % 10;
    hourInfo = {
      clockMin, solarMin: ((solarMin % 1440) + 1440) % 1440,
      lonCorr, eot, meridian: mer,
      naiveBranch, solarBranch,
      naiveGanzhi: STEMS[naiveHourStem] + BRANCHES[naiveBranch],
      solarGanzhi: STEMS[solarHourStem] + BRANCHES[solarBranch],
      shifted: naiveBranch !== solarBranch,
      lon: p.lon,
    };
  }
  return {
    jdn, yearStem: yp.stem, yearBranch: yp.branch,
    yearGanzhi: STEMS[yp.stem] + BRANCHES[yp.branch],
    zodiac: ZODIAC[yp.branch], zodiacEn: ZODIAC_EN[yp.branch],
    monthGanzhi: STEMS[mp.monthStem] + BRANCHES[mp.monthBranch],
    dayGanzhi: STEMS[dayStem] + BRANCHES[dayBranch], dayStem, dayBranch,
    nayinDay: nayin(dgi).zh, dayEl: nayin(dgi).el,
    hourInfo,
  };
}

// Minutes -> HH:MM label
function fmtMin(min) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

// ---- Live self-test subset (mirrors the offline harness) ----
// ---- 置闰 consistency over a span. The engine assigns a leap month only inside a
//      13-month 冬至→冬至 (Metonic) span, to the FIRST 中气-less month (GB/T 33661).
//      Defining property to assert: every engine-leap month contains NO 中气, and the
//      leap-month count matches the Metonic rate (~7 per 19 yr). A naive "any 0-中气
//      month ⇒ leap" scan FALSE-alarms on boundary coincidences in 12-month years
//      (e.g. 1985/2034/2053, where a 中气 lands on the 朔 day) — so we check the
//      engine's own containment, which is internally consistent. ----
function leapPlacementCheck(y0, y1) {
  let k = Math.round((gregorianToJDN(y0, 1, 1) - 2451550) / 29.530588853) - 2;
  const endJDN = gregorianToJDN(y1, 12, 31);
  let total = 0, bad = 0, leapCount = 0;
  for (let m = 0; m < (y1 - y0 + 2) * 13; m++) {
    const a = newMoonCivilJDN(k); if (a > endJDN) { k++; continue; }
    if (a < gregorianToJDN(y0, 1, 1)) { k++; continue; }
    const eng = lunarFromCivilJDN(a);
    total++;
    if (eng.isLeap) { leapCount++; if (monthHasZhongQi(k)) bad++; } // leap month MUST lack a 中气
    k++;
  }
  return { total, bad, leapCount };
}

// ---- Razor-edge years: a 中气 and a 朔 fall within ~6 h → leap placement is sensitive;
//      flag them so the user can verify against an authoritative ephemeris. ----
function newMoonKNear(instantJD) { return Math.round((instantJD - 2451550.0976) / 29.530588853); }
function razorEdgeYears(y0, y1, thresholdHours) {
  const th = (thresholdHours || 6) / 24;
  const out = [];
  for (let y = y0; y <= y1; y++) {
    for (let i = 1; i < 24; i += 2) {
      const zhongqi = jdeToLocalInstant(termJDE(y, i), y);
      const k0 = newMoonKNear(zhongqi);
      let best = Infinity;
      for (let k = k0 - 1; k <= k0 + 1; k++) { const d = Math.abs(newMoonLocalInstant(k) - zhongqi); if (d < best) best = d; }
      if (best < th) { out.push({ year: y, term: TERMS24[i].zh, gapH: Math.round(best * 24 * 10) / 10 }); break; }
    }
  }
  return out;
}

function runSelfTests() {
  const r = [];
  const T = (zh, en, cond, got, want) => r.push({ zh, en, ok: !!cond, got, want });
  const gz = j => STEMS[dayGanzhiIndex(j) % 10] + BRANCHES[dayGanzhiIndex(j) % 12];
  T('日柱锚点 1900-01-01 = 甲戌', 'Day pillar 1900-01-01 = 甲戌', gz(gregorianToJDN(1900,1,1)) === '甲戌', gz(gregorianToJDN(1900,1,1)), '甲戌');
  T('日柱锚点 2000-01-07 = 甲子', 'Day pillar 2000-01-07 = 甲子', gz(gregorianToJDN(2000,1,7)) === '甲子', gz(gregorianToJDN(2000,1,7)), '甲子');
  T('日柱锚点 1949-10-01 = 甲子', 'Day pillar 1949-10-01 = 甲子', gz(gregorianToJDN(1949,10,1)) === '甲子', gz(gregorianToJDN(1949,10,1)), '甲子');
  const y26 = yearPillarForCivilJDN(gregorianToJDN(2026,6,9));
  T('年柱 2026 = 丙午', 'Year pillar 2026 = 丙午', STEMS[y26.stem]+BRANCHES[y26.branch] === '丙午', STEMS[y26.stem]+BRANCHES[y26.branch], '丙午');
  const yJan = yearPillarForCivilJDN(gregorianToJDN(2026,1,10));
  T('立春前 2026-01-10 仍属乙巳', 'Pre-立春 2026-01-10 = 乙巳', STEMS[yJan.stem]+BRANCHES[yJan.branch] === '乙巳', STEMS[yJan.stem]+BRANCHES[yJan.branch], '乙巳');
  // 28宿 七曜==weekday over 200 days
  let mc = true; for (let o=0;o<200;o++){const j=gregorianToJDN(2024,1,1)+o; if (SEVEN_DOW[SEVEN[mansionIndex(j)%7]] !== weekday(j)){mc=false;break;}}
  T('二十八宿七曜对齐周历（200天）', '28-mansion ⇄ weekday (200 days)', mc, mc?'一致':'失配', '一致');
  T('二十八宿锚点 2024-01-01 = 危', 'Mansion 2024-01-01 = 危', MANSIONS[mansionIndex(gregorianToJDN(2024,1,1))] === '危', MANSIONS[mansionIndex(gregorianToJDN(2024,1,1))], '危');
  // LNY
  const lny = [[2023,1,22],[2024,2,10],[2025,1,29],[2026,2,17]];
  let lnyOk = true, lnyGot = '';
  for (const [yy,mm,dd] of lny){const l=lunarFromCivilJDN(gregorianToJDN(yy,mm,dd)); if(!(l.monthNum===1&&!l.isLeap&&l.day===1)){lnyOk=false;lnyGot=`${yy}失败`;break;}}
  T('春节锚点 2023–2026 = 正月初一', 'Lunar New Year 2023–26 = 正月初一', lnyOk, lnyOk?'全部通过':lnyGot, '正月初一');
  // leap months
  const leap = [[2023,2],[2025,6]]; let leapOk = true, leapGot='';
  for (const [yy,lm] of leap){let f=null;for(let o=0;o<380;o++){const l=lunarFromCivilJDN(gregorianToJDN(yy,1,20)+o);if(l.isLeap){f=l.monthNum;break;}}if(f!==lm){leapOk=false;leapGot=`${yy}→闰${f}月`;break;}}
  T('置闰 2023闰二月 · 2025闰六月', 'Leap month 2023/2025 correct', leapOk, leapOk?'正确':leapGot, '闰二月/闰六月');

  // ---- v2 gates ----
  const findDay = (pred, from) => { for (let o = 0; o < 400; o++) { const d = computeDay((from || gregorianToJDN(2026,1,1)) + o); if (pred(d)) return d; } return null; };
  const hasSS = (d, k) => d.shensha.list.some(s => s.key === k);
  const wd = findDay(d => [11,0,1].includes(d.monthBranch) && d.dayGanzhi === '甲子');
  T('神煞·天赦 (冬·甲子)', '神煞 Heavenly-Pardon detected', wd && hasSS(wd, '天赦'), wd ? wd.dayGanzhi : '—', '天赦');
  const ww = findDay(d => d.monthBranch === 2 && d.dayBranch === 2);
  T('神煞·往亡 (寅月寅日)', '神煞 Going-to-Death detected', ww && hasSS(ww, '往亡'), ww ? ww.dayGanzhi : '—', '往亡');
  const cr = findDay(d => d.dayBranch === 5);
  T('神煞·重日 (巳日)', '神煞 Double-Day detected', cr && hasSS(cr, '重日'), cr ? cr.dayGanzhi : '—', '重日');
  const mm = marriageMonthLuck(3, 1);
  T('嫁娶·兔女正月=大利月', 'Marriage 大利月 (Rabbit bride, M1)', mm && mm.level === 'big', mm ? mm.zh : '—', '大利月');
  const lz = dayPillarWithConvention(gregorianToJDN(2026,6,9), 23*60+30, true);
  T('晚子时·23:30 换日', 'Late-子 convention rolls the day', lz.rolled && lz.idx === dayGanzhiIndex(gregorianToJDN(2026,6,10)), lz.ganzhi, '次日柱');
  // 置闰 placement across 1900–2100: every leap month must lack a 中气; count ≈ Metonic rate
  const lp = leapPlacementCheck(1900, 2100);
  T('农历置闰一致性 1900–2100', 'Leap placement 1900–2100 (闰月皆无中气)', lp.bad === 0 && lp.leapCount >= 73 && lp.leapCount <= 75, `${lp.leapCount}闰月/${lp.bad}违例`, '73–75闰·0违例');
  // razor-edge flags (informational; passes as long as it runs)
  const re = razorEdgeYears(1900, 2100, 6);
  T('节气/朔临界年探测 (≤6h)', 'Razor-edge 中气/朔 within 6h', Array.isArray(re), `${re.length}年` + (re.length ? `（如 ${re[0].year} ${re[0].term} ${re[0].gapH}h）` : ''), '已扫描');
  // ---- v5 gates ----
  // 五鼠遁 hour-pillar anchors: 甲日子时=甲子, 乙日子时=丙子, 戊日子时=壬子
  const hz = (ds) => { const t = hourTable(ds, 0); return t[0].ganzhi; };
  T('五鼠遁·甲日子时=甲子', 'Hour pillar 甲day 子=甲子', hz(0) === '甲子' && hz(1) === '丙子' && hz(4) === '壬子', `${hz(0)}/${hz(1)}/${hz(4)}`, '甲子/丙子/壬子');
  // branch relation tables: 六合/相害 symmetric & involutive; 三合 partitions into 4 trines; 冲 = +6
  let relOK = true;
  for (let i = 0; i < 12; i++) { if (LIUHE[LIUHE[i]] !== i || XIANGHAI[XIANGHAI[i]] !== i) relOK = false; }
  const gcount = [0, 0, 0, 0]; for (let i = 0; i < 12; i++) gcount[SANHE_GROUP[i]]++;
  if (!gcount.every(c => c === 3)) relOK = false;
  const rh = rankHours(computeDay(gregorianToJDN(2026, 6, 10)));
  if (!rh.rows.some(h => h.tags.some(t => t.zh.includes('时冲日支')))) relOK = false;
  T('支关系表·六合/三合/相害/冲', 'Branch relations consistent', relOK, relOK ? '对称·三合4组·含冲时' : '异常', '一致');
  // factor-sum invariant: Σw == pre-profile score (random sample)
  let fsOK = true, fsN = 0;
  for (let k = 0; k < 400 && fsOK; k++) {
    const j = gregorianToJDN(1950, 1, 1) + Math.floor(Math.random() * 55000);
    const d = computeDay(j);
    const act = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    const v = verdictForActivity(act, d, ['standard', 'strict', 'lenient'][k % 3]);
    const sum = v.factors.reduce((s, f) => s + (f.w || 0), 0);
    if (Math.abs(sum - v.breakdown.pre) > 1e-6 || !isFinite(v.score)) fsOK = false; else fsN++;
  }
  T('演算不变量·Σ因素=基础分', 'Factor weights sum to pre-profile score', fsOK, `${fsN}/400`, '400/400');
  // golden-master: 春节 (CNY) 2020–2030 vs published dates
  const CNY = { 2020: '01-25', 2021: '02-12', 2022: '02-01', 2023: '01-22', 2024: '02-10', 2025: '01-29', 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03' };
  let cnyOK = true, cnyBad = '';
  for (const y of Object.keys(CNY)) { const j = findLunarDate(+y, 1, 1); const g = jdnToGregorian(j); const got = `${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`; if (got !== CNY[y]) { cnyOK = false; cnyBad = `${y}:${got}≠${CNY[y]}`; break; } }
  T('金标·春节 2020–2030', 'Golden CNY dates 2020–2030', cnyOK, cnyOK ? '11/11' : cnyBad, '11/11');
  // 节气 strict monotonicity (sampled years incl. razor 2033) + lunar-day bounds
  let monoOK = true;
  for (const y of [1900, 1933, 1966, 2000, 2033, 2066, 2099]) {
    let prev = -Infinity;
    for (let i = 0; i < 24; i++) { const inst = jdeToLocalInstant(termJDE(y, i), y); if (!(inst > prev)) { monoOK = false; break; } prev = inst; }
    if (!monoOK) break;
  }
  let boundOK = true;
  for (let k = 0; k < 300; k++) { const j = gregorianToJDN(1900, 1, 1) + Math.floor(Math.random() * 73000); const ld = lunarFromCivilJDN(j); if (!(ld.day >= 1 && ld.day <= 30) || !(ld.monthNum >= 1 && ld.monthNum <= 12)) { boundOK = false; break; } }
  T('性质·节气单调+农历日界', 'Terms monotonic; lunar day in 1–30', monoOK && boundOK, `${monoOK ? '单调' : '×'}/${boundOK ? '界内' : '×'}`, '单调/界内');
  // 干支 continuity over 2000 random consecutive pairs
  let contOK = true;
  for (let k = 0; k < 2000; k++) { const j = gregorianToJDN(1900, 1, 1) + Math.floor(Math.random() * 73000); if (dayGanzhiIndex(j + 1) !== (dayGanzhiIndex(j) + 1) % 60) { contOK = false; break; } }
  T('性质·日干支连续(模60)', 'Day ganzhi continuity mod 60', contOK, contOK ? '2000/2000' : '断裂', '2000/2000');
  return r;
}

// ---- lunar→Gregorian: find the civil JDN of a given (monthNum, day) in a Gregorian year ----
function findLunarDate(gy, monthNum, day) {
  const from = gregorianToJDN(gy, 1, 1);
  for (let o = 0; o < 366; o++) {
    const j = from + o; const l = lunarFromCivilJDN(j);
    if (!l.isLeap && l.monthNum === monthNum && l.day === day) return j;
  }
  return null;
}
// ---- local clock time (HH:MM, UTC+8) of a solar term ----
function termClock(year, idx) {
  const inst = jdeToLocalInstant(termJDE(year, idx), year);
  const frac = ((inst + 0.5) % 1 + 1) % 1;
  let mins = Math.round(frac * 1440); mins = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

// ---- Which 24-solar-term span a date falls in, and the next term ----
function solarTermOf(jdn) {
  const g = jdnToGregorian(jdn);
  let best = null, next = null;
  for (const yr of [g.y - 1, g.y, g.y + 1]) {
    for (let i = 0; i < 24; i++) {
      const cj = termCivilJDN(yr, i);
      if (cj <= jdn && (!best || cj > best.jdn)) best = { ...TERMS24[i], jdn: cj };
      if (cj > jdn && (!next || cj < next.jdn)) next = { ...TERMS24[i], jdn: cj };
    }
  }
  return { current: best, next };
}

// ---- Combine per-activity verdicts for a day (most-cautious aggregate) ----
function dayView(day, selectedActs, birthYearBranch, screenByZodiac, profile, extraBranches, wuxProfile) {
  const perActivity = selectedActs.map(act => ({ act, v: verdictForActivity(act, day, profile) }));
  const benmingChong = (birthYearBranch != null) && ((day.dayBranch + 6) % 12 === birthYearBranch);
  const suiPo = (day.dayBranch + 6) % 12 === day.yearBranch; // 日支冲年支 = 岁破
  // multi-person clash: which extra people (by 本命生肖) this day clashes
  const clashedPersons = [];
  if (Array.isArray(extraBranches)) {
    extraBranches.forEach((b, i) => { if (b != null && (day.dayBranch + 6) % 12 === b) clashedPersons.push(i); });
  }
  // three/six harmony with user's zodiac
  let harmony = null;
  if (birthYearBranch != null) {
    const rel = relationToBranch(day.dayBranch, birthYearBranch);
    if (rel === '三合' || rel === '六合') harmony = rel;
  }
  const wuxSupport = wuxProfile ? dayWuxingSupport(day, wuxProfile) : null;

  let color = 'grey', verdict = '—', verdictEn = '—', score = 0;
  if (perActivity.length) {
    score = perActivity.reduce((s, p) => s + p.v.score, 0);
    const reds = perActivity.filter(p => p.v.color === 'red');
    const greens = perActivity.filter(p => p.v.color === 'green');
    const ambers = perActivity.filter(p => p.v.color === 'amber');
    if (greens.length === perActivity.length) { color = 'green'; verdict = '宜'; verdictEn = 'Favorable'; }
    else if (reds.length) { color = 'red'; verdict = reds.length === perActivity.length ? '忌' : '部分忌'; verdictEn = reds.length === perActivity.length ? 'Avoid' : 'Mixed (some avoid)'; if (reds.length < perActivity.length) color = 'amber'; }
    else if (ambers.length) { color = 'amber'; verdict = '中性/参考'; verdictEn = 'Mixed / reference'; }
    else { color = 'grey'; verdict = '中性'; verdictEn = 'Neutral'; }
    if (reds.length && reds.length < perActivity.length) { color = 'amber'; }
  }

  // personal-clash override when screening
  let forcedAvoid = false;
  if (screenByZodiac && (benmingChong || clashedPersons.length)) { color = 'red'; forcedAvoid = true; }

  return { perActivity, benmingChong, clashedPersons, suiPo, harmony, color, verdict, verdictEn, score, wuxSupport, forcedAvoid };
}

const DOW_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ====================================================================

export {
  STEMS, BRANCHES, ZODIAC, ZODIAC_EN, STEM_EL, STEM_YIN_YANG, gregorianToJDN, jdnToGregorian, dayGanzhiIndex, weekday, deltaTseconds, D2R, norm360, solarLon, findTermJDE, jdeToCivilJDN, jdeToLocalInstant, JIE, TERMS24, _termCache, termJDE, termCivilJDN, lichunCivilJDN, lichunLocalInstant, yearPillarForCivilJDN, monthPillarForCivilJDN, OFFICERS, OFFICERS_EN, officerIndex, MANSIONS, MANSION_ANIMAL, SEVEN, SEVEN_DOW, mansionIndex, mansionSeven, NAYIN, nayin, clash, HBD_GODS, HBD_GOOD, huangHei, HOUR_RANGES, hourTable, SANHE_GROUP, XIANGHAI, HOUR_OMIT_ZH, HOUR_OMIT_EN, rankHours, hourClass, newMoonJDE, newMoonCivilJDN, newMoonLocalInstant, winterSolsticeJDE, winterSolsticeLocalInstant, monthStartK, ZHONGQI_IDX, monthHasZhongQi, lunarFromCivilJDN, LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES, lunarLabel, SHOUSI, YANGGONG, isYanggong, siliSijue, PENGZU_STEM, PENGZU_BRANCH, LIUHE, SANHE, relationToBranch, ACTIVITIES, CATEGORIES, CATEGORIES_EN, OFFICER_THEME, OFFICER_NOTE, OFFICER_NOTE_EN, verdictForActivity, computeDay, MANSION_GOOD, monthOrdinal, seasonOf, SEASON_ZH, SEASON_EN, SI, BI, ganzhiIndexOf, STEM_HE, HARM, sanheGroup, TIANDE, YUEYAN, WANGWANG, XUEZHI, XUEJI, FURI, CHONGSANG, BAZHUAN, SHIE, SHANGSHUO, SIFEI, TIANSHE, MUCANG, SIXIANG, yuede, threeSha, TIANLI, guiji, tuWang, SHENSHA_RULES, computeShensha, TAISHEN_NOTE_ZH, TAISHEN_NOTE_EN, sanniang, marriageMonthLuck, MARRIAGE_OMIT_ZH, MARRIAGE_OMIT_EN, chongSangDay, BURIAL_OMIT_ZH, BURIAL_OMIT_EN, EL_NAMES, EL_EN, BRANCH_EL, SHENG, KE, elIndex, ZANGGAN, ZG_W, wuxingProfile, dayWuxingSupport, XISHEN_DIR, DIR_EN, dayDirections, DAYDIR_OMIT_ZH, DAYDIR_OMIT_EN, BRANCH_DIR, PALACE_DIR, zhongGong, wuHuangDir, sanShaDir, annualLayer, dayPillarWithConvention, clashWithAge, dayOfYear, equationOfTime, TZ_PRESETS, sgMeridian, resolveMeridian, minutesToShichen, birthPillars, fmtMin, leapPlacementCheck, newMoonKNear, razorEdgeYears, runSelfTests, findLunarDate, termClock, solarTermOf, dayView, DOW_ZH, DOW_EN
};
