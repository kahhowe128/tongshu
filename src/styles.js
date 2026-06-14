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
.a-dcard{display:grid;grid-template-columns:auto 1fr auto auto;gap:12px;align-items:center;width:100%;
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
/* saved/favourite star (WS-4) */
.a-star{font-size:19px;line-height:1;color:var(--ink-faint);cursor:pointer;align-self:center;padding:2px;border-radius:8px;}
.a-star.on{color:var(--seal);}
.a-star:active{background:var(--surface-pressed);}
.a-cell-star{position:absolute;top:1px;left:2px;font-size:10px;line-height:1;color:var(--ink-faint);opacity:.45;cursor:pointer;padding:1px;}
.a-cell-star.on{color:var(--seal);opacity:1;}
.a-badge{position:absolute;top:-3px;right:-3px;min-width:15px;height:15px;padding:0 3px;border-radius:999px;background:var(--seal);color:var(--on-seal);font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);}
.a-iconbtn.starred{color:var(--seal);}

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
.a-tab .ic{font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;height:22px;}
.a-tab .tl{font-size:10px;}
.a-tab.on{color:var(--seal);}
.a-tab.on .ic{transform:translateY(-1px);}

/* bottom sheet */
/* backdrop blurs the page so its top bar + page h1 don't bleed through behind the sheet heading */
.a-scrim{position:fixed;inset:0;background:var(--scrim);z-index:50;animation:afade .18s ease;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);}
/* on the narrow (scrim) layout the page chrome is redundant under the modal sheet — keep it from showing above the sheet's verdict heading */
@media (max-width:979px){.a-root[data-sheet="1"] .a-bar{visibility:hidden;}}
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

/* five-element bars (scoped to .a-bars so it never clobbers the header .a-bar) */
.a-bars{display:flex;flex-direction:column;gap:5px;}
.a-bars .a-bar{display:grid;grid-template-columns:48px 1fr 30px;align-items:center;gap:8px;font-size:12px;height:auto;padding:0;background:none;border:0;position:static;}
.a-bars .a-bar .bl{font-family:var(--font-serif);color:var(--ink-soft);}
.a-bars .a-bar .bt{height:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:999px;overflow:hidden;}
.a-bars .a-bar .bt i{display:block;height:100%;background:linear-gradient(90deg,var(--good),var(--warn));}
.a-bars .a-bar .bn{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);text-align:right;}

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
/* Desktop two-pane "almanac desk": the day detail becomes an in-flow right pane (not a modal).
   .a-sheet is already a sibling of .a-app inside .a-root, so docking = make .a-root a centered flex row. */
