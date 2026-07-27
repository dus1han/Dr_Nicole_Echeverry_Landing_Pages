/** Dev aid: report geometry for a set of selectors at a given width. */
import { chromium } from 'playwright';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 1440);
const selectors = process.argv.slice(4);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(1200);

console.log(`\nViewport ${width}px\n`);
for (const sel of selectors) {
  const info = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
    };
  }, sel);
  console.log(`  ${sel.padEnd(28)} ${info ? JSON.stringify(info) : 'not found'}`);
}
console.log();
await browser.close();
