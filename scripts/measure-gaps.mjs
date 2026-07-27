/**
 * Dev aid: for each section, report its padding and the REAL empty space —
 * the gap between the section edge and the first/last thing actually painted
 * inside it. Padding alone under-reports: internal margins and centred
 * heading blocks add space the padding value doesn't show.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 1440);

const SECTIONS = [
  ['hero', 'main > section:nth-of-type(1)'],
  ['trust', 'main > section:nth-of-type(2)'],
  ['what-is-it', '#what-is-it'],
  ['procedures', '#procedures'],
  ['candidacy', '#candidacy'],
  ['meet-dr-nicole', '#meet-dr-nicole'],
  ['why-trust', '#why-trust'],
  ['results', '#results'],
  ['journey', '#journey'],
  ['reviews', '#reviews'],
  ['faq', '#faq'],
  ['confidence', '#confidence'],
  ['book', '#book'],
  ['location', '#location'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.7);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 180));
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await page.waitForTimeout(600);

console.log(`\nViewport ${width}px — padding vs. real empty space\n`);
console.log('  section            height   padTop  padBot   gapTop  gapBot');
console.log('  ' + '-'.repeat(62));

for (const [name, sel] of SECTIONS) {
  const info = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    // Find the topmost / bottommost painted descendant that isn't decorative.
    let top = Infinity;
    let bottom = -Infinity;
    for (const child of el.querySelectorAll('*')) {
      if (child.getAttribute('aria-hidden') === 'true') continue;
      const cr = child.getBoundingClientRect();
      if (cr.width === 0 || cr.height === 0) continue;
      const ccs = getComputedStyle(child);
      if (ccs.position === 'fixed') continue;
      // Skip full-bleed wrappers — they inherit the section's own bounds.
      if (Math.abs(cr.top - r.top) < 1 && Math.abs(cr.bottom - r.bottom) < 1) continue;
      if (!child.textContent?.trim() && child.tagName !== 'IMG') continue;
      top = Math.min(top, cr.top);
      bottom = Math.max(bottom, cr.bottom);
    }

    return {
      height: Math.round(r.height),
      padTop: cs.paddingTop,
      padBottom: cs.paddingBottom,
      gapTop: Number.isFinite(top) ? Math.round(top - r.top) : null,
      gapBottom: Number.isFinite(bottom) ? Math.round(r.bottom - bottom) : null,
    };
  }, sel);

  if (!info) {
    console.log(`  ${name.padEnd(18)} not found`);
    continue;
  }
  console.log(
    `  ${name.padEnd(18)} ${String(info.height).padStart(5)}   ${info.padTop.padStart(6)}  ${info.padBottom.padStart(6)}   ${String(info.gapTop).padStart(5)}   ${String(info.gapBottom).padStart(5)}`,
  );
}
console.log();
await browser.close();