@media (min-width:1024px){
  .a-root[data-sheet="1"]{display:flex;flex-direction:row;align-items:flex-start;max-width:none;margin:0;}
  .a-root[data-sheet="1"] .a-app{flex:1 1 auto;min-width:0;max-width:none;margin:0 0 0 236px;border:0;}
  .a-root[data-sheet="1"] .a-screen{max-width:none;}
  .a-root[data-sheet="1"] .a-scrim{display:none;}
  .a-root[data-sheet="1"] .a-sheet:not(.settings){position:sticky;top:0;left:auto;right:auto;bottom:auto;transform:none;
    flex:0 0 420px;width:420px;height:100vh;max-height:100vh;border-radius:0;border-left:1px solid var(--line);box-shadow:none;animation:none;}
  .a-root[data-sheet="1"] .a-sheet:not(.settings) .a-handle{display:none;}
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
/* WS-2 figures / illustrations */
.a-figure{margin:14px 0;padding:10px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r2);}
.a-figcap{text-align:center;font-size:11px;color:var(--ink-faint);margin-top:6px;}
.a-illus{color:var(--ink-soft);margin:6px auto;}
/* WS-1 home / landing */
.a-hero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:22px 8px 14px;}
.a-eyebrow{font-size:11.5px;letter-spacing:.22em;color:var(--seal);text-transform:uppercase;font-weight:600;}
.a-hero-text{display:flex;flex-direction:column;align-items:center;}
.a-hero-h1{font-family:var(--font-serif);font-size:30px;font-weight:700;color:var(--ink);margin:8px 0 2px;letter-spacing:.03em;line-height:1.2;}
.a-hero-vp{font-size:15px;color:var(--ink-soft);max-width:36ch;margin:6px 0 16px;line-height:1.65;}
.a-hero-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
.a-hero-cta .a-btn,.a-hero-cta .a-btn-ghost{display:inline-flex;align-items:center;gap:7px;min-height:46px;width:auto;}
.a-hero-art{margin-top:8px;width:100%;display:flex;justify-content:center;}
.a-hero-art .a-illus{max-width:300px;}
.a-home .a-sec{margin:26px 0 12px;}
@media (min-width:768px){
  .a-hero{flex-direction:row;text-align:left;justify-content:space-between;align-items:center;gap:28px;padding:38px 8px 30px;}
  .a-hero-text{align-items:flex-start;flex:1 1 auto;min-width:0;}
  .a-hero-cta{justify-content:flex-start;}
  .a-hero-art{flex:0 0 auto;width:auto;margin-top:0;}
  .a-hero-art .a-illus{max-width:380px;}
  .a-hero-h1{font-size:36px;}
}
.a-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0;}
@media (max-width:520px){.a-trust{grid-template-columns:1fr;}}
.a-trust-pill{text-align:left;border:1px solid var(--line);background:var(--surface);border-radius:var(--r2);padding:11px 12px;cursor:pointer;display:flex;flex-direction:column;gap:3px;font-family:var(--font-sans);color:var(--ink);}
.a-trust-pill.static{cursor:default;}
.a-trust-pill b{font-family:var(--font-serif);font-size:13px;}
.a-trust-pill span{font-size:11px;color:var(--ink-faint);}
@media (hover:hover){.a-trust-pill:not(.static):hover{background:var(--surface-hover);}}
.a-tiers .a-tier{border-top:1px solid var(--line);padding:10px 0;}
.a-tiers .a-tier:first-of-type{border-top:0;}
.a-tiers .a-tier .lab{font-family:var(--font-serif);font-weight:700;font-size:14px;display:flex;align-items:center;gap:6px;}
.a-tiers .a-tier.up .lab{color:var(--seal);}
.a-tiers .a-tier .desc{font-size:12px;color:var(--ink-soft);margin-top:3px;line-height:1.55;}
.a-home-foot{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center;padding:18px 0 4px;margin-top:8px;border-top:1px solid var(--line);}
.a-home-foot .lnk{border:0;background:none;color:var(--seal);font-size:12.5px;cursor:pointer;font-family:var(--font-sans);text-decoration:none;}
.a-diagram-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;}
@media (max-width:520px){.a-diagram-grid{grid-template-columns:1fr;}}
/* WS-3 upgrade gate + honest explanation */
.a-gate{border:1px dashed var(--seal);border-radius:var(--r2);padding:14px;background:var(--surface-2);text-align:center;}
.a-gate-h{font-family:var(--font-serif);font-weight:700;font-size:14px;color:var(--seal);display:flex;align-items:center;justify-content:center;gap:7px;}
.a-gate-d{font-size:12px;color:var(--ink-soft);line-height:1.55;margin:6px 0;}
.a-gate-price{font-family:var(--font-mono);font-size:12px;color:var(--ink);margin-bottom:2px;}
.a-explain{display:flex;flex-direction:column;gap:5px;}
.ex-row{display:flex;gap:8px;align-items:baseline;font-size:12.5px;color:var(--ink);}
.ex-tag{flex:none;font-size:9px;font-weight:700;font-family:var(--font-mono);padding:1px 6px;border-radius:999px;}
.ex-tag.exact{background:var(--good-soft);color:var(--good);}
.ex-tag.graded{background:var(--warn-soft);color:var(--warn);}
.ex-txt{line-height:1.5;}

