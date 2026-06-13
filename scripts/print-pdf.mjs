// public/guide/index.html → public/guide/tongshu-guide.pdf via headless Chromium (footer page numbers).
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = 'file://' + path.join(__dirname, '../public/guide/index.html');
const OUT = path.join(__dirname, '../public/guide/tongshu-guide.pdf');
const FOOTER = '<div style="width:100%;font-size:8px;color:#8b8276;text-align:center;font-family:Georgia,serif;padding:0 13mm;">Tong Shu Date Selector · User Guide v1.0 &nbsp;—&nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span></div>';
const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const pg = await b.newPage();
await pg.goto(SRC, { waitUntil: 'networkidle' });
await pg.addStyleTag({ content: '@media print{@page{size:A4;margin:0}}' });
await pg.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: false,
  displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: FOOTER,
  margin: { top: '12mm', bottom: '16mm', left: '13mm', right: '13mm' } });
await b.close();
const { PDFDocument } = await import('pdf-lib');
const doc = await PDFDocument.load(fs.readFileSync(OUT));
const n = doc.getPageCount(), kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`PDF OK — ${n} pages, ${kb} KB`);
if (!(n >= 6 && n <= 60 && kb > 80)) process.exit(1);
