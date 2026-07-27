/** Dev aid: capture each section separately at full resolution. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2];
const outDir = process.argv[3] ?? './.shots/sections';
const width = Number(process.argv[4] ?? 1440);
const only = process.argv[5];

await mkdir(outDir, { recursive: true });

const SECTIONS = [
  '#what-is-it',
  '#procedures',
  '#candidacy',
  '#meet-dr-nicole',
  '#why-trust',
  '#results',
  '#journey',
  '#reviews',
  '#faq',
  '#confidence',
  '#book',
  '#location',
  'footer',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });

// Warm every section so entrance animations have fired.
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 260));
  }
});
await page.waitForTimeout(800);

for (const sel of SECTIONS) {
  if (only && sel !== only) continue;
  const el = page.locator(sel).first();
  if ((await el.count()) === 0) {
    console.log(`  – ${sel} not found`);
    continue;
  }
  const box = await el.boundingBox();
  if (!box) continue;

  // Resize the viewport to the section height so one clip captures all of it.
  const h = Math.min(Math.ceil(box.height) + 20, 5000);
  await page.setViewportSize({ width, height: h });
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const fresh = await el.boundingBox();
  await page.screenshot({
    path: `${outDir}/${sel.replace('#', '')}.png`.replace('//', '/'),
    clip: {
      x: 0,
      y: Math.max(0, fresh.y),
      width,
      height: Math.min(h - Math.max(0, fresh.y), Math.ceil(fresh.height)),
    },
  });
  console.log(`  ✓ ${sel}`);
}

await browser.close();