/* ===== Phase 4 responsive shell — breakpoints: mobile <768, tablet 768–1023, desktop ≥1024 ===== */
.a-brand{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;padding:0;color:inherit;flex:0 0 auto;}
.a-brand .brandtext{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15;}
.a-brand .ttl,.a-brand .sub{white-space:nowrap;}
/* desktop top nav + quick controls — hidden on mobile, shown ≥1024 */
.a-dnav,.a-dctl{display:none;}
.a-dnav{align-items:center;gap:2px;margin-left:14px;flex-wrap:nowrap;overflow:hidden;}
.a-dlink{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border:0;background:none;border-radius:9px;cursor:pointer;color:var(--ink-soft);font-family:var(--font-sans);font-size:13.5px;white-space:nowrap;}
.a-dlink:hover{background:var(--surface-hover);color:var(--ink);}
.a-dlink.on{color:var(--seal);background:var(--surface-2);font-weight:600;}
.a-dctl{align-items:center;gap:6px;}
.a-dupg{min-height:34px;padding:0 14px;border:0;border-radius:9px;background:var(--seal);color:var(--on-seal);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-sans);}
.a-dupg:hover{background:var(--seal-deep);}
/* mobile "More" sheet links */
.a-morelink{display:flex;align-items:center;gap:12px;width:100%;padding:14px 6px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font-size:15px;font-family:var(--font-sans);cursor:pointer;text-align:left;}
.a-morelink:active{background:var(--surface-pressed);}

/* ===== Phase 6: desktop left sidebar (rail). Hidden on mobile/tablet; shown ≥1024. ===== */
.a-rail{display:none;}
.a-rail-brand{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;padding:6px 8px;margin-bottom:4px;color:inherit;border-radius:12px;}
.a-rail-brand:hover{background:var(--surface-hover);}
.a-rail-brand .seal{width:34px;height:34px;border-radius:9px;background:var(--seal);color:var(--on-seal);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:20px;flex:none;}
.a-rail-brand .brandtext{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15;}
.a-rail-brand .ttl{font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:.04em;white-space:nowrap;}
.a-rail-brand .sub{font-size:9.5px;color:var(--ink-faint);letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;}
.a-rail-nav{display:flex;flex-direction:column;gap:3px;margin-top:10px;}
.a-rail-link{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border:0;background:none;border-radius:10px;cursor:pointer;color:var(--ink-soft);font-family:var(--font-sans);font-size:14.5px;text-align:left;position:relative;}
.a-rail-link:hover{background:var(--surface-hover);color:var(--ink);}
.a-rail-link.on{color:var(--seal);background:var(--seal-soft);font-weight:600;}
.a-rail-link .a-rail-ico{width:20px;text-align:center;font-size:15px;flex:none;}
.a-rail-foot{margin-top:auto;display:flex;flex-direction:column;gap:8px;padding-top:12px;border-top:1px solid var(--line);}
.a-rail-ctlrow{display:flex;gap:6px;}
.a-rail-ctlrow .a-iconbtn{flex:1;width:auto;height:36px;}
.a-dupg.rail{width:100%;height:38px;}
.a-badge.rail{position:absolute;right:10px;left:auto;top:50%;transform:translateY(-50%);}

@media (min-width:768px){ .a-app{max-width:760px;} }
@media (min-width:1024px){
  .a-rail{display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;width:236px;padding:16px 14px;background:var(--surface);border-right:1px solid var(--line);overflow-y:auto;z-index:40;}
  .a-app{max-width:none;margin:0 0 0 236px;border:0;}
  .a-screen{max-width:1180px;margin:0 auto;padding:26px 28px 48px;}
  .a-tabs{display:none;}
  .a-bar{display:none;}
}

/* ===== Phase 6: launcher home (hero prompt-bar + quick-start cards + scenario tiles) ===== */
.a-launch{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:var(--r3);
  background:radial-gradient(130% 150% at 100% 0,var(--seal-soft) 0,transparent 55%),linear-gradient(180deg,var(--surface) 0,var(--surface-2) 100%);
  padding:22px 20px;margin-bottom:14px;box-shadow:var(--sh);}
