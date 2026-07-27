/**
 * Dev aid: measure frame pacing while scrolling the page.
 *
 * Reports average FPS, the worst frame, and how many frames blew the 16.7ms
 * budget. Run with CPU throttling to approximate a mid-range laptop/phone.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const cpuRate = Number(process.argv[3] ?? 4);
const width = Number(process.argv[4] ?? 1440);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });

await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
await page.waitForTimeout(1200);

const result = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const frames = [];
      let last = performance.now();
      let running = true;

      const onFrame = () => {
        const now = performance.now();
        frames.push(now - last);
        last = now;
        if (running) requestAnimationFrame(onFrame);
      };
      requestAnimationFrame(onFrame);

      // Scroll the whole page in small steps, like a real scroll gesture.
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const steps = 140;
      let i = 0;

      const step = () => {
        window.scrollTo(0, Math.round((total * i) / steps));
        i += 1;
        if (i <= steps) {
          setTimeout(step, 16);
        } else {
          running = false;
          setTimeout(() => {
            // Drop the first few frames — they include scroll start-up.
            const f = frames.slice(5);
            const avg = f.reduce((a, b) => a + b, 0) / f.length;
            const sorted = [...f].sort((a, b) => a - b);
            resolve({
              frames: f.length,
              avgMs: +avg.toFixed(2),
              fps: +(1000 / avg).toFixed(1),
              p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
              worstMs: +sorted[sorted.length - 1].toFixed(2),
              janky: f.filter((x) => x > 33).length,
            });
          }, 300);
        }
      };
      step();
    }),
);

console.log(`\nScroll performance — CPU ×${cpuRate}, ${width}px\n`);
console.log(`  frames sampled : ${result.frames}`);
console.log(`  average        : ${result.avgMs}ms  (~${result.fps} fps)`);
console.log(`  p95 frame      : ${result.p95Ms}ms`);
console.log(`  worst frame    : ${result.worstMs}ms`);
console.log(`  frames > 33ms  : ${result.janky}  (${((result.janky / result.frames) * 100).toFixed(1)}%)`);
console.log(
  `\n  ${result.fps >= 50 ? '✓ smooth' : result.fps >= 30 ? '⚠ noticeable jank' : '✗ poor'}\n`,
);

await browser.close();
