import { themeCSS } from './design/theme.js';

const CSS = themeCSS() + `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
.a-root{
  --font-serif:"Songti SC","Noto Serif SC","Source Han Serif SC",STSong,SimSun,serif;
  --font-sans:system-ui,-apple-system,"PingFang SC","Hiragino Sans GB","Noto Sans SC",sans-serif;
  --font-mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --r1:8px; --r2:12px; --r3:18px; --tab-h:60px; --bar-h:54px;
  background:var(--bg); color:var(--ink);
  font-family:var(--font-sans); font-size:16px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}

.a-app{max-width:540px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;
  display:flex;flex-direction:column;border-left:1px solid var(--line);border-right:1px solid var(--line);}
@media (max-width:560px){.a-app{border:0;}}

/* top bar */
.a-bar{position:sticky;top:0;z-index:30;height:var(--bar-h);display:flex;align-items:center;
  gap:10px;padding:0 14px;background:color-mix(in srgb,var(--surface) 88%,transparent);
  backdrop-filter:saturate(1.4) blur(8px);border-bottom:1px solid var(--line);}
.a-bar .seal{width:30px;height:30px;border-radius:7px;background:var(--seal);color:var(--on-seal);
  display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:18px;flex:none;}
.a-bar .ttl{font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:.04em;}
.a-bar .sub{font-size:10px;color:var(--ink-faint);letter-spacing:.18em;text-transform:uppercase;}
.a-bar .sp{flex:1;}
.a-iconbtn{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--surface);
  color:var(--ink-soft);font-size:17px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;}
.a-iconbtn:active{background:var(--surface-pressed);}

/* screen scroll area */
.a-screen{flex:1;overflow-y:auto;padding:16px 14px calc(var(--tab-h) + 24px);}
.a-h1{font-family:var(--font-serif);font-size:22px;font-weight:700;margin:2px 0 2px;}
.a-lede{font-size:13px;color:var(--ink-soft);margin:0 0 16px;}
.a-sec{font-family:var(--font-serif);font-size:15px;font-weight:700;margin:20px 0 8px;display:flex;align-items:center;gap:8px;}
.a-sec .en{font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);font-weight:400;letter-spacing:.04em;}

.a-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);padding:14px;box-shadow:var(--sh);}
.a-card + .a-card{margin-top:10px;}

/* chips / segmented */
.a-chips{display:flex;flex-wrap:wrap;gap:8px;}
.a-chip{min-height:38px;padding:8px 12px;border-radius:999px;border:1px solid var(--line-2);
  background:var(--surface);color:var(--ink-soft);font-size:13px;cursor:pointer;display:inline-flex;
  align-items:center;gap:5px;transition:background .12s,color .12s,border-color .12s;}
.a-chip:active{transform:scale(.97);background:var(--surface-pressed);}
@media (hover:hover){.a-chip:not(.on):hover{background:var(--surface-hover);}}
.a-chip.on{background:var(--seal);border-color:var(--seal-deep);color:var(--on-seal);}
.a-chip.on:active{background:var(--seal-pressed);}
.a-chip .x{font-size:14px;opacity:.85;}
.a-seg{display:inline-flex;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:3px;gap:2px;}
.a-seg button{min-height:34px;padding:6px 12px;border:0;background:transparent;color:var(--ink-soft);
  border-radius:7px;font-size:13px;cursor:pointer;font-family:var(--font-sans);}
.a-seg button.on{background:var(--surface);color:var(--ink);box-shadow:var(--sh);font-weight:600;}

/* buttons */
.a-btn{min-height:46px;width:100%;border:0;border-radius:var(--r2);background:var(--seal);color:var(--on-seal);
  font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font-sans);}
.a-btn:active{background:var(--seal-pressed);}
@media (hover:hover){.a-btn:hover{background:var(--seal-deep);}}
.a-btn-ghost{min-height:42px;padding:0 14px;border:1px solid var(--line-2);border-radius:var(--r1);
  background:var(--surface);color:var(--ink-soft);font-size:13px;cursor:pointer;}
.a-btn-ghost:active{background:var(--surface-pressed);}
@media (hover:hover){.a-btn-ghost:hover{background:var(--surface-hover);}}

/* fields */
.a-field{margin-bottom:14px;}
.a-field > label{display:block;font-size:12px;color:var(--ink-soft);margin-bottom:6px;font-weight:600;}
.a-field .gloss{color:var(--ink-faint);font-weight:400;}
.a-in,input[type="date"].a-in,input[type="time"].a-in,select.a-in{
  width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--line-strong);border-radius:var(--r1);
  background:var(--surface);color:var(--ink);font-size:15px;font-family:var(--font-sans);}
.a-in:focus,select.a-in:focus{outline:2px solid var(--seal);outline-offset:1px;}
.a-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
textarea.a-in{min-height:64px;resize:vertical;line-height:1.5;}
.a-note{font-size:11.5px;color:var(--ink-faint);line-height:1.55;}

/* verdict tokens */
.a-vbadge{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-serif);font-weight:800;border-radius:999px;padding:3px 12px;font-size:14px;line-height:1.4;}
.v-good .a-vbadge,.a-vbadge.v-good{background:var(--good-soft);color:var(--good);}
.v-bad .a-vbadge,.a-vbadge.v-bad{background:var(--bad-soft);color:var(--bad);}
.v-amber .a-vbadge,.a-vbadge.v-amber{background:var(--warn-soft);color:var(--warn);}
.v-grey .a-vbadge,.a-vbadge.v-grey{background:var(--grey-soft);color:var(--grey);}

/* ranked date card */
.a-dcard{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;width:100%;
  text-align:left;background:var(--surface);border:1px solid var(--line);border-left-width:4px;
  border-radius:var(--r2);padding:12px 14px;cursor:pointer;margin-bottom:8px;font-family:var(--font-sans);}
.a-dcard:active{background:var(--surface-pressed);}
@media (hover:hover){.a-dcard:hover{background:var(--surface-hover);}}
.a-dcard.v-good{border-left-color:var(--good);}
.a-dcard.v-bad{border-left-color:var(--bad);}
.a-dcard.v-amber{border-left-color:var(--warn);}
.a-dcard.v-grey{border-left-color:var(--line-2);}
.a-dcard .dn{font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--ink);line-height:1;}
.a-dcard .dw{font-size:10px;color:var(--ink-faint);margin-top:3px;}
.a-dcard .dm{min-width:0;}
.a-dcard .dl{font-family:var(--font-serif);font-size:14px;color:var(--ink);}
.a-dcard .dr{font-size:11.5px;color:var(--ink-soft);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.a-dcard .dz{font-size:10.5px;color:var(--ink-faint);margin-top:2px;}
.a-flag{display:inline-block;font-size:10px;font-weight:700;color:var(--bad);background:var(--bad-soft);border-radius:5px;padding:0 5px;margin-left:4px;}

/* annual band + ribbon */
.a-annual{display:flex;flex-wrap:wrap;align-items:center;gap:5px 12px;padding:10px 12px;border-radius:var(--r2);
  background:var(--surface-2);border:1px solid var(--line);font-size:12px;color:var(--ink-soft);margin-bottom:10px;}
.a-annual .yr{font-family:var(--font-serif);font-weight:700;color:var(--ink);}
.a-annual b{color:var(--seal);}
.a-annual .note{flex-basis:100%;font-size:10.5px;color:var(--ink-faint);}
.a-ribbon{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 12px;border-radius:var(--r2);
  background:linear-gradient(90deg,var(--good-soft),var(--surface));border:1px solid var(--line);
  font-size:12px;color:var(--ink-soft);margin-bottom:10px;}
.a-ribbon b{color:var(--good);font-family:var(--font-serif);}
.a-ribbon .trk{flex:1 1 80px;min-width:80px;height:6px;background:var(--surface);border:1px solid var(--line);border-radius:999px;overflow:hidden;}
.a-ribbon .trk i{display:block;height:100%;background:var(--good);}

/* calendar */
.a-calnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.a-calnav .t{font-family:var(--font-serif);font-size:17px;font-weight:700;}
.a-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.a-cal .dow{text-align:center;font-size:10px;color:var(--ink-faint);padding:2px 0;}
.a-cell{aspect-ratio:1/1;border:1px solid var(--line);border-radius:9px;background:var(--surface);
  padding:3px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;cursor:pointer;position:relative;min-height:42px;}
.a-cell:active{background:var(--surface-pressed);}
.a-cell.out{opacity:.32;}
.a-cell.today{outline:2px solid var(--seal);outline-offset:-2px;}
.a-cell .g{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--ink);line-height:1.1;margin-top:1px;}
.a-cell .l{font-size:8.5px;color:var(--ink-faint);line-height:1;}
.a-cell .dot{position:absolute;bottom:3px;width:6px;height:6px;border-radius:50%;}
.a-cell .dot.v-good{background:var(--good);} .a-cell .dot.v-bad{background:var(--bad);}
.a-cell .dot.v-amber{background:var(--warn);} .a-cell .dot.v-grey{background:var(--line-2);}
/* find heat-strip: verdict tint + glyph (colour is never the only cue) */
.a-cell.tint{justify-content:center;gap:1px;}
.a-cell.tint .vg{font-size:13px;font-weight:700;line-height:1;}
.a-cell.tint.v-good{background:var(--good-soft);border-color:var(--good);}
.a-cell.tint.v-good .vg{color:var(--good);}
.a-cell.tint.v-bad{background:var(--bad-soft);border-color:var(--bad);}
.a-cell.tint.v-bad .vg{color:var(--bad);}
.a-cell.tint.v-amber{background:var(--warn-soft);border-color:var(--warn);}
.a-cell.tint.v-amber .vg{color:var(--warn);}
.a-cell.tint.v-grey{background:var(--neutral-soft);}
.a-cell.tint.v-grey .vg{color:var(--ink-faint);}
.a-cell .cf{position:absolute;top:2px;right:3px;font-size:9px;line-height:1;}
.a-hint{text-align:center;font-size:10.5px;color:var(--ink-faint);margin-top:8px;}

/* tags */
.a-exact,.a-graded{display:inline-block;font-size:9px;font-weight:700;padding:1px 6px;border-radius:999px;
  font-family:var(--font-mono);vertical-align:middle;letter-spacing:.02em;}
.a-exact{background:var(--good-soft);color:var(--good);}
.a-graded{background:var(--warn-soft);color:var(--warn);}
.a-grade-h,.a-grade-m{font-style:normal;font-size:8px;font-weight:700;font-family:var(--font-mono);
  vertical-align:super;margin-left:1px;opacity:.8;}

/* bottom tabs */
.a-tabs{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:100%;max-width:540px;
  height:var(--tab-h);display:grid;grid-template-columns:repeat(5,1fr);
  background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(10px);
  border-top:1px solid var(--line);z-index:40;padding-bottom:env(safe-area-inset-bottom,0);}
.a-tab{border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:3px;cursor:pointer;color:var(--ink-faint);font-family:var(--font-sans);}
.a-tab .ic{font-size:19px;line-height:1;}
.a-tab .tl{font-size:10px;}
.a-tab.on{color:var(--seal);}
.a-tab.on .ic{transform:translateY(-1px);}

/* bottom sheet */
.a-scrim{position:fixed;inset:0;background:var(--scrim);z-index:50;animation:afade .18s ease;}
.a-sheet{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:100%;max-width:540px;height:90vh;
  background:var(--surface);border-radius:18px 18px 0 0;z-index:51;display:flex;flex-direction:column;
  box-shadow:var(--sh2);animation:aslide .24s cubic-bezier(.2,.8,.2,1);}
.a-sheet.settings{height:auto;max-height:88vh;}
@keyframes afade{from{opacity:0}to{opacity:1}}
@keyframes aslide{from{transform:translate(-50%,100%)}to{transform:translate(-50%,0)}}
.a-handle{width:40px;height:4px;border-radius:999px;background:var(--line-2);margin:8px auto 4px;flex:none;}
.a-sheet-head{padding:6px 16px 12px;border-bottom:1px solid var(--line);flex:none;position:relative;}
.a-sheet-nav{position:absolute;right:10px;top:2px;display:flex;gap:6px;}
.a-sheet-body{overflow-y:auto;padding:14px 16px calc(env(safe-area-inset-bottom,0) + 20px);}

/* glance header */
.a-glance{display:flex;align-items:center;gap:14px;}
.a-glance .gv{font-family:var(--font-serif);font-size:30px;font-weight:800;line-height:1;white-space:nowrap;}
.a-glance.v-good .gv{color:var(--good);} .a-glance.v-bad .gv{color:var(--bad);}
.a-glance.v-amber .gv{color:var(--warn);} .a-glance.v-grey .gv{color:var(--grey);}
.a-glance .gd{font-family:var(--font-mono);font-size:13px;color:var(--ink-soft);}
.a-glance .gg{font-family:var(--font-serif);font-size:20px;color:var(--ink);margin-top:1px;}
.a-facs{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
.a-fac{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--surface-2);border:1px solid var(--line);}
.a-fac.p{color:var(--good);} .a-fac.m{color:var(--bad);}

/* accordion */
.a-acc{border:1px solid var(--line);border-radius:var(--r2);margin-top:8px;overflow:hidden;background:var(--surface);}
.a-acc-h{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px 14px;
  border:0;background:transparent;cursor:pointer;font-family:var(--font-sans);color:var(--ink);font-size:14px;text-align:left;}
.a-acc-h .lab{font-family:var(--font-serif);font-weight:700;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.a-acc-h .cv{font-size:11px;color:var(--ink-faint);font-family:var(--font-sans);font-weight:400;}
.a-acc-h .ch{color:var(--ink-faint);font-size:13px;transition:transform .15s;}
.a-acc.open .a-acc-h .ch{transform:rotate(90deg);}
.a-acc-body{padding:0 14px 14px;}

/* data rows */
.a-kv{display:grid;grid-template-columns:104px 1fr;gap:8px;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px;}
.a-kv:first-child{border-top:0;}
.a-kv .k{color:var(--ink-soft);font-size:12px;}
.a-kv .k .en{display:block;font-family:var(--font-mono);font-size:9px;color:var(--ink-faint);}
.a-kv .v{color:var(--ink);}
.a-pill{display:inline-block;font-size:11px;border-radius:6px;padding:1px 7px;margin:0 4px 3px 0;}
.a-pill.good{background:var(--good-soft);color:var(--good);}
.a-pill.bad{background:var(--bad-soft);color:var(--bad);}
.a-pill.warn{background:var(--warn-soft);color:var(--warn);}
.a-pill.neutral{background:var(--surface-2);color:var(--ink-soft);}
.mono{font-family:var(--font-mono);}
.serif{font-family:var(--font-serif);}

/* per-activity verdict line */
.a-act{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line);}
.a-act:first-child{border-top:0;}
.a-act .an{font-family:var(--font-serif);font-size:14px;}
.a-act .ae{font-size:10px;color:var(--ink-faint);}
.a-act .af{font-size:11px;color:var(--ink-soft);margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;}

/* four pillars */
.a-pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;}
.a-pillar{background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r1);padding:8px 4px;}
.a-pillar .cap{font-size:10px;color:var(--ink-faint);}
.a-pillar .gz{font-family:var(--font-serif);font-size:22px;font-weight:700;color:var(--seal);line-height:1.1;margin-top:3px;}
.a-pillar .ny{font-size:9px;color:var(--ink-faint);margin-top:2px;}

/* five-element bars */
.a-bars{display:flex;flex-direction:column;gap:5px;}
.a-bar{display:grid;grid-template-columns:48px 1fr 30px;align-items:center;gap:8px;font-size:12px;}
.a-bar .bl{font-family:var(--font-serif);color:var(--ink-soft);}
.a-bar .bt{height:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:999px;overflow:hidden;}
.a-bar .bt i{display:block;height:100%;background:linear-gradient(90deg,var(--good),var(--warn));}
.a-bar .bn{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);text-align:right;}

/* hours grid — three-state (吉/平/忌), driven by rankHours weight */
.a-hours{display:flex;flex-direction:column;gap:6px;}
.a-hour{padding:8px 10px;border:1px solid var(--line);border-left-width:3px;border-radius:var(--r1);font-size:12px;background:var(--surface);}
.a-hour.good{border-left-color:var(--good);}
.a-hour.neutral{border-left-color:var(--line-2);}
.a-hour.avoid{border-left-color:var(--bad);}
.a-hour .htop{display:flex;align-items:center;gap:8px;}
.a-hour .hg{font-family:var(--font-serif);}
.a-hour .ht{font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);}
.a-hour .hsp{flex:1;}
.a-hour .hr{font-size:11px;color:var(--ink-soft);line-height:1.5;margin-top:4px;}
.a-hours-legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}

/* compare boxes */
.a-cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.a-cmp .box{border:1px solid var(--line);border-radius:var(--r1);padding:9px;background:var(--surface-2);}
.a-cmp .box .lab{font-size:10px;color:var(--ink-faint);margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;}

/* accuracy */
.a-accg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;}
.a-accc{display:flex;justify-content:space-between;gap:8px;padding:6px 9px;background:var(--surface-2);border:1px solid var(--line);border-radius:7px;font-size:12px;}
.a-accc .nm{font-family:var(--font-serif);}
.a-accc .dt{font-family:var(--font-mono);font-size:10.5px;color:var(--ink-soft);}
.a-acct{width:100%;border-collapse:collapse;font-size:12px;}
.a-acct th{text-align:left;padding:6px 8px;border-bottom:2px solid var(--line-2);font-family:var(--font-serif);color:var(--ink-soft);}
.a-acct td{padding:6px 8px;border-bottom:1px solid var(--line);font-family:var(--font-mono);font-size:11px;}

/* self-test */
.a-test{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line);font-size:12.5px;}
.a-test:first-child{border-top:0;}
.a-test .dot{width:7px;height:7px;border-radius:50%;flex:none;}
.a-test .dot.ok{background:var(--good);} .a-test .dot.no{background:var(--bad);}
.a-test .got{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}

/* popover */
.a-popwrap{position:relative;display:inline-block;}
.a-popbtn{border:0;background:var(--surface-2);color:var(--ink-soft);width:18px;height:18px;border-radius:50%;
  font-size:11px;cursor:pointer;line-height:1;padding:0;font-family:var(--font-serif);}
.a-pop{position:absolute;z-index:60;left:0;top:22px;width:240px;background:var(--surface);border:1px solid var(--line-2);
  border-radius:var(--r1);padding:10px;box-shadow:var(--sh);font-size:12px;color:var(--ink-soft);line-height:1.5;}
.a-pop .pt{font-family:var(--font-serif);color:var(--ink);font-weight:700;margin-bottom:3px;}

/* onboarding */
.a-onb{background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);padding:16px;box-shadow:var(--sh);margin-bottom:14px;}
.a-onb h3{font-family:var(--font-serif);font-size:16px;margin:0 0 8px;}
.a-onb ol{margin:0 0 12px;padding-left:18px;font-size:13px;color:var(--ink-soft);line-height:1.7;}
.a-onb .ex{background:var(--surface-2);border-radius:var(--r1);padding:10px;font-size:12.5px;margin-bottom:12px;}

.a-disc{font-size:11px;color:var(--ink-faint);text-align:center;padding:10px 0 0;line-height:1.5;}
.a-empty{text-align:center;color:var(--ink-faint);font-size:13px;padding:30px 10px;}

@media (prefers-reduced-motion:reduce){
  .a-scrim,.a-sheet{animation:none;}
  .a-chip,.a-acc-h .ch,.a-spot{transition:none;}
}

/* print one-day sheet */
.a-print{display:none;}
@media print{
  .a-app,.a-tabs,.a-scrim,.a-sheet,.a-bar{display:none !important;}
  .a-print{display:block;color:#000;font-family:var(--font-serif);padding:6px;}
  .a-print h2{font-size:18px;margin:0 0 4px;}
  .a-print .pd{font-size:13px;color:#333;margin-bottom:10px;}
  .a-print table{width:100%;border-collapse:collapse;margin-bottom:10px;}
  .a-print th{text-align:left;width:62px;vertical-align:top;padding:3px 8px 3px 0;border-bottom:1px solid #ddd;}
  .a-print td{padding:3px 0;border-bottom:1px solid #eee;font-size:12.5px;}
  .a-print .pf{font-size:10px;color:#666;margin-top:8px;}
}

/* focus ring (a11y) */
.a-root :focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:4px;}

/* desktop: wider app + side-docked day panel (two-pane) */
@media (min-width:768px){
  .a-app{max-width:600px;}
  .a-screen{padding-left:18px;padding-right:18px;}
}
@media (min-width:980px){
  .a-root[data-sheet="1"] .a-app{margin-right:480px;transition:margin-right .2s ease;}
  .a-root[data-sheet="1"] .a-scrim{display:none;}
  .a-root[data-sheet="1"] .a-sheet{left:auto;right:0;transform:none;width:480px;height:100vh;
    border-radius:0;border-left:1px solid var(--line);box-shadow:-8px 0 24px rgba(40,30,20,.10);animation:none;}
  .a-root[data-sheet="1"] .a-sheet .a-handle{display:none;}
}
@media (min-width:980px) and (prefers-reduced-motion:no-preference){
  .a-root[data-sheet="1"] .a-sheet{animation:aslideR .22s ease;}
  @keyframes aslideR{from{transform:translateX(40px);opacity:.4}to{transform:translateX(0);opacity:1}}
}

/* ===== coachmark / onboarding tour ===== */
.a-tourveil{position:fixed;inset:0;z-index:80;}
.a-spot{position:fixed;z-index:81;border-radius:12px;box-shadow:0 0 0 9999px var(--scrim);
  outline:2px solid var(--seal);outline-offset:3px;pointer-events:none;transition:all .22s cubic-bezier(.2,.8,.2,1);}
.a-coach{position:fixed;z-index:82;width:min(320px,calc(100vw - 28px));background:var(--surface);
  border:1px solid var(--line-2);border-radius:var(--r2);box-shadow:var(--sh);padding:16px;}
.a-coach .step{font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);letter-spacing:.1em;text-transform:uppercase;}
.a-coach h4{font-family:var(--font-serif);font-size:17px;margin:4px 0 6px;}
.a-coach p{font-size:13px;color:var(--ink-soft);margin:0 0 14px;line-height:1.55;}
.a-coach .row{display:flex;align-items:center;gap:8px;}
.a-coach .dots{display:flex;gap:5px;flex:1;}
.a-coach .dots i{width:6px;height:6px;border-radius:50%;background:var(--line-2);}
.a-coach .dots i.on{background:var(--seal);}
.a-coach .skip{border:0;background:transparent;color:var(--ink-faint);font-size:12px;cursor:pointer;padding:6px;}
.a-coach .nav{display:flex;gap:6px;}
.a-coach .nav button{min-height:38px;padding:0 14px;border-radius:var(--r1);font-size:13px;cursor:pointer;font-family:var(--font-sans);}
.a-coach .nav .back{border:1px solid var(--line-2);background:var(--surface);color:var(--ink-soft);}
.a-coach .nav .next{border:0;background:var(--seal);color:var(--on-seal);font-weight:600;}
.a-coach.center{left:50%;top:50%;transform:translate(-50%,-50%);}
/* ---- learn tab ---- */
.a-ql{margin:0;padding-left:18px;display:grid;gap:6px;font-size:13px;color:var(--ink);}
.a-ql li{line-height:1.55;}
.a-hist-p{margin:6px 0;font-size:13px;line-height:1.65;color:var(--ink);}
.a-gl-row{display:grid;grid-template-columns:88px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px;}
.a-gl-row:last-child{border-bottom:0;}
.a-gl-k{color:var(--ink);font-family:var(--font-serif);}
.a-gl-d{color:var(--ink-soft);line-height:1.55;}
.a-gq{width:100%;box-sizing:border-box;margin:6px 0 8px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink);font-size:14px;font-family:var(--font-sans);}
.a-gq:focus{outline:2px solid var(--focus);outline-offset:1px;}
.a-gl-cat{margin:12px 0 2px;font-size:10.5px;letter-spacing:.14em;color:var(--ink-faint);}
.a-gl-e{border-bottom:1px solid var(--line);}
.a-gl-e:last-child{border-bottom:0;}
.a-gl-e.hot{background:var(--surface-hover);border-radius:8px;}
.a-gl-h{display:flex;align-items:center;gap:8px;width:100%;padding:9px 4px;background:none;border:0;cursor:pointer;text-align:left;font-size:13.5px;color:var(--ink);}
@media (hover:hover){.a-gl-h:hover{background:var(--surface-hover);}}
.a-gl-h:active{background:var(--surface-pressed);}
.a-gl-zh{font-family:var(--font-serif);font-weight:700;flex:none;}
.a-gl-py{color:var(--ink-faint);font-size:11.5px;flex:none;}
.a-gl-en{color:var(--ink-soft);font-size:11.5px;margin-left:auto;text-align:right;line-height:1.2;}
.a-gl-pill{flex:none;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;border:1px solid var(--line);color:var(--ink-soft);}
.a-gl-pill.gh{color:var(--good);border-color:var(--good);}
.a-gl-pill.gm{color:var(--warn);border-color:var(--warn);}
.a-gl-pill.om{color:var(--ink-faint);}
.a-gl-b{padding:0 4px 10px;font-size:12.5px;line-height:1.6;color:var(--ink-soft);}
.a-gl-b p{margin:4px 0;}
.a-gl-src{color:var(--ink-faint);font-size:11px;margin:6px 0;}
.a-poplink{display:block;margin-top:8px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2);color:var(--seal);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-sans);}
@media (hover:hover){.a-poplink:hover{background:var(--surface-hover);}}
/* examples / case-study glossary deep-links */
.a-case-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.a-case-link{border:1px solid var(--line);border-radius:8px;background:var(--surface-2);color:var(--seal);font-size:11.5px;padding:3px 9px;cursor:pointer;font-family:var(--font-sans);}
.a-case-link:active{background:var(--surface-pressed);}
@media (hover:hover){.a-case-link:hover{background:var(--surface-hover);}}
`;
export { CSS };
