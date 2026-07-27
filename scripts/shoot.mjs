/**
 * Dev-only visual check. Screenshots the page at several widths.
 *
 *   node scripts/shoot.mjs [url] [outDir] [--full]
 *
 * Not part of the build or the deploy — purely a development aid.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:3100/mommy-makeover';
const outDir = process.argv[3] ?? './.shots';
const full = process.argv.includes('--full');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

  await page.waitForTimeout(1200);

  if (full) {
    // The page sets `scroll-behavior: smooth`, which makes scripted scrolling
    // animate — the loop below would race it and sections would never sit in
    // the viewport long enough for their whileInView entrance to fire, so they
    // capture at opacity 0. Force instant scrolling for the capture only.
    await page.addStyleTag({
      content: 'html{scroll-behavior:auto !important}',
    });

    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      const total = document.documentElement.scrollHeight;
      for (let y = 0; y < total; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 320));
      }
      // Settle at the bottom so the last section's observer fires too.
      window.scrollTo({ top: total, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 600));
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(1000);
  }

  await page.screenshot({
    path: `${outDir}/${vp.name}.png`,
    fullPage: full,
  });
  console.log(`  ✓ ${vp.name}.png`);
  await page.close();
}

await browser.close();
console.log('Done.');
