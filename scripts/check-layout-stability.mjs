/**
 * Dev aid: does the page height change on its own while sitting still?
 *
 * A shifting document height is what makes the viewport appear to "jump" when
 * you are parked at the bottom of the page.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const seconds = Number(process.argv[3] ?? 20);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });

// Warm every section, then park at the bottom like a real reader would.
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.7);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 200));
  }
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
});
await page.waitForTimeout(1000);

const samples = await page.evaluate(
  (secs) =>
    new Promise((resolve) => {
      const out = [];
      const t0 = performance.now();
      const tick = () => {
        out.push({
          t: Math.round(performance.now() - t0),
          h: Math.round(document.documentElement.scrollHeight),
          reviews: Math.round(
            document.getElementById('reviews')?.getBoundingClientRect().height ?? 0,
          ),
        });
        if (performance.now() - t0 < secs * 1000) setTimeout(tick, 250);
        else resolve(out);
      };
      tick();
    }),
  seconds,
);

const heights = [...new Set(samples.map((s) => s.h))];
const reviewHeights = [...new Set(samples.map((s) => s.reviews))];

console.log(`\nWatched for ${seconds}s parked at the bottom\n`);
console.log(`  document height values : ${heights.join(', ')}`);
console.log(`  #reviews height values : ${reviewHeights.join(', ')}`);

const stable = heights.length === 1;
console.log(
  `\n  ${stable ? '✓ page height stable' : `✗ page height CHANGES by up to ${Math.max(...heights) - Math.min(...heights)}px`}\n`,
);

if (!stable) {
  const changes = samples.filter((s, i) => i > 0 && s.h !== samples[i - 1].h);
  for (const c of changes.slice(0, 6)) {
    console.log(`    at ${c.t}ms → document ${c.h}px, #reviews ${c.reviews}px`);
  }
  console.log();
}

await browser.close();
process.exit(stable ? 0 : 1);