.a-launch-main{position:relative;z-index:1;}
.a-launch .a-eyebrow{margin-bottom:8px;}
.a-launch-h1{font-family:var(--font-serif);font-size:26px;line-height:1.18;font-weight:700;margin:0 0 8px;color:var(--ink);}
.a-launch-sub{font-size:14px;color:var(--ink-soft);line-height:1.6;margin:0 0 16px;max-width:52ch;}
.a-launch-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;max-width:680px;padding:12px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);box-shadow:var(--sh);}
.a-launch-field{display:flex;flex-direction:column;gap:4px;flex:1 1 140px;min-width:0;}
.a-launch-field.act{flex:2 1 200px;}
.a-launch-field span{font-size:10.5px;color:var(--ink-faint);letter-spacing:.04em;padding-left:2px;}
.a-launch-field select{appearance:none;-webkit-appearance:none;width:100%;height:42px;padding:0 30px 0 12px;border:1px solid var(--line-2);border-radius:10px;color:var(--ink);font-family:var(--font-sans);font-size:14.5px;cursor:pointer;
  background:var(--surface) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4.5l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.6'/></svg>") no-repeat right 10px center;}
.a-launch-go{flex:0 0 auto;height:42px;padding:0 20px;border:0;border-radius:10px;background:var(--seal);color:var(--on-seal);font-size:15px;font-weight:600;font-family:var(--font-sans);cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
.a-launch-go:hover{background:var(--seal-deep);}
.a-launch-art{display:none;}
/* mobile: activity + range share a row, Find is a full-width CTA below */
@media (max-width:767px){
  .a-launch-field,.a-launch-field.act{flex:1 1 calc(50% - 5px);}
  .a-launch-go{flex:1 1 100%;justify-content:center;}
}

.a-qs-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:6px;}
.a-qs-card{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface);cursor:pointer;text-align:left;font-family:var(--font-sans);box-shadow:var(--sh);transition:transform .12s ease,background .12s ease;}
.a-qs-card:active{background:var(--surface-pressed);}
@media (hover:hover){.a-qs-card:hover{background:var(--surface-hover);transform:translateY(-1px);}}
.a-qs-card b{font-family:var(--font-serif);font-size:14.5px;color:var(--ink);}
.a-qs-card span:last-child{font-size:11px;color:var(--ink-soft);}
.a-qs-ico{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:11px;margin-bottom:6px;}
.a-qs-ico.jade{color:var(--ill-jade);background:var(--ill-jadeSoft);}
.a-qs-ico.gold{color:var(--ill-gold);background:var(--ill-goldSoft);}
.a-qs-ico.cinnabar{color:var(--ill-cinnabar);background:var(--seal-soft);}
.a-qs-ico.plum{color:var(--ill-plum);background:var(--ill-plumSoft);}

.a-scn-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:6px;}
.a-scn-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:16px 8px;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface);cursor:pointer;font-family:var(--font-sans);box-shadow:var(--sh);transition:transform .12s ease;}
.a-scn-tile:active{background:var(--surface-pressed);}
@media (hover:hover){.a-scn-tile:hover{transform:translateY(-2px);}}
.a-scn-ico{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;}
.a-scn-tl{font-family:var(--font-serif);font-size:13.5px;font-weight:700;color:var(--ink);}
.a-scn-tile.cinnabar .a-scn-ico{color:var(--ill-cinnabar);background:var(--seal-soft);}
.a-scn-tile.jade .a-scn-ico{color:var(--ill-jade);background:var(--ill-jadeSoft);}
.a-scn-tile.gold .a-scn-ico{color:var(--ill-gold);background:var(--ill-goldSoft);}
.a-scn-tile.plum .a-scn-ico{color:var(--ill-plum);background:var(--ill-plumSoft);}
.a-scn-tile.terra .a-scn-ico{color:var(--ill-terra);background:var(--ill-terraSoft);}
.a-scn-tile.ink .a-scn-ico{color:var(--ill-ink);background:var(--surface-2);}

@media (min-width:768px){
  .a-qs-grid{grid-template-columns:repeat(4,1fr);}
  .a-scn-grid{grid-template-columns:repeat(6,1fr);}
  .a-launch{padding:30px 28px;}
  .a-launch-main{max-width:640px;}
  .a-launch-h1{font-size:32px;}
  .a-launch-art{display:block;position:absolute;right:18px;bottom:-8px;width:250px;opacity:.95;z-index:0;pointer-events:none;}
}
@media (min-width:1024px){
  .a-launch-h1{font-size:36px;}
  .a-launch-art{width:300px;right:34px;}
}

/* page header band — launcher-style, used on every screen (Find/Calendar/Academy/Videos/Articles/Tools/About/Saved) */
.a-phero{position:relative;display:flex;align-items:center;gap:14px;overflow:hidden;border:1px solid var(--line);border-radius:var(--r3);
  background:radial-gradient(120% 170% at 100% 0,var(--seal-soft) 0,transparent 60%),linear-gradient(180deg,var(--surface) 0,var(--surface-2) 100%);
  padding:18px 18px;margin-bottom:14px;box-shadow:var(--sh);}
