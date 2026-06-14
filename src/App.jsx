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


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CSS } from './styles.js';
import { DOCS, GLOSS_CATS, GLOSSARY } from './docs.gen.js';
import { loadSaved, saveLocal, loadSavedDates, saveSavedDates, loadProgress, saveProgress } from './lib/storage.js';
import { Icon } from './assets/icons.jsx';
import { Illustration } from './assets/illustrations.jsx';
import { Art } from './assets/art.jsx';
import { Diagram, DIAGRAM_NAMES } from './assets/diagrams.jsx';
import { loadLicence, saveLicence, clearLicence, isEntitled, needsRevalidation, validateLicence, WORKER_URL, CHECKOUT } from './lib/entitlement.js';
import { buildExplanation, explanationToText } from './lib/explain.js';
import {
  STEMS, BRANCHES, ZODIAC, gregorianToJDN, jdnToGregorian, weekday, TERMS24, termCivilJDN, yearPillarForCivilJDN, MANSIONS, MANSION_ANIMAL, SEVEN, mansionIndex, mansionSeven, nayin, clash, LUNAR_DAY_NAMES, lunarLabel, siliSijue, ACTIVITIES, CATEGORIES, CATEGORIES_EN, verdictForActivity, computeDay, rankHours, hourClass, MANSION_GOOD, sanniang, marriageMonthLuck, MARRIAGE_OMIT_ZH, MARRIAGE_OMIT_EN, chongSangDay, BURIAL_OMIT_ZH, BURIAL_OMIT_EN, EL_NAMES, EL_EN, wuxingProfile, DIR_EN, dayDirections, DAYDIR_OMIT_ZH, DAYDIR_OMIT_EN, wuHuangDir, sanShaDir, annualLayer, dayPillarWithConvention, TZ_PRESETS, birthPillars, leapPlacementCheck, razorEdgeYears, runSelfTests, findLunarDate, termClock, solarTermOf, dayView, DOW_ZH, DOW_EN
} from './engine/tongshu.js';

// ====================================================================
function fmtYMD(y, m, d) { return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function parseYMD(s) { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s || ''); return m ? { y: +m[1], mo: +m[2], d: +m[3] } : null; }

// ---- activity picker tabs: SINGLE auditable source for the 日常 / 凶事 split ----
// Categories map wholesale to a tab; `items` additionally pulls specific activity ids into 凶事
// even though their category (居家) is otherwise Everyday — the clearly-inauspicious Demolish (拆卸)
// and Break-earth-for-grave (破土). Move house etc. stay in 日常. Audit the split here, nowhere else.
const CATEGORY_TABS = {
  everyday: { zh: '日常', en: 'Everyday', cats: ['医疗', '婚嫁', '居家', '商业', '出行', '祭祀', '农牧', '杂事'] },
  xiong: { zh: '凶事', en: 'Inauspicious', cats: ['丧葬'], items: ['chaixie', 'potu'] },
};
const ACT_TAB_ORDER = ['everyday', 'xiong'];
const activityTab = (a) => {
  for (const k of ACT_TAB_ORDER) { const t = CATEGORY_TABS[k]; if (t.items && t.items.includes(a.id)) return k; }
  for (const k of ACT_TAB_ORDER) { const t = CATEGORY_TABS[k]; if (t.cats.includes(a.cat)) return k; }
  return 'everyday';
};

// WS-3 — wraps a paid action; shows an inline upgrade card when not entitled. Free features never use it.
function Gate({ paid, lang, onUpgrade, children }) {
  if (paid) return <>{children}</>;
  const L = (zh, en) => (lang === 'en' ? en : lang === 'both' ? `${zh} / ${en}` : zh);
  return (
    <div className="a-gate">
      <div className="a-gate-h"><Icon name="export" size={18} /> {L('升级解锁丰富导出', 'Upgrade to unlock rich export')}</div>
      <p className="a-gate-d">{L('把这天（或收藏）导出到 WhatsApp／邮件／卡片，并附诚实的逐项「为什么」解读——只陈述引擎实际算出的因素。', 'Export this day (or your saved set) to WhatsApp / email / a card, with an honest factor-by-factor "why" explanation — only what the engine actually computed.')}</p>
      <div className="a-gate-price">US$8/yr · US$88 {L('永久', 'lifetime')}</div>
      <button className="a-btn" style={{ marginTop: '8px' }} onClick={onUpgrade}>{L('升级 / 输入许可证', 'Upgrade / enter licence')}</button>
    </div>
  );
}

// Phase 4 — single source for the primary routes (used by the desktop nav and the mobile tab bar).
const NAV = [
  { id: 'home', icon: 'home', zh: '首页', en: 'Home' },
  { id: 'find', icon: 'calendar', zh: '黄历', en: 'Calendar' },
  { id: 'academy', icon: 'academy', zh: '学堂', en: 'Academy' },
  { id: 'videos', icon: 'video', zh: '视频', en: 'Videos' },
  { id: 'articles', icon: 'article', zh: '文章', en: 'Articles' },
  { id: 'tools', icon: 'tools', zh: '工具', en: 'Tools' },
  { id: 'learn', icon: 'info', zh: '关于', en: 'About' },
];
const MOBILE_TABS = ['home', 'find', 'academy', 'tools']; // 5th slot is the "More" overflow
// activity category -> Phase-3 icon (decorative top-宜 glyph on calendar cells; no new logic)
const CAT_ICON = { '医疗': 'catHealth', '婚嫁': 'catMarriage', '居家': 'catHome', '商业': 'catBusiness', '出行': 'catTravel', '祭祀': 'catRitual', '农牧': 'catAgriculture', '杂事': 'catMisc', '丧葬': 'catInauspicious' };
const THEME_CYCLE = { light: 'dark', dark: 'contrast', contrast: 'red', red: 'light' };
const THEME_SHORT = { light: '浅', dark: '深', contrast: '高', red: '红' };

