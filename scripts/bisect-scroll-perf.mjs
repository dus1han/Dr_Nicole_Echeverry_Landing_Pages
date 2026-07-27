/**
 * Dev aid: measure scroll FPS with individual effects disabled, to find what
 * actually costs. Each run injects one CSS override before scrolling.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const cpuRate = Number(process.argv[3] ?? 4);

const CASES = [
  ['baseline', ''],
  ['no CSS animations', '*,*::before,*::after{animation:none !important}'],
  ['no blur filters', '*{filter:none !important;backdrop-filter:none !important}'],
  ['no petal canvases', 'canvas{display:none !important}'],
  ['no grain overlay', '.grain::after{display:none !important}'],
  [
    'no aurora blobs',
    '[aria-hidden="true"].anim-aura-a,[aria-hidden="true"].anim-aura-b,[aria-hidden="true"].anim-aura-c,.anim-aura-a,.anim-aura-b,.anim-aura-c{display:none !important}',
  ],
  [
    'none of the above',
    '*,*::before,*::after{animation:none !important}*{filter:none !important;backdrop-filter:none !important}canvas{display:none !important}.grain::after{display:none !important}',
  ],
];

const browser = await chromium.launch();

async function measure(css) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(1000);

  const fps = await page.evaluate(
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

        const total = document.documentElement.scrollHeight - window.innerHeight;
        const steps = 120;
        let i = 0;
        const step = () => {
          window.scrollTo(0, Math.round((total * i) / steps));
          i += 1;
          if (i <= steps) setTimeout(step, 16);
          else {
            running = false;
            setTimeout(() => {
              const f = frames.slice(5);
              const avg = f.reduce((a, b) => a + b, 0) / f.length;
              resolve(+(1000 / avg).toFixed(1));
            }, 250);
          }
        };
        step();
      }),
  );

  await ctx.close();
  return fps;
}

console.log(`\nScroll FPS by disabled effect — CPU ×${cpuRate}\n`);
for (const [label, css] of CASES) {
  const fps = await measure(css);
  const bar = '█'.repeat(Math.max(1, Math.round(fps / 2)));
  console.log(`  ${label.padEnd(20)} ${String(fps).padStart(5)} fps  ${bar}`);
}
console.log();

await browser.close();