.a-phero-main{flex:1 1 auto;min-width:0;}
.a-phero .a-eyebrow{margin-bottom:6px;}
.a-phero-h1{font-family:var(--font-serif);font-size:23px;font-weight:700;line-height:1.2;margin:0;color:var(--ink);}
.a-phero-sub{font-size:13px;color:var(--ink-soft);line-height:1.55;margin:6px 0 0;max-width:62ch;}
.a-phero-sub .en{font-family:var(--font-mono);font-size:10.5px;color:var(--ink-faint);}
.a-phero-ico{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:15px;color:var(--ill-cinnabar);background:var(--seal-soft);}
.a-phero.jade .a-phero-ico{color:var(--ill-jade);background:var(--ill-jadeSoft);}
.a-phero.gold .a-phero-ico{color:var(--ill-gold);background:var(--ill-goldSoft);}
.a-phero.plum .a-phero-ico{color:var(--ill-plum);background:var(--ill-plumSoft);}
.a-phero.terra .a-phero-ico{color:var(--ill-terra);background:var(--ill-terraSoft);}
.a-phero.ink .a-phero-ico{color:var(--ill-ink);background:var(--surface-2);}
@media (min-width:768px){
  .a-phero{padding:22px 26px;gap:18px;}
  .a-phero-h1{font-size:28px;}
  .a-phero-ico{width:60px;height:60px;border-radius:17px;}
}

/* ===== WS-3 richer almanac-desk calendar cells + legend ===== */
.a-cal-rich .a-cell{aspect-ratio:auto;min-height:60px;gap:1px;padding:4px 3px;justify-content:flex-start;}
.a-cell .cl{font-size:8.5px;color:var(--ink-faint);line-height:1.1;}
.a-cell .cgz{display:none;font-family:var(--font-serif);font-size:11px;color:var(--ink-soft);line-height:1.1;}
.a-cell .cv2{display:inline-flex;align-items:center;gap:3px;font-size:9px;line-height:1;margin-top:1px;}
.a-cell .cv2 .cvg{font-weight:700;}
.a-cell .cv2 .cvt{display:none;}
.a-cell .cyi{display:none;color:var(--ink-soft);margin-top:1px;}
.a-cell.tint.v-good .cv2 .cvg{color:var(--good);} .a-cell.tint.v-bad .cv2 .cvg{color:var(--bad);}
.a-cell.tint.v-amber .cv2 .cvg{color:var(--warn);} .a-cell.tint.v-grey .cv2 .cvg{color:var(--ink-faint);}
.a-cell.sel{outline:2px solid var(--seal);outline-offset:-2px;z-index:1;}
.a-cal-legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;font-size:11px;color:var(--ink-soft);}
.a-cal-legend .lg{display:inline-flex;align-items:center;gap:3px;}
.a-cal-legend b{font-style:normal;}
.a-cal-legend .v-good{color:var(--good);} .a-cal-legend .v-bad{color:var(--bad);}
.a-cal-legend .v-amber{color:var(--warn);} .a-cal-legend .v-grey{color:var(--ink-faint);}
@media (min-width:1024px){
  .a-cal-rich .a-cell{min-height:96px;align-items:flex-start;text-align:left;padding:7px 8px;}
  .a-cal-rich .a-cell .g{font-size:15px;}
  .a-cell .cgz{display:block;} .a-cell .cv2 .cvt{display:inline;} .a-cell .cyi{display:inline-flex;}
  .a-cell .cl{font-size:10px;}
}

/* ===== WS-1 home featured rows ===== */
.a-seemore{margin-left:auto;border:0;background:none;color:var(--seal);font-size:12px;cursor:pointer;font-family:var(--font-sans);}
.a-feature-row{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:6px;}
@media (min-width:768px){.a-feature-row{grid-template-columns:repeat(4,1fr);}}
.a-feature-card{display:flex;flex-direction:column;gap:6px;padding:10px;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface);cursor:pointer;text-align:left;font-family:var(--font-sans);box-shadow:var(--sh);}
.a-feature-card:active{background:var(--surface-pressed);}
@media (hover:hover){.a-feature-card:hover{background:var(--surface-hover);}}
.a-feature-card .ft{font-family:var(--font-serif);font-size:13px;font-weight:700;color:var(--ink);line-height:1.3;}
.a-feature-card svg{width:100%;height:auto;}