export default function TongShuApp({ initialTab = 'home', initialLang = 'zh', initialFindView = 'cal' } = {}) {
  const now = new Date();
  const today = { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate() };
  const todayJDN = gregorianToJDN(today.y, today.mo, today.d);
  const defEnd = (() => { const g = jdnToGregorian(todayJDN + 29); return g; })();
  const monthNamesZh = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

  // ---- state ----
  const [tab, setTab] = useState(initialTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false); // mobile "More" overflow sheet (WS-5)
  const [acaChapter, setAcaChapter] = useState(null); // Academy reader: chapter id or null (index) (WS-2)
  const [progress, setProgress] = useState(() => loadProgress()); // Phase 5 LMS: completed chapter ids
  const [vidPlaying, setVidPlaying] = useState(null); // WS-4 lazy video embed (id currently playing)
  const [artId, setArtId] = useState(null); // WS-4 article reader: id or null (index)
  const [tourStep, setTourStep] = useState(-1);
  const [tourRect, setTourRect] = useState(null);
  const [gq, setGq] = useState(''); const [gFocus, setGFocus] = useState(null);
  useEffect(() => { if (tab === 'learn' && gFocus) { try { const el = document.getElementById('gl-' + gFocus); if (el) el.scrollIntoView({ block: 'center' }); } catch (e) {} } }, [tab, gFocus]);
  const [lang, setLang] = useState(initialLang);
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState('standard');
  const [tzKey, setTzKey] = useState('sg');
  const [lateZi, setLateZi] = useState(false);
  const [selIds, setSelIds] = useState(['banjia']);
  const [startStr, setStartStr] = useState(fmtYMD(today.y, today.mo, today.d));
  const [endStr, setEndStr] = useState(fmtYMD(defEnd.y, defEnd.m, defEnd.d));
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [screenZodiac, setScreenZodiac] = useState(true);
  const [sortMode, setSortMode] = useState('score');
  const [actTab, setActTab] = useState('everyday'); // activity picker tab: 'everyday' | 'xiong'
  const [findView, setFindView] = useState(initialFindView); // 'list' | 'cal' (heat-strip)
  const [homeRange, setHomeRange] = useState(90); // Phase 6 launcher date-range (days)
  const [findCalY, setFindCalY] = useState(today.y);
  const [findCalM, setFindCalM] = useState(today.mo);
  const [mansionOffset, setMansionOffset] = useState(0);
  const [calDateStr, setCalDateStr] = useState('');
  const [calMansionIdx, setCalMansionIdx] = useState(11);
  const [mansionSrc, setMansionSrc] = useState('jixiong');
  const [brideBranch, setBrideBranch] = useState(-1);
  const [persons, setPersons] = useState([]);
  const [calY, setCalY] = useState(today.y);
  const [calM, setCalM] = useState(today.mo);
  const [selJDN, setSelJDN] = useState(null);
  const [savedJDNs, setSavedJDNs] = useState(() => loadSavedDates()); // WS-4: local-only favourites (JDN array)
  const [licence, setLicence] = useState(() => loadLicence()); // WS-3 entitlement
  const [licKey, setLicKey] = useState(''); const [licBusy, setLicBusy] = useState(false); const [licMsg, setLicMsg] = useState(null);
  const paid = isEntitled(licence, Date.now());
  const [openAcc, setOpenAcc] = useState({ acts: true, shensha: true });
  const [popId, setPopId] = useState(null);
  const [ssCal, setSsCal] = useState({});
  const [enrich, setEnrich] = useState({});
  const [accYear, setAccYear] = useState(today.y);
  const [accDate, setAccDate] = useState(fmtYMD(today.y, today.mo, today.d));
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef(null);
  const hashLoaded = useRef(false);
  const refActivities = useRef(null), refRange = useRef(null), refList = useRef(null), refTabs = useRef(null), refGlance = useRef(null), refAccGroup = useRef(null);

  const L = (zh, en) => (lang === 'en' ? en : lang === 'both' ? `${zh} / ${en}` : zh);
  // Phase 6 — consistent gradient page header (launcher-style) used across every screen
  const PageHero = ({ zh, en, sub, eyebrow, icon, accent = 'cinnabar' }) => (
    <section className={'a-phero ' + accent}>
      <div className="a-phero-main">
        {eyebrow && <div className="a-eyebrow">{eyebrow}</div>}
        <h1 className="a-phero-h1">{L(zh, en)}</h1>
        {sub && <p className="a-phero-sub">{sub}</p>}
      </div>
      {icon && <span className="a-phero-ico"><Icon name={icon} size={26} /></span>}
    </section>
  );
  const colorClass = c => ({ green: 'v-good', red: 'v-bad', amber: 'v-amber', grey: 'v-grey' }[c] || 'v-grey');
  const vIcon = c => ({ green: '✓', red: '✗', amber: '～', grey: '·' }[c] || '·');
  const topYiCat = (dv) => { const g = (dv.perActivity || []).find(p => p.v.color === 'green'); return g ? CAT_ICON[g.act.cat] : null; }; // decorative top-宜 glyph
  // WS-4 saved/favourite dates — local only, persisted on change
  const isSaved = (jdn) => savedJDNs.includes(jdn);
  const toggleSaved = (jdn) => setSavedJDNs(s => s.includes(jdn) ? s.filter(x => x !== jdn) : [...s, jdn].sort((a, b) => a - b));
  const clearSaved = () => setSavedJDNs([]);
  useEffect(() => { saveSavedDates(savedJDNs); }, [savedJDNs]);
  // Phase 5 LMS — lesson progress
  useEffect(() => { saveProgress(progress); }, [progress]);
  const isDone = (id) => progress.includes(id);
  const markDone = (id) => setProgress(p => p.includes(id) ? p : [...p, id]);
  const toggleDone = (id) => setProgress(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const acaDoneCount = () => (DOCS.academy || []).filter(c => progress.includes(c.id)).length;
  const nextChapterId = () => { const a = DOCS.academy || []; return ((a.find(c => !progress.includes(c.id)) || a[0]) || {}).id; };
  // Phase 6 launcher — optionally preset the activity, set the date range, jump to the calendar
  const goFind = (actId) => {
    if (actId) setSelIds([actId]);
    const ed = new Date(today.y, today.mo - 1, today.d + homeRange);
    setStartStr(fmtYMD(today.y, today.mo, today.d));
    setEndStr(fmtYMD(ed.getFullYear(), ed.getMonth() + 1, ed.getDate()));
    setFindView('cal'); setTab('find');
  };
  // WS-3 licence helpers
  const applyLicence = (st) => { saveLicence(st); setLicence(st); };
  const removeLicence = () => { clearLicence(); setLicence(null); setLicMsg(null); };
  const doValidate = async () => {
    setLicBusy(true); setLicMsg(null);
    try {
      const st = await validateLicence(licKey);
      if (st) { applyLicence(st); setLicKey(''); setLicMsg({ ok: true, text: L('已解锁 ✓', 'Unlocked ✓') }); }
      else setLicMsg({ ok: false, text: L('密钥无效或非本产品', 'Invalid or foreign-product key') });
    } catch (e) {
      setLicMsg({ ok: false, text: e.message === 'verifier-not-configured' ? L('验证服务尚未配置（见 worker/README）', 'Verifier not configured yet (see worker/README)') : L('网络错误，请稍后再试', 'Network error, try again') });
    } finally { setLicBusy(false); }
  };
  // best-effort re-validation on load — offline-safe (cached entitlement stays valid within grace)
  useEffect(() => {
    if (!licence || !needsRevalidation(licence, Date.now())) return;
    let cancelled = false;
    validateLicence(licence.key).then(st => { if (!cancelled && st) applyLicence(st); }).catch(() => {});
    return () => { cancelled = true; };
  }, [licence && licence.key]);

  // ---- derived ----
  const dayCache = useRef({});
  const getDay = (jdn) => { const k = jdn + ':' + mansionOffset; if (!dayCache.current[k]) dayCache.current[k] = computeDay(jdn); return dayCache.current[k]; };
  const selActs = useMemo(() => ACTIVITIES.filter(a => selIds.includes(a.id)), [selIds]);
  const parsedStart = parseYMD(startStr), parsedEnd = parseYMD(endStr);
  const rStart = parsedStart ? gregorianToJDN(parsedStart.y, parsedStart.mo, parsedStart.d) : todayJDN;
  let rEnd = parsedEnd ? gregorianToJDN(parsedEnd.y, parsedEnd.mo, parsedEnd.d) : todayJDN + 29;
  if (rEnd < rStart) rEnd = rStart;
  const tooLong = rEnd - rStart > 365;
  if (tooLong) rEnd = rStart + 365;

  const birth = useMemo(() => {
    const b = parseYMD(birthDate); if (!b) return null;
    return birthPillars(b.y, b.mo, b.d, birthTime || '12:00', tzKey);
  }, [birthDate, birthTime, tzKey]);
  const birthYearBranch = birth ? birth.yearBranch : null;
  const wuxProfile = useMemo(() => (birth ? wuxingProfile(birth) : null), [birth]);
  const extraBranches = persons.map(p => p.branch);
  const birthLate = useMemo(() => {
    if (!birth || !lateZi) return null;
    const b = parseYMD(birthDate); if (!b) return null;
    const tm = /^(\d{1,2}):(\d{2})$/.exec(birthTime || ''); if (!tm) return null;
    return dayPillarWithConvention(gregorianToJDN(b.y, b.mo, b.d), (+tm[1]) * 60 + (+tm[2]), true);
  }, [birth, lateZi, birthDate, birthTime]);

  const calMansion = (day) => {
    if (!mansionOffset) return { idx: day.mansionIndex, name: day.mansion, animal: day.mansionAnimal, good: day.mansionGood, seven: day.mansionSeven };
    const idx = ((day.mansionIndex + mansionOffset) % 28 + 28) % 28;
    return { idx, name: MANSIONS[idx], animal: MANSION_ANIMAL[idx], good: MANSION_GOOD[idx], seven: SEVEN[idx % 7] };
  };

  const annualCal = useMemo(() => { const yp = yearPillarForCivilJDN(gregorianToJDN(calY, 6, 1)); return { yp, ...annualLayer(yp.stem, yp.branch, calY) }; }, [calY]);

  const listData = useMemo(() => {
    const arr = [];
    for (let j = rStart; j <= rEnd; j++) { const day = getDay(j); arr.push({ jdn: j, day, dv: dayView(day, selActs, birthYearBranch, screenZodiac, profile, extraBranches, wuxProfile) }); }
    arr.sort((a, b) => {
      const fa = a.dv.forcedAvoid ? 1 : 0, fb = b.dv.forcedAvoid ? 1 : 0; if (fa !== fb) return fa - fb;
      if (sortMode === 'wuxing' && wuxProfile && (b.dv.wuxSupport || 0) !== (a.dv.wuxSupport || 0)) return (b.dv.wuxSupport || 0) - (a.dv.wuxSupport || 0);
      if (b.dv.score !== a.dv.score) return b.dv.score - a.dv.score; return a.jdn - b.jdn;
    });
    return arr;
  }, [rStart, rEnd, selIds, birthYearBranch, screenZodiac, profile, persons, wuxProfile, sortMode, mansionOffset]);

  // heat-strip: anchor the visible month to the start of the chosen range (re-sync when From changes)
  useEffect(() => { const g = jdnToGregorian(rStart); setFindCalY(g.y); setFindCalM(g.m); }, [rStart]);
  // one month of per-day verdicts using the SAME dayView the ranked list uses; memoized per (month, activity-set, screening)
  const findCalData = useMemo(() => {
    const first = gregorianToJDN(findCalY, findCalM, 1);
    const pad = weekday(first);
    const daysIn = gregorianToJDN(findCalM === 12 ? findCalY + 1 : findCalY, findCalM === 12 ? 1 : findCalM + 1, 1) - first;
    const cells = [];
    for (let i = 0; i < pad; i++) cells.push(null);
    for (let dnum = 0; dnum < daysIn; dnum++) {
      const jdn = first + dnum; const day = getDay(jdn);
      const dv = dayView(day, selActs, birthYearBranch, screenZodiac, profile, extraBranches, wuxProfile);
      cells.push({ jdn, day, dv, dnum: dnum + 1, inRange: jdn >= rStart && jdn <= rEnd });
    }
    return cells;
  }, [findCalY, findCalM, selIds, screenZodiac, profile, persons, birthYearBranch, wuxProfile, rStart, rEnd, mansionOffset]);

  const tests = useMemo(() => runSelfTests(), []);
  const testPass = tests.filter(t => t.ok).length;
  const accTerms = useMemo(() => Array.from({ length: 24 }, (_, i) => { const cj = termCivilJDN(accYear, i); const g = jdnToGregorian(cj); return { ...TERMS24[i], date: `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`, clock: termClock(accYear, i) }; }), [accYear]);
  const accFestivals = useMemo(() => { const fmt = j => { if (!j) return '—'; const g = jdnToGregorian(j); return `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`; }; const out = []; for (let y = 2020; y <= 2030; y++) out.push({ y, cny: fmt(findLunarDate(y, 1, 1)), duanwu: fmt(findLunarDate(y, 5, 5)), midautumn: fmt(findLunarDate(y, 8, 15)) }); return out; }, []);
  const accLeap = useMemo(() => leapPlacementCheck(1900, 2100), []);
  const accRazor = useMemo(() => razorEdgeYears(1900, 2100, 6), []);
  const accDayLookup = useMemo(() => { const p = parseYMD(accDate); if (!p) return null; return getDay(gregorianToJDN(p.y, p.mo, p.d)); }, [accDate, mansionOffset]);

  const D = selJDN != null ? getDay(selJDN) : null;
  const DV = D ? dayView(D, selActs, birthYearBranch, screenZodiac, profile, extraBranches, wuxProfile) : null;
  const term = selJDN != null ? solarTermOf(selJDN) : null;
  const lunarLabel = (day) => (day.lunar.isLeap ? '闰' : '') + monthNamesZh[day.lunar.monthNum] + '月' + LUNAR_DAY_NAMES[day.lunar.day];

  // ---- helpers (UI) ----
  const toggleAcc = (k) => setOpenAcc(s => ({ ...s, [k]: !s[k] }));
  const acc = (key, titleZh, titleEn, summary, body, tag) => (
    <div className={'a-acc' + (openAcc[key] ? ' open' : '')}>
      <button className="a-acc-h" aria-expanded={!!openAcc[key]} onClick={() => toggleAcc(key)}>
        <span className="lab">{L(titleZh, titleEn)}{tag}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{!openAcc[key] && summary ? <span className="cv">{summary}</span> : null}<span className="ch">›</span></span>
      </button>
      {openAcc[key] && <div className="a-acc-body">{body}</div>}
    </div>
  );
  const pop = (id, titleZh, titleEn, bodyZh, bodyEn, gid) => (
    <span className="a-popwrap">
      <button className="a-popbtn" aria-label="info" onClick={(e) => { e.stopPropagation(); setPopId(p => p === id ? null : id); }}>ⓘ</button>
      {popId === id && <span className="a-pop" onClick={e => e.stopPropagation()}><span className="pt">{L(titleZh, titleEn)}</span>{L(bodyZh, bodyEn)}{gid ? <button className="a-poplink" onClick={(e) => { e.stopPropagation(); setPopId(null); setSelJDN(null); setTab('learn'); setGFocus(gid); }}>{L('词汇表 ↗', 'Glossary ↗')}</button> : null}</span>}
    </span>
  );

  // ---- exports ----
  const downloadText = (name, text, mime) => { try { const b = new Blob([text], { type: mime || 'text/plain;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 120); } catch (e) {} };
  const csvEsc = s => '"' + String(s).replace(/"/g, '""') + '"';
  const exportCSV = () => { const head = ['date', 'weekday', 'lunar', 'ganzhi', 'officer', 'god', 'mansion', 'clash', 'verdict', 'score']; const rows = listData.slice(0, 200).map(({ day, dv }) => [fmtYMD(day.greg.y, day.greg.m, day.greg.d), DOW_EN[day.weekday], lunarLabel(day), day.dayGanzhi, day.officer, day.god, day.mansion, day.clash.clashZodiac, dv.verdict, dv.score].map(csvEsc).join(',')); downloadText('tongshu-dates.csv', [head.map(csvEsc).join(',')].concat(rows).join('\r\n'), 'text/csv;charset=utf-8'); };
  const icsDate = g => `${g.y}${String(g.m).padStart(2, '0')}${String(g.d).padStart(2, '0')}`;
  const exportICS = () => { const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TongShu//EN', 'CALSCALE:GREGORIAN']; const items = selJDN != null ? [{ jdn: selJDN, day: D, dv: DV }] : listData.slice(0, 20); items.forEach(({ jdn, day, dv }) => { const g = day.greg, g2 = jdnToGregorian(jdn + 1); lines.push('BEGIN:VEVENT', `UID:${jdn}@tongshu`, `DTSTART;VALUE=DATE:${icsDate(g)}`, `DTEND;VALUE=DATE:${icsDate(g2)}`, `SUMMARY:${dv ? dv.verdict : ''} ${selActs.map(a => a.zh).join(' ')} (${day.dayGanzhi}${day.officer}日)`.trim(), `DESCRIPTION:${day.officer}日 ${day.god} ${day.mansion}宿 冲${day.clash.clashZodiac} 煞${day.clash.dir}方`, 'END:VEVENT'); }); lines.push('END:VCALENDAR'); downloadText('tongshu-dates.ics', lines.join('\r\n'), 'text/calendar;charset=utf-8'); };
  const copyLink = () => { try { if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined') { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } } catch (e) {} };

  // ---- URL hash ----
  useEffect(() => {
    try { let h = ((typeof window !== 'undefined' && window.location.hash) || '').replace(/^#/, ''); if (!h) h = loadSaved(); if (h) { const p = new URLSearchParams(h); if (p.get('s')) setStartStr(p.get('s')); if (p.get('e')) setEndStr(p.get('e')); if (p.get('b')) setBirthDate(p.get('b')); if (p.get('t')) setBirthTime(p.get('t')); if (p.get('tz')) setTzKey(p.get('tz')); if (p.get('a')) setSelIds(p.get('a').split(',').filter(Boolean)); if (p.get('p')) setProfile(p.get('p')); if (p.get('l')) setLang(p.get('l')); if (p.get('th')) setTheme(p.get('th')); if (p.get('lz')) setLateZi(p.get('lz') === '1'); if (p.get('mo')) setMansionOffset(+p.get('mo') || 0); if (p.get('br')) setBrideBranch(+p.get('br')); if (p.get('fv')) setFindView(p.get('fv')); if (p.get('v')) setTab(p.get('v')); if (p.get('g')) { setTab('learn'); setGFocus(p.get('g')); } } } catch (e) {}
    hashLoaded.current = true;
  }, []);
  useEffect(() => {
    if (!hashLoaded.current) return;
    try { const p = new URLSearchParams(); p.set('s', startStr); p.set('e', endStr); if (birthDate) p.set('b', birthDate); if (birthTime) p.set('t', birthTime); p.set('tz', tzKey); if (selIds.length) p.set('a', selIds.join(',')); p.set('p', profile); p.set('l', lang); p.set('th', theme); if (lateZi) p.set('lz', '1'); if (mansionOffset) p.set('mo', String(mansionOffset)); if (brideBranch >= 0) p.set('br', String(brideBranch)); p.set('fv', findView); if (typeof window !== 'undefined') window.history.replaceState(null, '', '#' + p.toString()); saveLocal(p.toString()); } catch (e) {}
  }, [startStr, endStr, birthDate, birthTime, tzKey, selIds, profile, lang, theme, lateZi, mansionOffset, brideBranch, findView]);

  // ---- keyboard + focus ----
  useEffect(() => {
    const onKey = (e) => { if (selJDN == null) return; if (e.key === 'Escape') setSelJDN(null); else if (e.key === 'ArrowRight') { setSelJDN(j => j + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { setSelJDN(j => j - 1); e.preventDefault(); } else if (e.key === 'ArrowDown') { setSelJDN(j => j + 7); e.preventDefault(); } else if (e.key === 'ArrowUp') { setSelJDN(j => j - 7); e.preventDefault(); } };
    if (typeof window !== 'undefined') window.addEventListener('keydown', onKey);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey); };
  }, [selJDN]);
  useEffect(() => { if (selJDN != null && sheetRef.current) { try { sheetRef.current.focus(); } catch (e) {} } }, [selJDN]);

  // ---- onboarding tour ----
  const exampleJDN = () => (listData[0] ? listData[0].jdn : gregorianToJDN(2026, 6, 20));
  const TOUR = [
    { ref: refActivities, sheet: false, t: ['选择事项', 'Pick activities'], d: ['选一个或多个你要办的事，例如「搬家」。', 'Choose one or more things to do — e.g. 搬家 (move house).'] },
    { ref: refRange, sheet: false, t: ['设定日期范围', 'Set a date range'], d: ['用快捷按钮，或自定义起迄日期。', 'Use a preset, or pick custom start/end dates.'] },
    { ref: refList, sheet: false, t: ['看排序结果', 'Read the ranked list'], d: ['✓宜 / ✗忌 / ～参考；下面一行是主要原因。', '✓favorable / ✗avoid / ～mixed; the line shows the top reason.'] },
    { ref: refList, sheet: false, openExample: true, t: ['点开某一天', 'Open a day'], d: ['点任意卡片查看详情。点「下一步」打开示例日。', 'Tap any card for detail. Next opens an example day.'] },
    { ref: refGlance, sheet: true, t: ['先看裁断', 'Verdict first'], d: ['顶部是结论与最强的几个因素。', 'The top shows the answer and its strongest factors.'] },
    { ref: refAccGroup, sheet: true, t: ['再看依据', 'Evidence on demand'], d: ['展开神煞、历法层、时辰等细节。', 'Expand 神煞, calendar layers, hours and more.'] },
    { ref: refTabs, sheet: false, t: ['工具与设置', 'Tools & Settings'], d: ['八字、校准、精度核对、语言与主题都在这里。', 'Birth chart, calibration, accuracy, language & theme live here.'] },
  ];
  const goTour = (i) => {
    if (i < 0 || i >= TOUR.length) { setTourStep(-1); setTourRect(null); return; }
    const step = TOUR[i];
    setTab('find'); setSettingsOpen(false);
    if (step.sheet) { setSelJDN(j => (j == null ? exampleJDN() : j)); }
    else if (step.openExample) { /* stay; sheet opens on next */ }
    else { setSelJDN(null); }
    setTourStep(i);
  };
  // Home is now the landing surface (WS-1); the tour is launched on demand from the ? button, not auto.
  // measure the spotlight target
  useEffect(() => {
    if (tourStep < 0) return;
    let raf = 0, t1 = 0;
    const measure = () => {
      const el = TOUR[tourStep] && TOUR[tourStep].ref && TOUR[tourStep].ref.current;
      if (!el) { setTourRect(null); return; }
      try { const r = el.getBoundingClientRect(); setTourRect({ top: r.top, left: r.left, width: r.width, height: r.height }); } catch (e) { setTourRect(null); }
    };
    raf = requestAnimationFrame(() => { measure(); });
    t1 = setTimeout(measure, 320); // after sheet/tab transitions
    const onWin = () => measure();
    if (typeof window !== 'undefined') { window.addEventListener('resize', onWin); window.addEventListener('scroll', onWin, true); }
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); if (typeof window !== 'undefined') { window.removeEventListener('resize', onWin); window.removeEventListener('scroll', onWin, true); } };
  }, [tourStep, tab, selJDN]);
  // keyboard for tour
  useEffect(() => {
    if (tourStep < 0) return;
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); goTour(-1); } else if (e.key === 'Enter') { goTour(tourStep + 1); } };
    if (typeof window !== 'undefined') window.addEventListener('keydown', onKey);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey); };
  }, [tourStep]);

  const isMarriage = selActs.some(a => ['jiaqu', 'dinghun', 'nacai', 'naxu', 'guanji', 'guining'].includes(a.id));
  const isBurial = selActs.some(a => ['anzang', 'rulian', 'yijiu', 'xiufen', 'libei', 'qizuan'].includes(a.id));

  // category groups for the activity picker
  const catGroups = useMemo(() => { const m = {}; ACTIVITIES.forEach(a => { (m[a.cat] = m[a.cat] || []).push(a); }); return m; }, []);
  const catLabel = (c) => { try { return L((CATEGORIES && CATEGORIES[c]) || c, (CATEGORIES_EN && CATEGORIES_EN[c]) || c); } catch (e) { return c; } };
  // count current selections per tab so the inactive tab can show a "(+N)" hint
  const selCountByTab = useMemo(() => { const c = { everyday: 0, xiong: 0 }; selIds.forEach(id => { const a = ACTIVITIES.find(x => x.id === id); if (a) c[activityTab(a)]++; }); return c; }, [selIds]);

  const preset = (sj, ej) => { const s = jdnToGregorian(sj), e = jdnToGregorian(ej); setStartStr(fmtYMD(s.y, s.m, s.d)); setEndStr(fmtYMD(e.y, e.m, e.d)); };

  // a ranked-date card with a star toggle — shared by the Find list and the Saved view (WS-4)
  const dateCard = (jdn, day = getDay(jdn), dv = dayView(day, selActs, birthYearBranch, screenZodiac, profile, extraBranches, wuxProfile)) => {
    const reason = (() => { const fa = dv.perActivity[0]; if (!fa) return day.officer + L('日', ''); const f = fa.v.factors.find(x => x.strong) || fa.v.factors[0]; return f ? (lang === 'en' ? f.en : f.zh) : day.officer + L('日', ''); })();
    const sv = isSaved(jdn);
    return (
      <button key={jdn} className={'a-dcard ' + colorClass(dv.color)} onClick={() => setSelJDN(jdn)}>
        <div><div className="dn">{day.greg.m}/{day.greg.d}</div><div className="dw">{L(DOW_ZH[day.weekday], DOW_EN[day.weekday])}</div></div>
        <div className="dm">
          <div className="dl">{lunarLabel(day)} · {day.dayGanzhi}{L('日', '')} · {day.officer}{L('日', '')}</div>
          <div className="dr">{reason}</div>
          <div className="dz">{L('冲', 'clash')}{day.clash.clashZodiac} · {calMansion(day).name}{L('宿', '')}{day.shensha.goodCount ? ` · ${L('吉神', '吉')}${day.shensha.goodCount}` : ''}{day.shensha.badCount ? ` · ${L('凶煞', '凶')}${day.shensha.badCount}` : ''}{(dv.benmingChong || dv.clashedPersons.length) ? <span className="a-flag">⚠{L('冲生肖', 'clash')}</span> : null}</div>
        </div>
        <div className={'a-vbadge ' + colorClass(dv.color)}>{vIcon(dv.color)} {lang === 'en' ? dv.verdictEn : dv.verdict}</div>
        <span className={'a-star' + (sv ? ' on' : '')} role="button" tabIndex={0} aria-pressed={sv} aria-label={L(sv ? '取消收藏' : '收藏', sv ? 'Unsave' : 'Save')} onClick={(e) => { e.stopPropagation(); toggleSaved(jdn); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleSaved(jdn); } }}>{sv ? '★' : '☆'}</span>
      </button>
    );
  };
  // corner star toggle for calendar cells (stops propagation so the cell still opens the sheet)
  const cellStar = (jdn) => { const sv = isSaved(jdn); return <span className={'a-cell-star' + (sv ? ' on' : '')} role="button" tabIndex={0} aria-pressed={sv} aria-label={L(sv ? '取消收藏' : '收藏', sv ? 'Unsave' : 'Save')} onClick={(e) => { e.stopPropagation(); toggleSaved(jdn); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleSaved(jdn); } }}>{sv ? '★' : '☆'}</span>; };

  // WS-3 paid rich-export panel for the open day (honest, factor-derived explanation + share/export)
  const exportPanel = () => {
    const exp = buildExplanation(D, DV, selActs, profile);
    const text = explanationToText(exp, lang === 'en' ? 'en' : 'zh');
    const wa = 'https://wa.me/?text=' + encodeURIComponent(text);
    const mail = 'mailto:?subject=' + encodeURIComponent(lang === 'en' ? exp.title[1] : exp.title[0]) + '&body=' + encodeURIComponent(text);
    const fn = `tongshu-${D.greg.y}${String(D.greg.m).padStart(2, '0')}${String(D.greg.d).padStart(2, '0')}.txt`;
    return (<>
      <div className="a-note" style={{ marginBottom: '8px' }}>{L('诚实导出：仅陈述引擎实际算出的因素，标注精确／分级与置信度，并重申非定论。', 'Honest export: only the factors the engine actually computed — each tagged exact / graded with confidence, non-definitive restated.')}</div>
      <div className="a-explain">{exp.lines.map((l, i) => <div key={i} className="ex-row"><span className={'ex-tag ' + l.tag}>{L(l.tag === 'exact' ? '精确' : '分级', l.tag === 'exact' ? 'exact' : 'graded')}</span><span className="ex-txt">{L(l.zh, l.en)}{l.grade ? ` · ${l.grade}` : ''}</span></div>)}</div>
      <div className="a-chips" style={{ marginTop: '10px' }}>
        <a className="a-chip" href={wa} target="_blank" rel="noopener"><Icon name="whatsapp" size={15} /> WhatsApp</a>
        <a className="a-chip" href={mail}><Icon name="email" size={15} /> {L('邮件', 'Email')}</a>
        <button className="a-chip" onClick={() => downloadText(fn, text)}><Icon name="export" size={15} /> {L('卡片 .txt', 'Card .txt')}</button>
        <button className="a-chip" onClick={() => { try { if (typeof window !== 'undefined') window.print(); } catch (e) {} }}>{L('打印·PDF', 'Print·PDF')}</button>
      </div>
    </>);
  };

  // =========================== RENDER ===========================
  return (
    <div className="a-root" data-theme={theme} data-sheet={selJDN != null ? '1' : '0'}>
      <style>{CSS}</style>

      {/* print-only sheet */}
      {D && (
        <div className="a-print" aria-hidden="true">
          <h2>通書擇日 · {L('通书页', 'Almanac day sheet')}</h2>
          <div className="pd">{D.greg.y}-{String(D.greg.m).padStart(2, '0')}-{String(D.greg.d).padStart(2, '0')} · {L('星期' + DOW_ZH[D.weekday], DOW_EN[D.weekday])} · {lunarLabel(D)}</div>
          <table><tbody>
            <tr><th>干支</th><td>{D.yearGanzhi}年　{D.monthGanzhi}月　{D.dayGanzhi}日（{D.nayin}）</td></tr>
            <tr><th>值日神</th><td>{D.officer}日 · {D.god}（{D.isYellow ? '黄道' : '黑道'}）· {calMansion(D).name}宿 {calMansion(D).animal}</td></tr>
            <tr><th>冲煞</th><td>冲{D.clash.clashZodiac}（{STEMS[D.clash.clashStem] + BRANCHES[D.clash.clashBranch]}）煞{D.clash.dir}方{D.clashAges.ages.length ? '　冲虚岁 ' + D.clashAges.ages.join('、') : ''}</td></tr>
            <tr><th>神煞</th><td>{D.shensha.list.length ? D.shensha.list.map(s => s.zh + '(' + (s.type === 'good' ? '吉' : '凶') + s.grade + ')').join('、') : '—'}</td></tr>
            <tr><th>方位</th><td>喜神 {dayDirections(D.dayStem).xishen}　吉时 {D.hours.filter(h => h.isYellow).map(h => h.branchZh + '时').join('、') || '—'}</td></tr>
            <tr><th>彭祖</th><td>{D.pengzuStem}；{D.pengzuBranch}</td></tr>
          </tbody></table>
          {selActs.length > 0 && <table><tbody>{selActs.map(a => { const v = verdictForActivity(a, D, profile); return <tr key={a.id}><th>{a.zh}</th><td>{v.verdict}（{v.score > 0 ? '+' : ''}{v.score}）— {v.factors.map(f => f.sign + f.zh).join('；')}</td></tr>; })}</tbody></table>}
          <p className="pf">推算估计，非定论；专有宜忌请以纸本通书或择日师为准。Computed estimate — not definitive.</p>
        </div>
      )}

      {/* desktop left sidebar (shown ≥1024; mobile/tablet keep the top bar + bottom tabs) */}
      <aside className="a-rail" aria-label={L('主导航', 'Primary')}>
        <button className="a-rail-brand" onClick={() => setTab('home')} aria-label={L('首页', 'Home')}>
          <span className="seal">通</span>
          <span className="brandtext"><span className="ttl">通書擇日</span><span className="sub">Tong Shu</span></span>
        </button>
        <nav className="a-rail-nav">
          {NAV.map(n => { const on = tab === n.id || (n.id === 'find' && tab === 'calendar'); return <button key={n.id} className={'a-rail-link' + (on ? ' on' : '')} aria-current={on ? 'page' : undefined} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{L(n.zh, n.en)}</span></button>; })}
        </nav>
        <div className="a-rail-foot">
          <button className="a-rail-link" onClick={() => setTab('saved')}><span className="a-rail-ico">{savedJDNs.length ? '★' : '☆'}</span><span>{L('收藏', 'Saved')}</span>{savedJDNs.length > 0 && <span className="a-badge rail">{savedJDNs.length}</span>}</button>
          <div className="a-rail-ctlrow">
            <button className="a-iconbtn" aria-label={L('语言', 'Language')} onClick={() => setLang(l => l === 'zh' ? 'en' : l === 'en' ? 'both' : 'zh')}>{lang === 'zh' ? '中' : lang === 'en' ? 'EN' : '中EN'}</button>
            <button className="a-iconbtn" aria-label={L('主题', 'Theme')} onClick={() => setTheme(t => THEME_CYCLE[t] || 'light')}>{THEME_SHORT[theme] || '浅'}</button>
            <button className="a-iconbtn" aria-label={L('使用教程', 'tutorial')} onClick={() => goTour(0)}>?</button>
            <button className="a-iconbtn" aria-label={L('设置', 'settings')} onClick={() => setSettingsOpen(true)}>⚙</button>
          </div>
          <button className="a-dupg rail" onClick={() => setSettingsOpen(true)}>{paid ? L('已升级', 'Pro') : L('升级 · 解锁导出', 'Upgrade')}</button>
        </div>
      </aside>

      <div className="a-app" onClick={() => popId && setPopId(null)}>
        {/* top bar */}
        <header className="a-bar">
          <button className="a-brand" onClick={() => setTab('home')} aria-label={L('首页', 'Home')}><span className="seal">通</span><span className="brandtext"><span className="ttl">通書擇日</span><span className="sub">Tong Shu</span></span></button>
          <div className="sp" />
          <button className="a-iconbtn" aria-label={L('收藏', 'Saved')} onClick={() => setTab('saved')} style={{ position: 'relative' }}>{savedJDNs.length ? '★' : '☆'}{savedJDNs.length > 0 && <span className="a-badge">{savedJDNs.length}</span>}</button>
          <button className="a-iconbtn a-hide-desktop" aria-label={L('使用教程', 'tutorial')} onClick={() => goTour(0)}>?</button>
          <button className="a-iconbtn a-hide-desktop" aria-label={L('设置', 'settings')} onClick={() => setSettingsOpen(true)}>⚙</button>
        </header>

        {/* ===================== HOME ===================== */}
        {tab === 'home' && (
          <main className="a-screen a-home">
            {/* launcher hero — pick an activity + range, jump to the ranked calendar (Firefly-style prompt bar) */}
            <section className="a-launch">
              <div className="a-launch-main">
                <div className="a-eyebrow">{L('传统 · 历法 · 择吉', 'Tradition · Almanac · Date-selection')}</div>
                <h1 className="a-launch-h1">{L('想挑个什么好日子？', 'What are you choosing a date for?')}</h1>
                <p className="a-launch-sub">{L('选事项与日期范围，得到按吉凶排序、并说明原因的日子。', 'Pick an activity and a range — get the days ranked by favourability, each with the reason why.')}</p>
                <div className="a-launch-bar">
                  <label className="a-launch-field act">
                    <span>{L('我要办', 'Activity')}</span>
                    <select value={selIds[0] || 'jiaqu'} onChange={e => setSelIds([e.target.value])}>
                      {ACTIVITIES.map(a => <option key={a.id} value={a.id}>{L(a.zh, a.en)}</option>)}
                    </select>
                  </label>
                  <label className="a-launch-field">
                    <span>{L('范围', 'Range')}</span>
                    <select value={homeRange} onChange={e => setHomeRange(+e.target.value)}>
                      <option value={30}>{L('未来 30 天', 'Next 30 days')}</option>
                      <option value={60}>{L('未来 60 天', 'Next 60 days')}</option>
                      <option value={90}>{L('未来 90 天', 'Next 90 days')}</option>
                      <option value={180}>{L('未来半年', 'Next 6 months')}</option>
                    </select>
                  </label>
                  <button className="a-launch-go" onClick={() => goFind()}><Icon name="find" size={18} /> {L('选吉日', 'Find dates')}</button>
                </div>
              </div>
              <div className="a-launch-art"><Art name="hero" alt={L('通书择日', 'Tong Shu almanac')} lang={lang === 'en' ? 'en' : 'zh'} theme={theme} size={300} /></div>
            </section>

            {/* quick start — the four things you do most */}
            <div className="a-qs-grid">
              <button className="a-qs-card" onClick={() => goFind()}><span className="a-qs-ico jade"><Icon name="find" size={22} /></span><b>{L('择吉日', 'Find a date')}</b><span>{L('按宜忌排序', 'Ranked by 宜/忌')}</span></button>
              <button className="a-qs-card" onClick={() => setSelJDN(todayJDN)}><span className="a-qs-ico gold"><Icon name="calendar" size={22} /></span><b>{L('今日通书', 'Today')}</b><span>{L('看今天这一日', 'Open today’s sheet')}</span></button>
              <button className="a-qs-card" onClick={() => setTab('academy')}><span className="a-qs-ico cinnabar"><Icon name="academy" size={22} /></span><b>{L('学堂', 'Academy')}</b><span>{L('故事与课程', 'Stories & lessons')}</span></button>
              <button className="a-qs-card" onClick={() => setTab('saved')}><span className="a-qs-ico plum"><Icon name="save" size={22} /></span><b>{L('收藏', 'Saved')}</b><span>{savedJDNs.length ? L(savedJDNs.length + ' 个已存', savedJDNs.length + ' saved') : L('收藏的日子', 'Your saved days')}</span></button>
            </div>

            {/* common scenarios — one tap presets the calculator */}
            <div className="a-sec">{L('常见场景', 'Common scenarios')} <span className="en">{L('一键带入择日', 'one-tap presets')}</span></div>
            <div className="a-scn-grid">
              {[['jiaqu', 'cinnabar'], ['banjia', 'jade'], ['kaishi', 'gold'], ['chuxing', 'plum'], ['qifu', 'terra'], ['anzang', 'ink']].map(([id, ac]) => { const a = ACTIVITIES.find(x => x.id === id); if (!a) return null; return (
                <button key={id} className={'a-scn-tile ' + ac} onClick={() => goFind(id)}>
                  <span className="a-scn-ico"><Icon name={CAT_ICON[a.cat] || 'catMisc'} size={20} /></span>
                  <span className="a-scn-tl">{L(a.zh, a.en)}</span>
                </button>
              ); })}
            </div>

            {/* today's almanac teaser — real engine, free */}
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('今日通书', 'Today’s almanac')} <span className="en">{fmtYMD(today.y, today.mo, today.d)}</span></div>
              {dateCard(todayJDN)}
              <div className="a-note" style={{ marginTop: '4px' }}>{L('点开查看完整一天；在「黄历」改事项会更新结论。', 'Tap for the full day; change activities in Calendar to update the verdict.')}</div>
            </div>

            {/* featured lessons from the Academy (real ACADEMY content) */}
            <div className="a-sec">{L('精选课程', 'Featured lessons')} <button className="a-seemore" onClick={() => setTab('academy')}>{L('全部学堂 →', 'All lessons →')}</button></div>
            <div className="a-feature-row">
              {DOCS.academy.slice(0, 4).map(c => (
                <button key={c.id} className="a-feature-card" onClick={() => { setAcaChapter(c.id); setTab('academy'); }}>
                  <Art name={c.figure} alt={L(c.title[0], c.title[1])} lang={lang === 'en' ? 'en' : 'zh'} theme={theme} size={240} />
                  <div className="ft">{L(c.title[0], c.title[1])}</div>
                </button>
              ))}
            </div>

            {/* videos (graceful placeholder until the owner supplies content via MEDIA) */}
            <div className="a-sec">{L('视频', 'Videos')} <button className="a-seemore" onClick={() => setTab('videos')}>{L('全部 →', 'All →')}</button></div>
            {(() => { const vids = (DOCS.media && DOCS.media.videos) || []; return vids.length === 0
              ? <div className="a-empty">{L('课程视频即将上线。', 'Video lessons coming soon.')}</div>
              : <div className="a-feature-row">{vids.slice(0, 4).map(v => <button key={v.id} className="a-feature-card" onClick={() => setTab('videos')}><div className="ft">{L(v.title[0], v.title[1])}</div></button>)}</div>; })()}

            {/* articles (graceful placeholder until the owner supplies content via MEDIA) */}
            <div className="a-sec">{L('文章', 'Articles')} <button className="a-seemore" onClick={() => setTab('articles')}>{L('全部 →', 'All →')}</button></div>
            {(() => { const arts = (DOCS.media && DOCS.media.articles) || []; return arts.length === 0
              ? <div className="a-empty">{L('文章敬请期待。', 'Articles coming soon.')}</div>
              : <div className="a-feature-row">{arts.slice(0, 4).map(a => <button key={a.id} className="a-feature-card" onClick={() => setTab('articles')}><div className="ft">{L(a.title[0], a.title[1])}</div></button>)}</div>; })()}

            <div className="a-card a-tiers">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('免费 / 升级', 'Free / Upgrade')}</div>
              <div className="a-tier">
                <div className="lab"><Icon name="vGood" size={16} /> {L('免费', 'Free')}</div>
                <div className="desc">{L('完整择日、日历、日详情、学习与学堂、收藏、全部主题（含红运）。', 'The full calculator, calendar, day sheets, all learning & Academy, saved dates, every theme (incl. red).')}</div>
              </div>
              <div className="a-tier up">
                <div className="lab"><Icon name="export" size={16} /> {L('升级', 'Upgrade')} <i className="a-graded">US$8/yr · US$88 {L('永久', 'lifetime')}</i></div>
                <div className="desc">{L('把某天或收藏导出到 WhatsApp／邮件／卡片·PDF，并附「为什么是这天／对你生肖」的诚实逐项解读。', 'Export a day or your saved set to WhatsApp / email / a card·PDF, with an honest factor-by-factor "why this day / for your zodiac" explanation.')}</div>
              </div>
              <div className="a-note">{L('升级只解锁导出与解读；计算与学习永远免费。', 'Upgrading unlocks only export & explanation; the calculator and learning stay free forever.')}</div>
              <button className="a-btn" style={{ marginTop: '12px' }} onClick={() => setSettingsOpen(true)}>{paid ? L('已解锁 ✓', 'Unlocked ✓') : L('升级 / 输入许可证', 'Upgrade / enter licence')}</button>
            </div>

            <footer className="a-home-foot">
              <button className="lnk" onClick={() => setTab('learn')}>{L('学习', 'Learn')}</button>
              <button className="lnk" onClick={() => setTab('learn')}>{L('用例', 'Examples')}</button>
              <a className="lnk" href="./guide/" target="_blank" rel="noopener">{L('指南 PDF', 'Guide PDF')}</a>
              <button className="lnk" onClick={() => setSettingsOpen(true)}>{L('设置', 'Settings')}</button>
              <div className="a-disc" style={{ flexBasis: '100%' }}>{L('推算参考，非定论；不收集任何数据。', 'Computed guidance, not definitive. Collects nothing.')}</div>
            </footer>
          </main>
        )}

        {/* ===================== FIND / CALENDAR ===================== */}
        {tab === 'find' && (
          <main className="a-screen a-find">
            <PageHero zh="择吉日" en="Find a date" icon="calendar" accent="cinnabar"
              eyebrow={L('历法 · 宜忌 · 排序', 'Almanac · 宜/忌 · Ranked')}
              sub={L('选事项与范围，得到排序后的宜忌建议。', 'Choose activities and a range for ranked guidance.')} />

            <div className="a-card" ref={refActivities}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('事项', 'Activities')} <span className="en">{selActs.length} selected</span></div>
              <div className="a-seg" style={{ marginBottom: '12px' }}>
                {ACT_TAB_ORDER.map(k => { const hint = (actTab !== k && selCountByTab[k] > 0) ? ` (+${selCountByTab[k]})` : ''; return <button key={k} className={actTab === k ? 'on' : ''} onClick={() => setActTab(k)}>{L(CATEGORY_TABS[k].zh, CATEGORY_TABS[k].en)}{hint}</button>; })}
              </div>
              {CATEGORIES.map(c => { const acts = (catGroups[c] || []).filter(a => activityTab(a) === actTab); if (!acts.length) return null; return (
                <div key={c} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-faint)', margin: '4px 0' }}>{catLabel(c)}</div>
                  <div className="a-chips">
                    {acts.map(a => <button key={a.id} className={'a-chip' + (selIds.includes(a.id) ? ' on' : '')} onClick={() => setSelIds(s => s.includes(a.id) ? s.filter(x => x !== a.id) : [...s, a.id])}>{lang === 'en' ? a.en : a.zh}</button>)}
                  </div>
                </div>
              ); })}
              {actTab === 'xiong' && <div className="a-note" style={{ marginTop: '2px' }}>{L('凶事类（丧葬・拆卸・破土）已与日常分开，避免误选；选择仍跨标签保留。', 'Inauspicious acts (funerary · demolish · break-earth) are kept apart from everyday to avoid mis-selection; choices persist across tabs.')}</div>}
            </div>

            <div className="a-card" style={{ marginTop: '10px' }} ref={refRange}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('日期范围', 'Date range')}</div>
              <div className="a-chips" style={{ marginBottom: '12px' }}>
                <button className="a-chip" onClick={() => preset(todayJDN, todayJDN + 29)}>{L('未来30天', 'Next 30d')}</button>
                <button className="a-chip" onClick={() => preset(todayJDN, todayJDN + 89)}>{L('未来90天', 'Next 90d')}</button>
                <button className="a-chip" onClick={() => { const last = jdnToGregorian(gregorianToJDN(today.mo === 12 ? today.y + 1 : today.y, today.mo === 12 ? 1 : today.mo + 1, 1) - 1); setStartStr(fmtYMD(today.y, today.mo, 1)); setEndStr(fmtYMD(last.y, last.m, last.d)); }}>{L('本月', 'This month')}</button>
              </div>
              <div className="a-row2">
                <div><label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{L('起', 'From')}</label><input className="a-in" type="date" value={startStr} onChange={e => setStartStr(e.target.value)} /></div>
                <div><label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{L('迄', 'To')}</label><input className="a-in" type="date" value={endStr} onChange={e => setEndStr(e.target.value)} /></div>
              </div>
              {tooLong && <div className="a-note" style={{ marginTop: '8px' }}>{L('范围超过一年，已截断。', 'Range capped at one year.')}</div>}
              {birth && <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}><input type="checkbox" checked={screenZodiac} onChange={e => setScreenZodiac(e.target.checked)} />{L('按本命/同行生肖筛除冲日', 'Screen out days clashing your (and others\') zodiac')}</label>}
            </div>

            <div className="a-sec" ref={refList}>{selActs.length ? L('最佳日期', 'Best dates') : L('范围内日期', 'Days in range')} <span className="en">{listData.length} days</span>
              <span className="a-seg" style={{ marginLeft: 'auto' }}>
                <button className={findView === 'cal' ? 'on' : ''} onClick={() => setFindView('cal')}>{L('月历', 'Month')}</button>
                <button className={findView === 'agenda' ? 'on' : ''} onClick={() => setFindView('agenda')}>{L('日程', 'Agenda')}</button>
                <button className={findView === 'list' ? 'on' : ''} onClick={() => setFindView('list')}>{L('列表', 'List')}</button>
              </span>
            </div>
            {findView === 'list' && wuxProfile && <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}><span className="a-seg"><button className={sortMode === 'score' ? 'on' : ''} onClick={() => setSortMode('score')}>{L('宜忌', 'Verdict')}</button><button className={sortMode === 'wuxing' ? 'on' : ''} onClick={() => setSortMode('wuxing')}>五行</button></span></div>}

            {findView === 'cal' && (
              <div className="a-card">
                <div className="a-calnav">
                  <button className="a-iconbtn" aria-label={L('上个月', 'previous month')} onClick={() => { let m = findCalM - 1, y = findCalY; if (m < 1) { m = 12; y--; } setFindCalM(m); setFindCalY(y); }}>‹</button>
                  <div className="t">{findCalY} · {findCalM}{L('月', '')}</div>
                  <button className="a-iconbtn" aria-label={L('下个月', 'next month')} onClick={() => { let m = findCalM + 1, y = findCalY; if (m > 12) { m = 1; y++; } setFindCalM(m); setFindCalY(y); }}>›</button>
                </div>
                <div className="a-cal a-cal-rich">
                  {(lang === 'en' ? DOW_EN : DOW_ZH).map((d, i) => <div key={i} className="dow">{lang === 'en' ? d.slice(0, 2) : d}</div>)}
                  {findCalData.map((c, i) => {
                    if (c == null) return <div key={'p' + i} className="a-cell out" />;
                    const yi = selActs.length ? topYiCat(c.dv) : null;
                    const lunar = LUNAR_DAY_NAMES[c.day.lunar.day] === '初一' ? monthNamesZh[c.day.lunar.monthNum] + '月' : LUNAR_DAY_NAMES[c.day.lunar.day];
                    return (
                      <button key={c.jdn} className={'a-cell' + (selActs.length ? ' tint ' + colorClass(c.dv.color) : '') + (c.inRange ? '' : ' out') + (c.jdn === todayJDN ? ' today' : '') + (selJDN === c.jdn ? ' sel' : '')} onClick={() => setSelJDN(c.jdn)} aria-label={`${c.day.greg.m}/${c.dnum} ${lunar} ${c.day.dayGanzhi}${selActs.length ? ' · ' + (lang === 'en' ? c.dv.verdictEn : c.dv.verdict) : ''}`}>
                        <span className="g">{c.dnum}</span>
                        <span className="cl">{lunar}</span>
                        <span className="cgz">{c.day.dayGanzhi}</span>
                        {selActs.length > 0 && <span className="cv2"><span className="cvg">{vIcon(c.dv.color)}</span><span className="cvt">{lang === 'en' ? c.dv.verdictEn : c.dv.verdict}</span></span>}
                        {yi && <span className="cyi"><Icon name={yi} size={12} title={L('宜', 'favorable')} /></span>}
                        {screenZodiac && (c.dv.benmingChong || c.dv.clashedPersons.length) ? <span className="cf" aria-hidden="true">⚠</span> : null}
                        {cellStar(c.jdn)}
                      </button>
                    );
                  })}
                </div>
                <div className="a-cal-legend" aria-label={L('图例', 'Legend')}>
                  <span className="lg"><b className="v-good">✓</b>{L('宜', 'Favorable')}</span>
                  <span className="lg"><b className="v-bad">✗</b>{L('忌', 'Avoid')}</span>
                  <span className="lg"><b className="v-amber">～</b>{L('参考', 'Mixed')}</span>
                  <span className="lg"><b className="v-grey">·</b>{L('中性', 'Neutral')}</span>
                  <span className="lg">⭐ {L('收藏', 'Save')}</span>
                </div>
                <div className="a-hint">{L('点选日期查看详情（桌面端在右侧并排显示）；范围外日期变淡。', 'Tap a day for detail (docks beside the grid on desktop); out-of-range days are dimmed.')}</div>
              </div>
            )}
            {findView === 'agenda' && (<>
              {listData.length === 0 && <div className="a-empty">{L('没有可显示的日期。', 'No days to show.')}</div>}
              {listData.slice().sort((a, b) => a.jdn - b.jdn).slice(0, 120).map(({ jdn, day, dv }) => dateCard(jdn, day, dv))}
            </>)}
            {findView === 'list' && (<>
              {listData.length === 0 && <div className="a-empty">{L('没有可显示的日期。', 'No days to show.')}</div>}
              {listData.slice(0, 120).map(({ jdn, day, dv }) => dateCard(jdn, day, dv))}
            </>)}
            <div className="a-disc">{L('推算参考，非定论。', 'Computed guidance, not definitive.')}</div>
          </main>
        )}

        {/* ===================== SAVED ===================== */}
        {tab === 'saved' && (
          <main className="a-screen">
            <PageHero zh="收藏" en="Saved dates" icon="save" accent="plum"
              eyebrow={L('本机 · 私密', 'On-device · Private')}
              sub={<>{L('已收藏的日子，仅存于本机、不上传。', 'Your starred days — stored on this device only, never transmitted.')} <span className="en">{savedJDNs.length} saved</span></>} />
            {savedJDNs.length === 0
              ? <div className="a-empty">{L('还没有收藏。在列表、日历或日详情点 ☆ 收藏。', 'No saved dates yet. Tap ☆ on a list row, a calendar day, or the day sheet to save one.')}</div>
              : (<>
                  {savedJDNs.slice().sort((a, b) => a - b).map(jdn => dateCard(jdn))}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}><button className="a-btn-ghost" onClick={clearSaved}>{L('清除全部收藏', 'Clear all saved')}</button></div>
                </>)}
            <div className="a-disc">{L('推算参考，非定论。', 'Computed guidance, not definitive.')}</div>
          </main>
        )}

        {/* ===================== CALENDAR ===================== */}
        {tab === 'calendar' && (
          <main className="a-screen">
            <PageHero zh="黄历" en="Almanac" icon="calendar" accent="jade"
              eyebrow={L('干支 · 节气 · 神煞', 'Ganzhi · Terms · Spirits')}
              sub={L('逐月查看每日干支、宜忌与吉时。', 'Browse each day’s ganzhi, 宜/忌 and lucky hours, month by month.')} />
            <div className="a-annual">
              <span className="yr">{calY} {STEMS[annualCal.yp.stem] + BRANCHES[annualCal.yp.branch]}{L('年', '')}</span>
              <span><b>{L('太岁', 'Tai Sui')}</b> {annualCal.taiSuiZodiac}·{annualCal.taiSuiDir}</span>
              <span><b>{L('岁破', 'Sui Po')}</b> {annualCal.suiPoDir}</span>
              <span><b>{L('三煞', '3-Sha')}</b> {annualCal.sanShaDir}</span>
              <span><b>{L('五黄', '5-Yel')}</b> {annualCal.wuHuangDir}<i className="a-graded">{L('演算', 'calc')}</i></span>
              <span className="note">{L('年盘凶方，忌动土修造冲犯', 'inauspicious year directions')}</span>
            </div>
            {(() => { const t = solarTermOf(todayJDN); if (!t || !t.current || !t.next) return null; const days = t.next.jdn - todayJDN; const span = t.next.jdn - t.current.jdn; const pct = Math.max(0, Math.min(100, (1 - days / (span || 15)) * 100)); const tg = jdnToGregorian(t.next.jdn); return (<div className="a-ribbon"><span>{L('当前', 'Now')} <b>{L(t.current.zh, t.current.en)}</b></span><span className="trk"><i style={{ width: pct + '%' }} /></span><span>{L('下一', 'Next')} <b>{L(t.next.zh, t.next.en)}</b> · {L(`${days}天后 ${tg.m}/${tg.d}`, `in ${days}d ${tg.m}/${tg.d}`)}</span></div>); })()}

            <div className="a-card">
              <div className="a-calnav">
                <button className="a-iconbtn" aria-label="prev" onClick={() => { let m = calM - 1, y = calY; if (m < 1) { m = 12; y--; } setCalM(m); setCalY(y); }}>‹</button>
                <div className="t">{calY} · {monthNamesZh[calM] === undefined ? calM : calM}{L('月', '')}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="a-btn-ghost" onClick={() => { setCalY(today.y); setCalM(today.mo); }}>{L('今天', 'Today')}</button>
                  <button className="a-iconbtn" aria-label="next" onClick={() => { let m = calM + 1, y = calY; if (m > 12) { m = 1; y++; } setCalM(m); setCalY(y); }}>›</button>
                </div>
              </div>
              <div className="a-cal">
                {(lang === 'en' ? DOW_EN : DOW_ZH).map((d, i) => <div key={i} className="dow">{lang === 'en' ? d.slice(0, 2) : d}</div>)}
                {(() => {
                  const first = gregorianToJDN(calY, calM, 1);
                  const pad = weekday(first);
                  const daysIn = gregorianToJDN(calM === 12 ? calY + 1 : calY, calM === 12 ? 1 : calM + 1, 1) - first;
                  const cells = [];
                  for (let i = 0; i < pad; i++) cells.push(<div key={'p' + i} className="a-cell out" />);
                  for (let dnum = 0; dnum < daysIn; dnum++) {
                    const jdn = first + dnum; const day = getDay(jdn); const dv = dayView(day, selActs, birthYearBranch, screenZodiac, profile, extraBranches, wuxProfile);
                    cells.push(
                      <button key={jdn} className={'a-cell' + (jdn === todayJDN ? ' today' : '')} onClick={() => setSelJDN(jdn)}>
                        <span className="g">{dnum + 1}</span>
                        <span className="l">{LUNAR_DAY_NAMES[day.lunar.day] === '初一' ? monthNamesZh[day.lunar.monthNum] + '月' : LUNAR_DAY_NAMES[day.lunar.day]}</span>
                        {selActs.length > 0 && <span className={'dot ' + colorClass(dv.color)} />}
                        {cellStar(jdn)}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
              <div className="a-hint">{L('点选日期查看详情 · 选中后 ← → 翻日', 'Tap a day · then ← → to navigate')}</div>
            </div>
          </main>
        )}

        {/* ===================== TOOLS ===================== */}
        {tab === 'tools' && (
          <main className="a-screen">
            <PageHero zh="工具" en="Tools" icon="tools" accent="gold"
              eyebrow={L('校验 · 自检 · 速查', 'Verify · Self-test · Lookup')}
              sub={L('历法校验与速查工具，可核对节气、朔望与神煞。', 'Calendar checks and quick lookups — verify terms, moons and spirits.')} />

            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('生辰八字', 'Birth chart')} <span className="en">optional</span></div>
              <div className="a-row2">
                <div><label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{L('出生日期', 'Birth date')}</label><input className="a-in" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
                <div><label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{L('出生时间', 'Birth time')}</label><input className="a-in" type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} /></div>
              </div>
              {birth && (
                <div style={{ marginTop: '12px' }}>
                  <div className="a-pillars">
                    {[[L('年柱', 'Yr'), birth.yearGanzhi], [L('月柱', 'Mo'), birth.monthGanzhi], [L('日柱', 'Day'), birth.dayGanzhi], [L('时柱', 'Hr'), birth.hourInfo ? birth.hourInfo.solarGanzhi : '—']].map((p, i) => <div key={i} className="a-pillar"><div className="cap">{p[0]}</div><div className="gz">{p[1]}</div></div>)}
                  </div>
                  <div className="a-note" style={{ marginTop: '6px' }}>{L('生肖', 'Zodiac')} {birth.zodiac} · {L('日主', 'Day-master')} {birth.dayEl}{birth.hourInfo && birth.hourInfo.shifted ? ' · ' + L('已按真太阳时校正时柱', 'hour adjusted to true solar time') : ''}</div>
                  {birthLate && birthLate.rolled && <div className="a-note" style={{ color: 'var(--seal)', marginTop: '4px' }}>{L(`晚子时：日柱进为 ${birthLate.ganzhi}`, `Late-子: day pillar → ${birthLate.ganzhi}`)}</div>}
                  {wuxProfile && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>{L('五行强弱', 'Five-element strength')} {pop('wux', '说明', 'Note', '此为「干支＋藏干＋月令」的简化估算，含地支藏干与得令加权，但未含完整刑冲合会与调候，非专业命理。仅作日子五行是否相助的弱参考。', 'A simplified estimate (stems + hidden stems + month weighting). Not a full professional reading; a weak hint only.', 'wuxing')}</div>
                      <div className="a-bars">{EL_NAMES.map(el => { const v = wuxProfile.tally[el], mx = Math.max(...Object.values(wuxProfile.tally)) || 1; return <div key={el} className="a-bar"><span className="bl">{el}<span style={{ fontSize: '8px', color: 'var(--ink-faint)' }}> {EL_EN[el]}</span></span><span className="bt"><i style={{ width: (v / mx * 100) + '%' }} /></span><span className="bn">{v}</span></div>; })}</div>
                      <div style={{ fontSize: '12.5px', marginTop: '8px' }}>{L('日主', 'Day-master')} <b style={{ color: 'var(--seal)' }}>{wuxProfile.dayMaster}</b> · {wuxProfile.deLing ? L('得令', 'in season') : L('失令', 'out of season')} · {wuxProfile.strong ? L('偏强', 'strong') : L('偏弱', 'weak')} · {L('喜用', 'favored')} <b>{wuxProfile.favored.join('、')}</b></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="a-card" style={{ marginTop: '10px' }}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('多人合冲', 'Multi-person clash')}</div>
              <div className="a-chips">
                {persons.map((p, i) => <span key={i} className="a-chip on">{ZODIAC[p.branch]}<span className="x" style={{ cursor: 'pointer' }} onClick={() => setPersons(s => s.filter((_, k) => k !== i))}>×</span></span>)}
                {persons.length < 5 && <select className="a-in" style={{ width: 'auto', minWidth: '130px' }} value={-1} onChange={e => { const b = +e.target.value; if (b >= 0) setPersons(s => [...s, { branch: b }]); }}><option value={-1}>{L('＋ 添加生肖', '＋ add zodiac')}</option>{ZODIAC.map((z, i) => <option key={i} value={i}>{z}</option>)}</select>}
              </div>
              <div className="a-note" style={{ marginTop: '6px' }}>{L('在「择日」开启筛选后，冲任一人本命之日会标红。', 'With screening on (Find tab), days clashing anyone are flagged.')}</div>
            </div>

            <div className="a-card" style={{ marginTop: '10px' }}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('二十八宿校准', 'Calibrate 28-mansion')}</div>
              <div className="a-row2" style={{ alignItems: 'end' }}>
                <input className="a-in" type="date" value={calDateStr} onChange={e => setCalDateStr(e.target.value)} />
                <select className="a-in" value={calMansionIdx} onChange={e => setCalMansionIdx(+e.target.value)}>{MANSIONS.map((m, i) => <option key={i} value={i}>{m}宿 · {MANSION_ANIMAL[i]}</option>)}</select>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="a-btn-ghost" onClick={() => { const c = parseYMD(calDateStr); if (!c) return; const t = mansionIndex(gregorianToJDN(c.y, c.mo, c.d)); setMansionOffset(((calMansionIdx - t) % 28 + 28) % 28); }}>{L('套用', 'Apply')}</button>
                {mansionOffset !== 0 && <button className="a-btn-ghost" onClick={() => setMansionOffset(0)}>{L('清除', 'Reset')}</button>}
                <span className="a-seg"><button className={mansionSrc === 'jixiong' ? 'on' : ''} onClick={() => setMansionSrc('jixiong')}>{L('吉凶', '吉凶')}</button><button className={mansionSrc === 'animal' ? 'on' : ''} onClick={() => setMansionSrc('animal')}>{L('演禽', '演禽')}</button></span>
              </div>
              <div className="a-note" style={{ marginTop: '6px' }}>{mansionOffset === 0 ? L('默认相位锚定 2024-01-01=危。填入你通书某日的宿即可平移。', 'Default phase anchored 2024-01-01=危. Enter a known day+宿 to shift.') : L(`已平移 ${mansionOffset} 宿（仅影响显示）。`, `Shifted ${mansionOffset} mansions (display only).`)}</div>
            </div>

            <div className="a-card" style={{ marginTop: '10px' }}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('精度核对', 'Accuracy')} <span className="en"><i className="a-exact">{L('精确', 'exact')}</i></span></div>
              <div className="a-field" style={{ marginBottom: '10px' }}>
                <label>{L('日柱查询', 'Day-pillar lookup')}</label>
                <input className="a-in" type="date" value={accDate} onChange={e => setAccDate(e.target.value)} />
                {accDayLookup && <div style={{ marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--seal)' }}>{accDayLookup.dayGanzhi}{L('日', '')} · {accDayLookup.officer}{L('日', '')} · {lunarLabel(accDayLookup)}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '13px' }}>{L('二十四节气', '24 terms')}</span>
                <button className="a-btn-ghost" onClick={() => setAccYear(y => y - 1)}>‹</button><span className="mono">{accYear}</span><button className="a-btn-ghost" onClick={() => setAccYear(y => y + 1)}>›</button>
              </div>
              <div className="a-accg">{accTerms.map((t, i) => <div key={i} className="a-accc"><span className="nm">{L(t.zh, t.en)}</span><span className="dt">{t.date.slice(5)} {t.clock}</span></div>)}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '13px', margin: '12px 0 6px' }}>{L('农历节日 2020–2030', 'Lunar festivals 2020–2030')}</div>
              <table className="a-acct"><thead><tr><th>{L('年', 'Yr')}</th><th>{L('春节', 'CNY')}</th><th>{L('端午', 'DW')}</th><th>{L('中秋', 'MA')}</th></tr></thead><tbody>{accFestivals.map(f => <tr key={f.y}><td>{f.y}</td><td>{f.cny.slice(5)}</td><td>{f.duanwu.slice(5)}</td><td>{f.midautumn.slice(5)}</td></tr>)}</tbody></table>
              <div className="a-note" style={{ marginTop: '10px' }}>{L(`置闰 1900–2100：闰月 ${accLeap.leapCount} 个、违例 ${accLeap.bad} 个（闰月皆无中气）。临界年(≤6h) ${accRazor.length} 个，如 `, `Leap 1900–2100: ${accLeap.leapCount} leap months, ${accLeap.bad} violations. Razor-edge years (≤6h): ${accRazor.length}, e.g. `)}<span className="mono">{accRazor.slice(0, 10).map(r => r.year).join(', ')}…</span></div>
            </div>

            <div className="a-card" style={{ marginTop: '10px' }}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('引擎自检', 'Engine self-test')} <span className="en">{testPass}/{tests.length}</span></div>
              {tests.map((t, i) => <div key={i} className="a-test"><span className={'dot ' + (t.ok ? 'ok' : 'no')} /><span>{L(t.zh, t.en)}</span><span className="got">{t.got}</span></div>)}
            </div>

            <div className="a-card" style={{ marginTop: '10px' }}>
              <div className="a-sec" style={{ marginTop: 0 }}>{L('导出', 'Export')}</div>
              <div className="a-chips">
                <button className="a-chip" onClick={exportCSV}>{L('清单 CSV', 'CSV')}</button>
                <button className="a-chip" onClick={exportICS}>{selJDN != null ? L('选定日 .ics', 'Day .ics') : L('前20日 .ics', 'Top 20 .ics')}</button>
                <button className="a-chip" onClick={copyLink}>{copied ? L('已复制 ✓', 'Copied ✓') : L('复制链接', 'Copy link')}</button>
              </div>
              <div className="a-note" style={{ marginTop: '6px' }}>{L('链接已把设定编码进网址（#），可分享。无本地存储。', 'Settings are encoded in the URL hash for sharing. No local storage.')}</div>
            </div>
          </main>
        )}

        {tab === 'learn' && (
          <main className="a-screen">
            <PageHero zh="关于" en="About" icon="info" accent="ink"
              eyebrow={L('指南 · 词汇 · 源流', 'Guide · Glossary · Sources')}
              sub={L('快速上手、用例、词汇表与历法源流；推算参考，非定论。', 'Quick start, examples, glossary and sources — computed guidance, never definitive.')} />
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('快速上手', 'Quick start')}</div>
              <ol className="a-ql">{DOCS.quick.map((s, i) => <li key={i}>{L(s[0], s[1])}</li>)}</ol>
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('用例', 'Examples')} <span className="en">{DOCS.cases.length}</span></div>
              <p className="a-hist-p" style={{ marginTop: 0 }}>{L('跟着真实场景走一遍，看工具如何帮你择日。', 'Walk real scenarios end-to-end to see how the tool helps.')}</p>
              {DOCS.cases.map((c) => <div key={c.id}>{acc('case-' + c.id, c.title[0], c.title[1], null, (
                <div>
                  <p className="a-hist-p" style={{ marginTop: 0 }}><b>{L('情境', 'Scenario')}：</b>{L(c.scenario[0], c.scenario[1])}</p>
                  <ol className="a-ql">{c.steps.map((s, j) => <li key={j}>{L(s[0], s[1])}</li>)}</ol>
                  <p className="a-hist-p"><b>{L('解读', 'Reading')}：</b>{L(c.reading[0], c.reading[1])}</p>
                  {c.note && <div className="a-note" style={{ marginTop: '6px' }}>{L(c.note[0], c.note[1])}</div>}
                  {c.links && c.links.length > 0 && <div className="a-case-links">{c.links.map(id => { const g = GLOSSARY.find(e => e.id === id); return g ? <button key={id} className="a-case-link" onClick={() => setGFocus(id)}>{g.zh} ↗</button> : null; })}</div>}
                </div>
              ))}</div>)}
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('读懂一天', 'Reading a day page')}</div>
              {DOCS.read.map((r, i) => <div key={i} className="a-gl-row"><b className="a-gl-k">{L(r.k[0], r.k[1])}</b><span className="a-gl-d">{L(r.d[0], r.d[1])}</span></div>)}
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('个人化', 'Personalize')}</div>
              <ul className="a-ql">{DOCS.personalize.map((s, i) => <li key={i}>{L(s[0], s[1])}</li>)}</ul>
              <div className="a-sec">{L('工具', 'Tools')}</div>
              <ul className="a-ql">{DOCS.tools.map((s, i) => <li key={i}>{L(s[0], s[1])}</li>)}</ul>
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('历法源流', 'How the calendar science came about')}</div>
              {DOCS.hist.map((h, i) => <div key={i}>{acc('Lh' + i, h.t[0], h.t[1], null, <p className="a-hist-p">{L(h.p[0], h.p[1])}</p>)}</div>)}
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('常见问题', 'FAQ')}</div>
              {DOCS.faq.map((f, i) => <div key={i}>{acc('Lq' + i, f.q[0], f.q[1], null, <p className="a-hist-p">{L(f.a[0], f.a[1])}</p>)}</div>)}
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('词汇表', 'Glossary')} <span className="en">{GLOSSARY.length}</span></div>
              <input className="a-gq" type="search" value={gq} onChange={e => setGq(e.target.value)} placeholder={L('搜索：汉字／拼音／英文…', 'Search hanzi / pinyin / English…')} aria-label={L('搜索词汇表', 'Search glossary')} />
              {(() => { const q = gq.trim().toLowerCase(); const hit = g => !q || g.zh.includes(gq.trim()) || g.py.toLowerCase().includes(q) || g.en.toLowerCase().includes(q) || g.d.some(x => x.toLowerCase().includes(q)); const out = []; GLOSS_CATS.forEach((c, ci) => { const items = GLOSSARY.filter(g => g.cat === ci && hit(g)); if (!items.length) return; out.push(
                <div key={ci}>
                  <div className="a-gl-cat">{L(c[0], c[1])}</div>
                  {items.map(g => { const open = gFocus === g.id || !!q; return (
                    <div key={g.id} id={'gl-' + g.id} className={'a-gl-e' + (gFocus === g.id ? ' hot' : '')}>
                      <button className="a-gl-h" aria-expanded={open} onClick={() => setGFocus(gFocus === g.id ? null : g.id)}>
                        <span className="a-gl-zh">{g.zh}</span><span className="a-gl-py">{g.py}</span><span className="a-gl-en">{g.en}</span>
                        {g.g ? <span className={'a-gl-pill' + (g.g === '略' ? ' om' : g.g === 'H' ? ' gh' : ' gm')}>{g.g}</span> : null}
                      </button>
                      {open && <div className="a-gl-b"><p>{L(g.d[0], g.d[1])}</p>{g.src ? <p className="a-gl-src">{L('出处：', 'Source: ')}{g.src}</p> : null}</div>}
                    </div>
                  ); })}
                </div>
              ); }); return out.length ? out : <div className="a-note">{L('无匹配词条。', 'No matching entries.')}</div>; })()}
              <div className="a-note" style={{ marginTop: '8px' }}>{L('词条均注明典籍出处或「各家或异」；H＝高置信，M＝中置信，略＝未纳入计分。', 'Entries carry source attributions or note that versions differ; H = high confidence, M = medium, 略 = omitted from scoring.')}</div>
            </div>
            <div className="a-card">
              <div className="a-sec" style={{ marginTop: 0 }}>{L('关于', 'About')} <span className="en">v{DOCS.v.ver} · {DOCS.v.date}</span></div>
              <p className="a-hist-p">{L(DOCS.about.what[0], DOCS.about.what[1])}</p>
              <p className="a-hist-p">{L(DOCS.about.not[0], DOCS.about.not[1])}</p>
              {acc('Lab1', '方法', 'Method', null, <p className="a-hist-p">{L(DOCS.about.method[0], DOCS.about.method[1])}</p>)}
              {acc('Lab2', '信任与边界', 'Trust & limits', null, <div><p className="a-hist-p">{L(DOCS.trust.exact[0], DOCS.trust.exact[1])}</p><p className="a-hist-p">{L(DOCS.trust.graded[0], DOCS.trust.graded[1])}</p><p className="a-hist-p">{L(DOCS.trust.omitted[0], DOCS.trust.omitted[1])}</p></div>)}
              <div className="a-note" style={{ marginTop: '8px' }}>{L(`实时核验：引擎自检 ${testPass}/${tests.length} 通过；置闰 1900–2100 共 ${accLeap.leapCount} 闰、${accLeap.bad} 违例；节气临界年 ${accRazor.length} 个（详见工具→精度核对）。`, `Live checks: engine self-tests ${testPass}/${tests.length} pass; leap placement 1900–2100: ${accLeap.leapCount} leaps, ${accLeap.bad} violations; ${accRazor.length} razor-edge years (see Tools → Accuracy).`)}</div>
              <p className="a-hist-p">{L(DOCS.about.privacy[0], DOCS.about.privacy[1])}</p>
              <p className="a-gl-src">{L(DOCS.about.src[0], DOCS.about.src[1])}</p>
              <div className="a-note">{L(DOCS.trust.disclaimer[0], DOCS.trust.disclaimer[1])}</div>
            </div>
          </main>
        )}

        {/* ===================== ACADEMY (WS-2 fills) ===================== */}
        {tab === 'academy' && (
          <main className="a-screen a-academy">
            {!acaChapter ? (<>
              <PageHero zh="学堂" en="Academy" icon="academy" accent="cinnabar"
                eyebrow={L('故事 · 图解 · 课程', 'Stories · Diagrams · Lessons')}
                sub={L('用故事认识择吉的基础与术语；叙述生动，史实仍依典籍。', 'Learn the basics and terms of date-selection through short stories — lively telling, sourced facts.')} />
              {(() => {
                const total = DOCS.academy.length, done = acaDoneCount(), pct = total ? Math.round(done / total * 100) : 0;
                const nx = DOCS.academy.find(c => c.id === nextChapterId());
                return (
                  <div className="a-progress-card">
                    <div className="a-progress-head"><span>{L('学习进度', 'Your progress')}</span><span className="num">{done} / {total} · {pct}%</span></div>
                    <div className="a-progress" aria-hidden="true"><i style={{ width: pct + '%' }} /></div>
                    {nx && <button className="a-continue" onClick={() => setAcaChapter(nx.id)}>
                      <span className="cl">{done === 0 ? L('开始学习', 'Start') : done >= total ? L('复习', 'Review') : L('继续学习', 'Continue')}</span>
                      <span className="ct">{L(nx.title[0], nx.title[1])}</span>
                      <span className="ca" aria-hidden="true">→</span>
                    </button>}
                  </div>
                );
              })()}
              {DOCS.academyModules.map((m, mi) => {
                const chs = m.chapters.map(cid => DOCS.academy.find(c => c.id === cid)).filter(Boolean);
                return (
                  <section key={m.id} className="a-track">
                    <div className="a-track-head">
                      <span className="a-track-no">{['壹', '贰', '叁', '肆'][mi] || (mi + 1)}</span>
                      <div className="a-track-meta"><h2 className="a-track-title">{L(m.zh, m.en)}</h2><span className="a-track-sub">{chs.length} {L('课', chs.length === 1 ? 'lesson' : 'lessons')}</span></div>
                    </div>
                    <div className="a-lgrid">
                      {chs.map(c => { const gi = DOCS.academy.indexOf(c); const done = isDone(c.id); const current = c.id === nextChapterId();
                        return (
                          <button key={c.id} className="a-lcard" onClick={() => setAcaChapter(c.id)} aria-label={L(c.title[0], c.title[1]) + (done ? ' · ' + L('已学完', 'done') : '')}>
                            <span className="a-lcard-cover"><Art name={c.figure} alt={L(c.title[0], c.title[1])} lang={lang === 'en' ? 'en' : 'zh'} theme={theme} size={480} />{done && <span className="a-lcard-done" aria-hidden="true">✓</span>}</span>
                            <span className="a-lcard-body">
                              <span className="a-lcard-meta">{L(`第 ${gi + 1} 章`, `Lesson ${gi + 1}`)} · {L('约 2 分钟', '~2 min read')}</span>
                              <span className="a-lcard-title">{L(c.title[0], c.title[1])}</span>
                              <span className={'a-lcard-chip' + (done ? ' done' : current ? ' current' : '')}>{done ? '✓ ' + L('已学完', 'Completed') : current ? L('继续学习 →', 'Continue →') : L('开始 →', 'Start →')}</span>
                            </span>
                          </button>
                        ); })}
                    </div>
                  </section>
                );
              })}
              {/* upcoming lessons — placeholders; swap each for a real chapter as content is produced (see generation brief) */}
              <section className="a-track">
                <div className="a-track-head">
                  <span className="a-track-no plus">＋</span>
                  <div className="a-track-meta"><h2 className="a-track-title">{L('进阶课程', 'Going further')}</h2><span className="a-track-sub">{L('即将上线', 'Coming soon')}</span></div>
                </div>
                <div className="a-lgrid">
                  {[['二十四节气详解', 'The 24 solar terms, in depth'], ['十二生肖与冲煞', 'Your zodiac sign & clashes'], ['每日吉时怎么看', 'Reading the lucky hours'], ['择日实战：开新店', 'Worked example: opening a shop']].map(([zh, en], i) => (
                    <div key={i} className="a-lcard soon" aria-disabled="true">
                      <span className="a-lcard-cover soon"><Icon name="academy" size={38} /></span>
                      <span className="a-lcard-body">
                        <span className="a-lcard-meta">{L('新课程', 'New lesson')}</span>
                        <span className="a-lcard-title">{L(zh, en)}</span>
                        <span className="a-lcard-chip soon">{L('敬请期待', 'Coming soon')}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <div className="a-sec">{L('图解', 'Diagrams')}</div>
              <div className="a-diagram-grid">{DIAGRAM_NAMES.map(n => <Diagram key={n} name={n} lang={lang === 'en' ? 'en' : 'zh'} size={240} />)}</div>
            </>) : (() => {
              const idx = DOCS.academy.findIndex(c => c.id === acaChapter);
              const c = DOCS.academy[idx]; if (!c) { setAcaChapter(null); return null; }
              const prev = DOCS.academy[idx - 1], next = DOCS.academy[idx + 1];
              return (
                <article className="a-reader">
                  <button className="a-seemore" onClick={() => setAcaChapter(null)}>‹ {L('返回课程', 'All lessons')}</button>
                  <div className="a-progress" aria-hidden="true"><i style={{ width: ((idx + 1) / DOCS.academy.length * 100) + '%' }} /></div>
                  <div className="a-reader-no">{L(`第 ${idx + 1} 章`, `Chapter ${idx + 1}`)} / {DOCS.academy.length}{isDone(c.id) ? ' · ✓ ' + L('已学完', 'done') : ''}</div>
                  <h1 className="a-h1">{L(c.title[0], c.title[1])}</h1>
                  <Art name={c.figure} alt={L(c.title[0], c.title[1])} lang={lang === 'en' ? 'en' : 'zh'} theme={theme} size={460} />
                  <p className="a-reader-body">{L(c.story[0], c.story[1])}</p>
                  <div className="a-case-links"><span style={{ fontSize: '11px', color: 'var(--ink-faint)', alignSelf: 'center' }}>{L('想深入', 'Go deeper')}:</span>{c.glossaryLinks.map(id => { const g = GLOSSARY.find(e => e.id === id); return g ? <button key={id} className="a-case-link" onClick={() => { setTab('learn'); setGFocus(id); }}>{g.zh} ↗</button> : null; })}</div>
                  <div className="a-reader-cross">
                    <button className="a-btn-ghost" onClick={() => setTab('learn')}><Icon name="article" size={15} /> {L('看用例', 'See a worked example')}</button>
                    <button className="a-btn-ghost" onClick={() => setTab('find')}><Icon name="calendar" size={15} /> {L('试试看 →', 'Try it →')}</button>
                  </div>
                  <div className="a-reader-actions">
                    <button className={'a-btn-ghost' + (isDone(c.id) ? ' on' : '')} onClick={() => toggleDone(c.id)}>{isDone(c.id) ? L('✓ 已学完', '✓ Completed') : L('标记为已学完', 'Mark complete')}</button>
                    {next ? <button className="a-btn" style={{ width: 'auto', padding: '0 18px' }} onClick={() => { markDone(c.id); setAcaChapter(next.id); }}>{L('完成并继续', 'Complete & next')} →</button>
                          : <button className="a-btn" style={{ width: 'auto', padding: '0 18px' }} onClick={() => { markDone(c.id); setAcaChapter(null); }}>{L('完成课程 ✓', 'Finish course ✓')}</button>}
                  </div>
                  <div className="a-reader-nav">
                    {prev ? <button className="a-btn-ghost" onClick={() => setAcaChapter(prev.id)}>‹ {L(prev.title[0], prev.title[1])}</button> : <span />}
                    {next ? <button className="a-btn-ghost" onClick={() => setAcaChapter(next.id)}>{L(next.title[0], next.title[1])} ›</button> : <span />}
                  </div>
                </article>
              );
            })()}
          </main>
        )}

        {/* ===================== VIDEOS ===================== */}
        {tab === 'videos' && (
          <main className="a-screen a-media a-videos">
            <PageHero zh="视频" en="Videos" icon="video" accent="terra"
              eyebrow={L('短课 · 视频', 'Short lessons · Video')}
              sub={L('择吉与历法的短课程。', 'Short lessons on date-selection and the almanac.')} />
            {(DOCS.media.videos || []).length === 0
              ? <div className="a-empty">{L('课程视频即将上线。', 'Video lessons coming soon.')}</div>
              : <div className="a-vidgrid">{DOCS.media.videos.map(v => {
                  const t = lang === 'en' ? v.title[1] : v.title[0];
                  return (
                    <div key={v.id} className="a-vidcard">
                      <div className="a-vidframe">
                        {v.src && v.provider === 'youtube' && vidPlaying === v.id
                          ? <iframe className="a-vidembed" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.src)}?rel=0`} title={t} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="no-referrer" />
                          : v.src && v.provider === 'file' && vidPlaying === v.id
                          ? <video className="a-vidembed" src={v.src} controls preload="none" />
                          : <button className="a-vidposter" onClick={() => { if (v.src) setVidPlaying(v.id); }} aria-label={t + (v.src ? '' : ' — ' + L('即将上线', 'coming soon'))}>
                              <span className="a-vidplay" aria-hidden="true"><Icon name="video" size={30} /></span>
                              {!v.src && <span className="a-vidsoon">{L('即将上线', 'Coming soon')}</span>}
                              {v.duration && <span className="a-viddur">{v.duration}</span>}
                            </button>}
                      </div>
                      <div className="a-vidmeta"><div className="vt">{t}</div><div className="vte">{L(v.teaser[0], v.teaser[1])}</div></div>
                    </div>
                  );
                })}</div>}
            <div className="a-note" style={{ marginTop: '10px' }}>{L('视频以 youtube-nocookie 隐私模式按需加载；离线时优雅降级。', 'Videos load on demand via privacy-friendly youtube-nocookie; they degrade gracefully offline.')}</div>
          </main>
        )}

        {/* ===================== ARTICLES ===================== */}
        {tab === 'articles' && (
          <main className="a-screen a-media a-articles">
            {(() => {
              const arts = DOCS.media.articles || [];
              const cur = artId ? arts.find(a => a.id === artId) : null;
              if (cur) return (
                <article className="a-reader">
                  <button className="a-seemore" onClick={() => setArtId(null)}>‹ {L('返回文章', 'All articles')}</button>
                  <h1 className="a-h1">{L(cur.title[0], cur.title[1])}</h1>
                  {(cur.author || cur.date) && <div className="a-reader-no">{[cur.author, cur.date].filter(Boolean).join(' · ')}</div>}
                  {cur.body ? <p className="a-reader-body">{L(cur.body[0], cur.body[1])}</p> : <div className="a-empty">{L('敬请期待。', 'Coming soon.')}</div>}
                  {cur.sourceAttribution ? <p className="a-gl-src">{L('出处：', 'Source: ')}{cur.sourceAttribution}</p> : null}
                  <div className="a-disc">{L('推算参考，非定论。', 'Computed guidance, not definitive.')}</div>
                </article>
              );
              return (<>
                <PageHero zh="文章" en="Articles" icon="article" accent="plum"
                  eyebrow={L('深读 · 文章', 'In-depth · Articles')}
                  sub={L('深入的择吉与历法文章。', 'In-depth articles on date-selection and the almanac.')} />
                {arts.length === 0
                  ? <div className="a-empty">{L('文章敬请期待。', 'Articles coming soon.')}</div>
                  : <div className="a-lessons-grid">{arts.map(a => (
                      <button key={a.id} className="a-lesson-card" onClick={() => setArtId(a.id)}>
                        <div className="lc-title">{L(a.title[0], a.title[1])}</div>
                        <div className="lc-teaser">{L(a.excerpt[0], a.excerpt[1])}</div>
                        <div className="lc-no">{a.body ? (L(a.date || '', a.date || '')) : L('即将上线', 'Coming soon')}</div>
                      </button>
                    ))}</div>}
              </>);
            })()}
          </main>
        )}

        {/* bottom tabs (mobile only; desktop uses the persistent top nav) */}
        <nav className="a-tabs" role="tablist" ref={refTabs}>
          {MOBILE_TABS.map(id => { const n = NAV.find(x => x.id === id); const on = tab === id || (id === 'find' && tab === 'calendar'); return <button key={id} className={'a-tab' + (on ? ' on' : '')} role="tab" aria-selected={on} onClick={() => setTab(id)}><span className="ic"><Icon name={n.icon} size={22} /></span><span className="tl">{L(n.zh, n.en)}</span></button>; })}
          <button className={'a-tab' + (['videos', 'articles', 'learn', 'saved'].includes(tab) ? ' on' : '')} aria-haspopup="true" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}><span className="ic"><Icon name="catMisc" size={22} /></span><span className="tl">{L('更多', 'More')}</span></button>
        </nav>
      </div>

      {/* ===================== MORE (mobile overflow) ===================== */}
      {moreOpen && (
        <>
          <div className="a-scrim" onClick={() => setMoreOpen(false)} />
          <div className="a-sheet settings" role="dialog" aria-modal="true" aria-label={L('更多', 'More')}>
            <div className="a-handle" />
            <div className="a-sheet-head"><div className="a-glance"><div className="gg" style={{ fontSize: '18px' }}>{L('更多', 'More')}</div></div><div className="a-sheet-nav"><button className="a-iconbtn" aria-label="close" onClick={() => setMoreOpen(false)}>×</button></div></div>
            <div className="a-sheet-body">
              {[['videos', '视频', 'Videos', 'video'], ['articles', '文章', 'Articles', 'article'], ['learn', '关于', 'About', 'info'], ['saved', '收藏', 'Saved', 'save']].map(([id, zh, en, ic]) => <button key={id} className="a-morelink" onClick={() => { setTab(id); setMoreOpen(false); }}><Icon name={ic} size={20} /> {L(zh, en)}</button>)}
              <button className="a-morelink" onClick={() => { setMoreOpen(false); goTour(0); }}><Icon name="info" size={20} /> {L('使用教程', 'Tutorial')}</button>
              <button className="a-morelink" onClick={() => { setMoreOpen(false); setSettingsOpen(true); }}><Icon name="settings" size={20} /> {L('设置', 'Settings')}</button>
            </div>
          </div>
        </>
      )}

      {/* ===================== DAY SHEET ===================== */}
      {D && (
        <>
          <div className="a-scrim" onClick={() => setSelJDN(null)} />
          <div className="a-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabIndex={-1} ref={sheetRef} onClick={() => popId && setPopId(null)}>
            <div className="a-handle" />
            <div className="a-sheet-head">
              <div className="a-sheet-nav">
                <button className={'a-iconbtn' + (isSaved(selJDN) ? ' starred' : '')} aria-pressed={isSaved(selJDN)} aria-label={L(isSaved(selJDN) ? '取消收藏' : '收藏', isSaved(selJDN) ? 'Unsave' : 'Save')} onClick={() => toggleSaved(selJDN)}>{isSaved(selJDN) ? '★' : '☆'}</button>
                <button className="a-iconbtn" aria-label="prev day" onClick={() => setSelJDN(j => j - 1)}>‹</button>
                <button className="a-iconbtn" aria-label="next day" onClick={() => setSelJDN(j => j + 1)}>›</button>
                <button className="a-iconbtn" aria-label="close" onClick={() => setSelJDN(null)}>×</button>
              </div>
              <div className={'a-glance ' + (selActs.length ? colorClass(DV.color) : 'v-grey')} aria-live="polite" id="sheet-title" ref={refGlance}>
                <div className="gv">{selActs.length ? vIcon(DV.color) + ' ' + (lang === 'en' ? DV.verdictEn : DV.verdict) : '—'}</div>
                <div>
                  <div className="gd">{D.greg.y}-{String(D.greg.m).padStart(2, '0')}-{String(D.greg.d).padStart(2, '0')} · {L(DOW_ZH[D.weekday], DOW_EN[D.weekday])}</div>
                  <div className="gg">{lunarLabel(D)} · {D.dayGanzhi}{L('日', '')}</div>
                </div>
              </div>
              {selActs.length > 0 && (
                <div className="a-facs">{(() => { const f = DV.perActivity[0] ? DV.perActivity[0].v.factors.filter(x => x.strong).slice(0, 3) : []; return f.length ? f.map((x, i) => <span key={i} className={'a-fac ' + (x.sign === '+' ? 'p' : 'm')}>{x.sign} {L(x.zh, x.en)}</span>) : <span className="a-fac">{L('无强因素', 'no strong factors')}</span>; })()}</div>
              )}
            </div>

            <div className="a-sheet-body" ref={refAccGroup}>
              {/* 事项裁断 */}
              {acc('acts', '事项裁断', 'Per-activity', selActs.length ? `${selActs.length}` : L('未选', 'none'),
                selActs.length === 0 ? <div className="a-note">{L('在「择日」选择事项后这里显示逐项裁断。', 'Select activities in the Find tab to see verdicts.')}</div> :
                  selActs.map(a => { const v = verdictForActivity(a, D, profile); return (
                    <div key={a.id} className="a-act">
                      <div style={{ flex: 1 }}><div className="an">{lang === 'en' ? a.en : a.zh}</div><div className="af">{v.factors.map((f, i) => <span key={i} style={{ color: f.sign === '+' ? 'var(--good)' : f.sign === '−' ? 'var(--bad)' : 'var(--ink-faint)' }}>{f.sign}{L(f.zh, f.en)}{f.grade === 'M' ? '·中' : ''}</span>)}</div></div>
                      <div className={'a-vbadge ' + colorClass(v.color)} style={{ flex: 'none' }}>{vIcon(v.color)} {lang === 'en' ? v.verdictEn : v.verdict}</div>
                    </div>
                  ); })
              )}

              {/* 丰富导出 (paid, WS-3) */}
              {acc('export', '丰富导出', 'Rich export', paid ? L('已解锁', 'unlocked') : L('升级', 'upgrade'), (
                <Gate paid={paid} lang={lang} onUpgrade={() => { setSelJDN(null); setSettingsOpen(true); }}>
                  {paid && exportPanel()}
                </Gate>
              ))}

              {/* 神煞 */}
              {acc('shensha', '神煞', 'Spirits', `${D.shensha.goodCount}吉/${D.shensha.badCount}凶`, (() => {
                const strong = []; if (D.officer === '破') strong.push(L('月破·诸吉难解', 'Month-Breaker')); if (D.shousi) strong.push(L('受死', 'Shou-Si')); if (D.siliSijue) strong.push(L(D.siliSijue.type, D.siliSijue.en)); if (D.yanggong) strong.push(L('杨公十三忌', 'Yang-Gong'));
                const gb = g => g === 'H' ? L('高', 'H') : L('中', 'M');
                return (<>
                  {strong.map((f, i) => <span key={'s' + i} className="a-pill bad">{f}</span>)}
                  {D.shensha.list.filter(s => s.type === 'good').map((s, i) => <span key={'g' + i} className="a-pill good">{L(s.zh, s.en)}<i className="a-grade-h">{gb(s.grade)}</i></span>)}
                  {D.shensha.list.filter(s => s.type === 'bad').map((s, i) => <span key={'b' + i} className="a-pill warn">{L(s.zh, s.en)}<i className="a-grade-m">{gb(s.grade)}</i></span>)}
                  {D.shensha.hasStrongJie && D.shensha.badCount > 0 && <span className="a-pill good">{L('吉神解凶', 'benefic dissolves ills')}</span>}
                  {!strong.length && !D.shensha.list.length && <span className="a-note">{L('无明显神煞', 'none notable')}</span>}
                  <div className="a-note" style={{ marginTop: '8px' }}>{L('高＝明确常见；中＝版本较多。低置信神煞已从评分略去。', 'H = well-established; M = variant. Low-confidence spirits omitted from scoring.')} {pop('ss', '神煞', 'Spirits', '吉神能在一定程度上化解凶煞（从神不从煞）；月破等极凶诸吉难解。本工具仅评分高/中置信项。', 'Benefics can offset 凶煞; Month-Breaker is not dissolvable. Only H/M-confidence spirits are scored.', 'ss')}</div>
                </>);
              })(), <i className="a-graded">{L('分级', 'graded')}</i>)}

              {/* 历法层 */}
              {acc('cal', '历法层', 'Calendar layers', `${D.officer}日·${D.god}`, (<>
                <div className="a-pillars" style={{ marginBottom: '10px' }}>
                  {[[L('年', 'Y'), D.yearGanzhi], [L('月', 'M'), D.monthGanzhi], [L('日', 'D'), D.dayGanzhi]].map((p, i) => <div key={i} className="a-pillar"><div className="cap">{p[0]}</div><div className="gz">{p[1]}</div></div>)}
                  <div className="a-pillar"><div className="cap">{L('纳音', 'NaYin')}</div><div className="gz" style={{ fontSize: '13px', paddingTop: '6px' }}>{D.nayin}</div></div>
                </div>
                <div className="a-kv"><span className="k">{L('值日神', 'Officer')}<span className="en">建除</span></span><span className="v"><b className="serif">{D.officer}{L('日', '')}</b> · {L(D.officerNote, D.officerNoteEn)}</span></div>
                <div className="a-kv"><span className="k">{L('黄道黑道', 'Yellow/Black')}</span><span className="v">{D.god} · {D.isYellow ? <span className="a-pill good">{L('黄道吉', 'Yellow')}</span> : <span className="a-pill warn">{L('黑道', 'Black')}</span>}</span></div>
                <div className="a-kv"><span className="k">{L('二十八宿', '28 Mansion')}</span><span className="v">{calMansion(D).name}{L('宿', '')} · {calMansion(D).animal} · {calMansion(D).seven}{L('曜', '')} {mansionSrc === 'animal' ? <span className="a-pill neutral">{L('演禽', 'animal')}</span> : (calMansion(D).good === true ? <span className="a-pill good">{L('吉', 'good')}</span> : calMansion(D).good === false ? <span className="a-pill warn">{L('凶', 'adverse')}</span> : <span className="a-pill neutral">{L('平', 'neutral')}</span>)}{mansionOffset !== 0 ? <span className="a-note"> {L(`（校准平移${mansionOffset}）`, `(cal +${mansionOffset})`)}</span> : null}</span></div>
                <div className="a-kv"><span className="k">{L('冲煞', 'Clash')}</span><span className="v">{L('冲', 'clash')}{D.clash.clashZodiac}（{STEMS[D.clash.clashStem] + BRANCHES[D.clash.clashBranch]}） · {L('煞', 'evil')}{D.clash.dir}{L('方', '')}{D.clashAges.ages.length ? <div className="a-note">{L('冲虚岁约', 'clashes ages ~')} {D.clashAges.ages.join('、')}</div> : null}</span></div>
                <div className="a-kv"><span className="k">{L('彭祖百忌', 'Pengzu')}</span><span className="v serif">{D.pengzuStem}；{D.pengzuBranch}</span></div>
                <div className="a-note" style={{ marginTop: '6px' }}><i className="a-exact">{L('精确', 'exact')}</i> {L('干支/纳音/冲为精确推算；', 'pillars/nayin/clash are exact;')} <i className="a-graded">{L('分级', 'graded')}</i> {L('建除→宜忌、宿断语为传统说法。', '建除→宜忌 & 宿 readings are traditional.')}</div>
              </>))}

              {/* 方位·吉时 */}
              {acc('dir', '方位·吉时', 'Directions · hours', dayDirections(D.dayStem).xishen, (<>
                <div className="a-kv"><span className="k">{L('喜神', 'Joy dir.')}</span><span className="v"><b>{dayDirections(D.dayStem).xishen}</b>（{DIR_EN[dayDirections(D.dayStem).xishen]}）</span></div>
                <div className="a-kv"><span className="k">{L('今日吉时', 'Lucky hours')}</span><span className="v">{D.hours.filter(h => h.isYellow).map(h => h.branchZh + L('时', '')).join('、') || '—'}</span></div>
                <div className="a-note" style={{ marginTop: '6px' }}>{L(DAYDIR_OMIT_ZH, DAYDIR_OMIT_EN)}</div>
              </>))}

              {/* 时辰 — three states (吉/平/忌) driven only by rankHours()'s signed weight */}
              {(() => {
                const hr = rankHours(D);
                const good = hr.rows.filter(r => hourClass(r.w).key === 'good').length;
                const avoid = hr.rows.filter(r => hourClass(r.w).key === 'avoid').length;
                return acc('hours', '十二时辰', '12 double-hours', `${good}吉/${avoid}忌`, (<>
                  <div className="a-hours">{hr.rows.map((h, i) => {
                    const hc = hourClass(h.w);
                    const pc = hc.key === 'good' ? 'good' : hc.key === 'avoid' ? 'bad' : 'neutral';
                    const reason = h.tags.map(t => t.sign + L(t.zh, t.en)).join(' · ');
                    return (
                      <div key={i} className={'a-hour ' + hc.key}>
                        <div className="htop">
                          <span className="hg">{h.branchZh}{L('时', '')}</span>
                          <span className="ht">{h.range}</span>
                          <span className="hsp" />
                          <span className={'a-pill ' + pc}>{L(hc.zh, hc.en)}</span>
                        </div>
                        <div className="hr">{reason}</div>
                      </div>
                    );
                  })}</div>
                  <div className="a-hours-legend">
                    <span className="a-pill good">{L('吉 宜', '吉 Favorable')}</span>
                    <span className="a-pill neutral">{L('平 中性', '平 Neutral')}</span>
                    <span className="a-pill bad">{L('忌 冲日支/黑道', '忌 Avoid (clash/black-path)')}</span>
                  </div>
                  <div className="a-note" style={{ marginTop: '8px' }}>{L('时辰按精确规则排序（时之黄道/黑道 + 时支冲合日支）；时家神煞未纳入。', 'Hours ranked by exact rules (hour path-god + hour-vs-day branch); hour-family spirits omitted.')} {pop('zeshi', '择时', 'Hour ranking', '按时之黄道/黑道与时支冲合日支排序（皆精确规则）；时家神煞（日禄、天乙贵人、喜神时等）版本繁多，未纳入。', 'Ranked by the hour path-god and hour-vs-day branch relations (exact rules); hour-family spirits (day-lu, noble-person, joy hours) vary by edition and are omitted.', 'zeshi')}</div>
                </>));
              })()}

              {/* 专项模块 */}
              {isMarriage && acc('marry', '嫁娶专项', 'Marriage', '', (() => { const ml = brideBranch >= 0 ? marriageMonthLuck(brideBranch, D.lunar.monthNum) : null; const sn = sanniang(D.lunar.day); const rel = D.shensha.list.filter(s => ['月厌', '往亡', '八专', '上朔'].includes(s.key)); return (<>
                {ml ? <div className="a-kv"><span className="k">{L('大利月', 'Lucky month')}<span className="en">女命{ZODIAC[brideBranch]}</span></span><span className="v"><span className={'a-pill ' + (ml.level === 'big' ? 'good' : ml.level === 'small' ? 'warn' : 'bad')}>{L(ml.zh, ml.en)}</span></span></div> : <div className="a-note">{L('在「工具」无女命生肖入口；可在设置链接里带 br。选女命生肖后显示大利月。', 'Set bride zodiac to show 大利月.')}</div>}
                <div className="a-kv"><span className="k">{L('三娘煞', '三娘煞')}</span><span className="v">{sn ? <span className="a-pill bad">{L('值三娘煞·忌嫁娶', '三娘煞 — avoid')}</span> : <span className="a-pill good">{L('非三娘煞', 'clear')}</span>}</span></div>
                <div className="a-kv"><span className="k">{L('相关神煞', 'Relevant')}</span><span className="v">{rel.length ? rel.map((s, i) => <span key={i} className="a-pill warn">{L(s.zh, s.en)}</span>) : <span className="a-note">{L('无', 'none')}</span>}</span></div>
                <div className="a-note" style={{ marginTop: '6px' }}>{L(MARRIAGE_OMIT_ZH, MARRIAGE_OMIT_EN)}</div>
              </>); })())}
              {isBurial && acc('bury', '安葬专项', 'Burial', '', (() => { const cs = chongSangDay(D.monthBranch, D.dayStem); const cr = D.dayBranch === 5 || D.dayBranch === 11; const fr = D.shensha.list.find(s => s.key === '复日'); return (<>
                <div className="a-kv"><span className="k">{L('重丧', '重丧')}</span><span className="v">{cs ? <span className="a-pill bad">{L('值重丧日·忌安葬', '重丧 — avoid')}</span> : <span className="a-pill good">{L('非重丧', 'clear')}</span>}</span></div>
                <div className="a-kv"><span className="k">{L('重日', 'Double Day')}</span><span className="v">{cr ? <span className="a-pill bad">{L('值重日·忌丧葬', '重日 — avoid')}</span> : <span className="a-pill good">{L('非重日', 'clear')}</span>}</span></div>
                <div className="a-kv"><span className="k">{L('复日', '复日')}</span><span className="v">{fr ? <span className="a-pill warn">{L('复日', '复日')}</span> : <span className="a-note">{L('无', 'none')}</span>}</span></div>
                <div className="a-note" style={{ marginTop: '6px' }}>{L(BURIAL_OMIT_ZH, BURIAL_OMIT_EN)}</div>
              </>); })())}

              {/* 神煞校对 */}
              {acc('sscal', '神煞校对', 'Calibrate vs almanac', '', (<>
                <div className="a-note" style={{ marginBottom: '6px' }}>{L('粘贴你通书该日的神煞，比对异同（仅比对，不改引擎）。', "Paste your almanac's 神煞 for this day to diff (compare only).")}</div>
                <textarea className="a-in" placeholder={L('例：天德 月德 月破 往亡', 'e.g. 天德 月德 月破')} value={ssCal[selJDN] || ''} onChange={e => setSsCal(s => ({ ...s, [selJDN]: e.target.value }))} />
                {ssCal[selJDN] && (() => { const txt = ssCal[selJDN]; const names = [...D.shensha.list.map(s => s.zh.replace(/[·].*$/, '')), ...(D.officer === '破' ? ['月破'] : []), ...(D.shousi ? ['受死'] : []), ...(D.yanggong ? ['杨公'] : [])]; const matched = names.filter(n => txt.includes(n)); const only = names.filter(n => !txt.includes(n)); return <div className="a-cmp" style={{ marginTop: '8px' }}><div className="box"><div className="lab">{L('一致', 'Agree')}</div><div className="serif">{matched.join('、') || L('（无）', '(none)')}</div></div><div className="box"><div className="lab">{L('仅本工具', 'Tool only')}</div><div className="serif">{only.join('、') || L('（无）', '(none)')}</div></div></div>; })()}
              </>))}

              {/* 对照 */}
              {acc('compare', '对照通书', 'Cross-check', '', (<>
                <div className="a-note" style={{ marginBottom: '6px' }}>{L('可把你通书该日的宜忌粘贴于此，便于人工对照。', 'Paste your almanac\'s 宜/忌 for this day for manual comparison.')}</div>
                <textarea className="a-in" placeholder={L('宜：… 忌：…', '宜: … 忌: …')} value={enrich[selJDN] || ''} onChange={e => setEnrich(s => ({ ...s, [selJDN]: e.target.value }))} />
              </>))}

              <div className="a-disc">{L('本页为推算估计，非定论。婚丧、动土、开业等大事请以纸本通书或择日师为准。', 'This is a computed estimate, not definitive. For weighty matters confirm with a printed almanac or a specialist.')}</div>
            </div>
          </div>
        </>
      )}

      {/* ===================== SETTINGS ===================== */}
      {settingsOpen && (
        <>
          <div className="a-scrim" onClick={() => setSettingsOpen(false)} />
          <div className="a-sheet settings" role="dialog" aria-modal="true" aria-label={L('设置', 'Settings')}>
            <div className="a-handle" />
            <div className="a-sheet-head"><div className="a-glance"><div className="gg" style={{ fontSize: '18px' }}>{L('设置', 'Settings')}</div></div><div className="a-sheet-nav"><button className="a-iconbtn" aria-label="close" onClick={() => setSettingsOpen(false)}>×</button></div></div>
            <div className="a-sheet-body">
              <div className="a-field"><label>{L('语言', 'Language')}</label><div className="a-seg"><button className={lang === 'zh' ? 'on' : ''} onClick={() => setLang('zh')}>中文</button><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button><button className={lang === 'both' ? 'on' : ''} onClick={() => setLang('both')}>中/EN</button></div></div>
              <div className="a-field"><label>{L('主题', 'Theme')}</label><div className="a-seg"><button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>{L('浅', 'Light')}</button><button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>{L('深', 'Dark')}</button><button className={theme === 'contrast' ? 'on' : ''} onClick={() => setTheme('contrast')}>{L('高对比', 'Contrast')}</button><button className={theme === 'red' ? 'on' : ''} onClick={() => setTheme('red')}>{L('红运', 'Red')}</button></div></div>
              <div className="a-field"><label>{L('评分取向', 'Scoring profile')} <span className="gloss">{L('从严↔从宽', 'strict↔lenient')}</span></label><div className="a-seg"><button className={profile === 'strict' ? 'on' : ''} onClick={() => setProfile('strict')}>{L('从严', 'Strict')}</button><button className={profile === 'standard' ? 'on' : ''} onClick={() => setProfile('standard')}>{L('标准', 'Std')}</button><button className={profile === 'lenient' ? 'on' : ''} onClick={() => setProfile('lenient')}>{L('从宽', 'Lenient')}</button></div></div>
              <div className="a-field"><label>{L('时区（真太阳时）', 'Timezone (true solar time)')}</label><select className="a-in" value={tzKey} onChange={e => setTzKey(e.target.value)}>{Object.keys(TZ_PRESETS).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}</select></div>
              <div className="a-field"><label>{L('女命生肖（嫁娶大利月）', "Bride's zodiac")}</label><select className="a-in" value={brideBranch} onChange={e => setBrideBranch(+e.target.value)}><option value={-1}>{L('未选', 'unset')}</option>{ZODIAC.map((z, i) => <option key={i} value={i}>{z}</option>)}</select></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', fontSize: '14px' }}><input type="checkbox" checked={lateZi} onChange={e => setLateZi(e.target.checked)} /><span>{L('晚子时换日（23:00 起算次日 · 八字）', 'Late-子 day boundary (23:00 · BaZi)')}</span></label>
              <div className="a-note">{L('影响 23:00–01:00 出生者的八字日柱；日历日值仍按民用日。所有设置仅存于当前会话，并编码进可分享链接。', 'Affects the BaZi day pillar for late-night births; calendar days stay civil. Settings live in this session and the shareable URL only.')}</div>

              <div className="a-field" style={{ marginTop: '14px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                <label>{L('升级 / 许可证', 'Upgrade / Licence')} <span className="gloss">{L('解锁丰富导出与解读', 'unlock rich export & explanation')}</span></label>
                {paid ? (
                  <div className="a-note" style={{ color: 'var(--good)' }}>{L('已解锁', 'Unlocked')} · {licence && licence.tier === 'lifetime' ? L('永久', 'Lifetime') : L('年度', 'Annual')} <button className="a-btn-ghost" style={{ marginLeft: '10px', minHeight: '32px' }} onClick={removeLicence}>{L('移除', 'Remove')}</button></div>
                ) : (<>
                  <div className="a-note" style={{ marginBottom: '6px' }}>{L('购买后把许可证密钥粘贴于此解锁；计算与全部学习内容永远免费。', 'After purchase, paste your licence key here to unlock; the calculator and all learning stay free forever.')}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input className="a-in" value={licKey} onChange={e => setLicKey(e.target.value)} placeholder={L('许可证密钥', 'Licence key')} aria-label={L('许可证密钥', 'Licence key')} />
                    <button className="a-btn-ghost" disabled={licBusy || !licKey.trim()} onClick={doValidate}>{licBusy ? '…' : L('验证', 'Verify')}</button>
                  </div>
                  {licMsg && <div className="a-note" style={{ marginTop: '6px', color: licMsg.ok ? 'var(--good)' : 'var(--bad)' }}>{licMsg.text}</div>}
                  <div className="a-chips" style={{ marginTop: '8px' }}>
                    <a className="a-chip" href={CHECKOUT.annual || '#'} target="_blank" rel="noopener">{L('年度 US$8/年', 'Annual US$8/yr')}</a>
                    <a className="a-chip" href={CHECKOUT.lifetime || '#'} target="_blank" rel="noopener">{L('永久 US$88', 'Lifetime US$88')}</a>
                  </div>
                  {!WORKER_URL && <div className="a-note" style={{ marginTop: '6px' }}>{L('（验证服务尚未配置——见 worker/README.md）', '(Verifier not configured yet — see worker/README.md)')}</div>}
                </>)}
              </div>
              <button className="a-btn-ghost" style={{ width: '100%', marginTop: '14px', minHeight: '46px' }} onClick={() => { setSettingsOpen(false); setTimeout(() => goTour(0), 120); }}>{L('重看使用教程', 'Take the tour again')}</button>
              <button className="a-btn" style={{ marginTop: '10px' }} onClick={() => setSettingsOpen(false)}>{L('完成', 'Done')}</button>
            </div>
          </div>
        </>
      )}
      {/* ===================== TUTORIAL ===================== */}
      {tourStep >= 0 && (() => {
        const step = TOUR[tourStep]; const r = tourRect;
        const vw = (typeof window !== 'undefined' ? window.innerWidth : 400);
        const vh = (typeof window !== 'undefined' ? window.innerHeight : 800);
        const W = Math.min(320, vw - 28);
        let coachStyle = {}, coachClass = 'a-coach';
        if (r) {
          const left = Math.max(14, Math.min(r.left, vw - W - 14));
          const below = r.top + r.height + 14;
          if (below + 180 < vh) coachStyle = { top: below + 'px', left: left + 'px' };
          else coachStyle = { top: Math.max(14, r.top - 190) + 'px', left: left + 'px' };
        } else coachClass += ' center';
        const last = tourStep === TOUR.length - 1;
        return (
          <div className="a-tourveil" style={r ? {} : { background: 'var(--scrim)' }}>
            {r && <div className="a-spot" style={{ top: (r.top - 6) + 'px', left: (r.left - 6) + 'px', width: (r.width + 12) + 'px', height: (r.height + 12) + 'px' }} />}
            <div className={coachClass} style={coachStyle} role="dialog" aria-modal="true" aria-label={L('使用教程', 'Tutorial')}>
              <div className="step">{L('教程', 'Tour')} · {tourStep + 1}/{TOUR.length}</div>
              <h4>{L(step.t[0], step.t[1])}</h4>
              <p aria-live="polite">{L(step.d[0], step.d[1])}</p>
              <div className="row">
                <div className="dots">{TOUR.map((_, i) => <i key={i} className={i === tourStep ? 'on' : ''} />)}</div>
                <button className="skip" onClick={() => goTour(-1)}>{L('跳过', 'Skip')}</button>
                <div className="nav">
                  {tourStep > 0 && <button className="back" onClick={() => goTour(tourStep - 1)}>{L('上一步', 'Back')}</button>}
                  <button className="next" onClick={() => goTour(tourStep + 1)}>{last ? L('完成', 'Done') : L('下一步', 'Next')}</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