/* ===== WS-2 Academy lessons index + chapter reader ===== */
.a-lessons-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:10px 0;}
@media (min-width:768px){.a-lessons-grid{grid-template-columns:repeat(3,1fr);}}
.a-lesson-card{display:flex;flex-direction:column;gap:4px;padding:12px;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface);cursor:pointer;text-align:left;font-family:var(--font-sans);box-shadow:var(--sh);}
.a-lesson-card:active{background:var(--surface-pressed);}
@media (hover:hover){.a-lesson-card:hover{background:var(--surface-hover);}}
.a-lesson-card svg{width:100%;height:auto;margin-bottom:4px;}
.a-lesson-card .lc-no{font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);}
.a-lesson-card .lc-title{font-family:var(--font-serif);font-size:15px;font-weight:700;color:var(--ink);}
.a-lesson-card .lc-teaser{font-size:11.5px;color:var(--ink-soft);line-height:1.5;}

/* ===== Phase 6: Academy learning hub — spacious lesson cards (Firefly-academy style) ===== */
.a-track{margin:26px 0 4px;}
.a-track-head{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.a-track-no{flex:none;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:18px;color:var(--ill-cinnabar);background:var(--seal-soft);}
.a-track-no.plus{color:var(--ill-jade);background:var(--ill-jadeSoft);}
.a-track-meta{display:flex;flex-direction:column;gap:1px;}
.a-track-title{font-family:var(--font-serif);font-size:19px;font-weight:700;margin:0;color:var(--ink);line-height:1.15;}
.a-track-sub{font-size:11px;color:var(--ink-faint);letter-spacing:.04em;}
.a-lgrid{display:grid;grid-template-columns:1fr;gap:16px;}
@media (min-width:560px){.a-lgrid{grid-template-columns:repeat(2,1fr);}}
@media (min-width:1024px){.a-lgrid{grid-template-columns:repeat(3,1fr);gap:20px;}}
.a-lcard{display:flex;flex-direction:column;text-align:left;border:1px solid var(--line);border-radius:var(--r3);background:var(--surface);box-shadow:var(--sh);cursor:pointer;overflow:hidden;padding:0;font-family:var(--font-sans);transition:transform .14s ease,box-shadow .14s ease;}
@media (hover:hover){.a-lcard:not(.soon):hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(20,25,35,.13);}}
.a-lcard-cover{position:relative;background:var(--surface-2);line-height:0;border-bottom:1px solid var(--line);}
.a-lcard-cover img,.a-lcard-cover svg{display:block;width:100%;height:auto;}
.a-lcard-cover.soon{display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;color:var(--ink-faint);border-bottom:1px dashed var(--line-2);}
.a-lcard-done{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:var(--good);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:var(--sh);}
.a-lcard-body{display:flex;flex-direction:column;gap:6px;padding:14px 16px 16px;}
.a-lcard-meta{font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);letter-spacing:.04em;text-transform:uppercase;}
.a-lcard-title{font-family:var(--font-serif);font-size:17px;font-weight:700;color:var(--ink);line-height:1.3;}
.a-lcard-chip{align-self:flex-start;margin-top:3px;font-size:12.5px;font-weight:600;color:var(--seal);}
.a-lcard-chip.done{color:var(--good);}
.a-lcard.soon{cursor:default;box-shadow:none;}
.a-lcard.soon .a-lcard-title{color:var(--ink-soft);}
.a-lcard-chip.soon{align-self:flex-start;font-weight:600;color:var(--ink-faint);background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:2px 10px;}
.a-reader{max-width:64ch;margin:0 auto;}
.a-progress{height:4px;background:var(--surface-2);border-radius:999px;overflow:hidden;margin:8px 0;}
.a-progress i{display:block;height:100%;background:var(--seal);}
.a-reader-no{font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}
.a-reader .a-illus{margin:10px auto;max-width:460px;}
.a-reader-body{font-size:15.5px;line-height:1.95;color:var(--ink);margin:0 0 16px;}
.a-reader-cross{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;}
.a-reader-cross .a-btn-ghost{display:inline-flex;align-items:center;gap:6px;}

/* ===== Phase 6: rich lesson reader — sections, inline figures, case studies, takeaways ===== */
.a-reader-meta{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);background:var(--surface-2);border-radius:999px;padding:4px 12px;margin:8px 0 12px;}
.a-reader-lead{font-size:16.5px;line-height:1.8;color:var(--ink);margin:6px 0 20px;font-weight:500;}
.a-reader-sec{margin:30px 0;}
.a-reader-sec{scroll-margin-top:16px;}
.a-reader-h2{display:flex;align-items:center;gap:10px;font-family:var(--font-serif);font-size:20px;font-weight:700;color:var(--ink);margin:0 0 12px;line-height:1.25;}
.a-reader-h2 .rh-no{flex:none;width:28px;height:28px;border-radius:8px;background:var(--seal-soft);color:var(--seal);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:700;}
.a-reader-fig{display:block;margin:10px auto 14px;border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;background:var(--surface-2);max-width:560px;width:100%;}
.a-casebox{margin:26px 0;border:1px solid var(--line);border-left:3px solid var(--seal);border-radius:var(--r2);background:var(--surface-2);padding:16px 18px;}
.a-casebox-h{display:flex;align-items:center;gap:7px;font-family:var(--font-serif);font-size:15px;font-weight:700;color:var(--seal);margin-bottom:10px;}
.a-case{margin:12px 0;}
.a-case + .a-case{border-top:1px dashed var(--line-2);padding-top:14px;}
.a-case-t{font-family:var(--font-serif);font-size:15.5px;font-weight:700;color:var(--ink);margin:6px 0;}
.a-case p{font-size:14px;line-height:1.75;color:var(--ink-soft);margin:6px 0;}
.a-takeaways{margin:24px 0;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface-2);padding:14px 18px;}
.a-takeaways-h{font-family:var(--font-serif);font-size:15px;font-weight:700;color:var(--ink);margin-bottom:8px;}
.a-takeaways ul{margin:0;padding-left:20px;}
.a-takeaways li{font-size:14px;line-height:1.7;color:var(--ink-soft);margin:6px 0;}
.a-takeaways li::marker{color:var(--good);}

/* in-page table of contents (segmented topics on one page) */
.a-rtoc{margin:18px 0 26px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--r2);background:var(--surface-2);}
.a-rtoc-h{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:8px;}
.a-rtoc button{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:0;background:none;cursor:pointer;font-family:var(--font-sans);font-size:14px;color:var(--ink-soft);padding:7px 6px;border-radius:8px;}
.a-rtoc button:hover{background:var(--surface-hover);color:var(--ink);}
.a-rtoc button .n{flex:none;width:20px;height:20px;border-radius:6px;background:var(--seal-soft);color:var(--seal);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;}
/* data table */
.a-rtable-wrap{margin:16px 0;overflow-x:auto;border:1px solid var(--line);border-radius:var(--r2);}
.a-rtable{border-collapse:collapse;width:100%;font-size:13.5px;}
.a-rtable th,.a-rtable td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top;}
.a-rtable thead th{background:var(--surface-2);font-family:var(--font-serif);font-weight:700;color:var(--ink);white-space:nowrap;}
.a-rtable tbody tr:last-child td{border-bottom:0;}
.a-rtable tbody td:first-child{font-family:var(--font-serif);color:var(--ink);white-space:nowrap;}
.a-rtable td{color:var(--ink-soft);}
.a-rtable-cap{font-size:11.5px;color:var(--ink-faint);padding:8px 12px;background:var(--surface-2);border-top:1px solid var(--line);}
.a-reader-fig{box-shadow:var(--sh);}
.a-reader-nav{display:flex;justify-content:space-between;gap:10px;margin-top:16px;border-top:1px solid var(--line);padding-top:14px;}
.a-reader-nav .a-btn-ghost{max-width:48%;text-align:left;}

/* ===== WS-4 video grid ===== */
.a-vidgrid{display:grid;grid-template-columns:1fr;gap:14px;}
@media (min-width:768px){.a-vidgrid{grid-template-columns:repeat(2,1fr);}}
@media (min-width:1024px){.a-vidgrid{grid-template-columns:repeat(3,1fr);}}
.a-vidcard{border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;background:var(--surface);box-shadow:var(--sh);}
.a-vidframe{position:relative;aspect-ratio:16/9;background:var(--surface-2);}
.a-vidembed{position:absolute;inset:0;width:100%;height:100%;border:0;}
.a-vidposter{position:absolute;inset:0;width:100%;height:100%;border:0;background:linear-gradient(135deg,var(--surface-2),var(--good-soft));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:var(--seal);}
.a-vidplay{width:54px;height:54px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;box-shadow:var(--sh);}
.a-vidsoon{font-size:11px;color:var(--ink-soft);background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:1px 9px;}
.a-viddur{position:absolute;right:6px;bottom:6px;font-family:var(--font-mono);font-size:10px;background:var(--scrim);color:#fff;border-radius:5px;padding:1px 5px;}
.a-vidmeta{padding:10px 12px;}
.a-vidmeta .vt{font-family:var(--font-serif);font-size:14px;font-weight:700;color:var(--ink);}
.a-vidmeta .vte{font-size:12px;color:var(--ink-soft);margin-top:3px;line-height:1.5;}

/* ===== Phase 5 LMS — progress, continue, curriculum path ===== */
.a-progress-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);padding:14px;box-shadow:var(--sh);margin:8px 0 20px;}
.a-progress-head{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:var(--ink-soft);margin-bottom:8px;}
.a-progress-head .num{font-family:var(--font-mono);color:var(--ink);}
.a-continue{display:flex;align-items:center;gap:10px;width:100%;margin-top:12px;padding:11px 14px;border:0;border-radius:var(--r1);background:var(--seal);color:var(--on-seal);cursor:pointer;text-align:left;font-family:var(--font-sans);}
.a-continue .cl{font-size:10.5px;opacity:.85;text-transform:uppercase;letter-spacing:.1em;}
.a-continue .ct{font-family:var(--font-serif);font-weight:700;font-size:15px;}
.a-continue .ca{margin-left:auto;font-size:18px;}
.a-continue:active{background:var(--seal-pressed);}
@media (hover:hover){.a-continue:hover{background:var(--seal-deep);}}
.a-module{margin:20px 0;}
.a-module-head{font-family:var(--font-serif);font-size:15px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.a-module-head .mno{color:var(--seal);}
.a-path{position:relative;}
.a-path-spine{position:absolute;left:23px;top:38px;bottom:38px;width:2px;background:var(--line-2);}
.a-path-item{display:flex;align-items:center;gap:12px;width:100%;padding:8px;border:0;background:none;cursor:pointer;text-align:left;border-radius:var(--r2);font-family:var(--font-sans);position:relative;}
@media (hover:hover){.a-path-item:hover{background:var(--surface-hover);}}
.a-path-item:active{background:var(--surface-pressed);}
.a-path-node{flex:0 0 30px;height:30px;border-radius:50%;background:var(--surface);border:2px solid var(--line-2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--ink-faint);z-index:1;}
.a-path-node.done{background:var(--good);border-color:var(--good);color:var(--on-seal);}
.a-path-node.current{border-color:var(--seal);color:var(--seal);}
.a-path-cover{flex:0 0 60px;height:60px;border-radius:10px;overflow:hidden;background:var(--surface-2);display:flex;align-items:center;justify-content:center;border:1px solid var(--line);}
.a-path-cover .a-illus{max-width:60px;}
.a-path-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.a-path-body .pt{font-family:var(--font-serif);font-size:15px;font-weight:700;color:var(--ink);}
.a-path-body .pm{font-size:11.5px;color:var(--ink-faint);}
.a-path-chip{flex:none;font-size:11px;padding:3px 10px;border-radius:999px;background:var(--surface-2);color:var(--ink-soft);}
.a-path-chip.done{background:var(--good-soft);color:var(--good);}
.a-path-chip.current{background:var(--seal);color:var(--on-seal);}
.a-reader-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0;}
.a-reader-actions .a-btn{min-height:42px;}
.a-reader-actions .a-btn-ghost.on{color:var(--good);border-color:var(--good);}
`;
export { CSS };
