/** Dev aid: identify the LCP element (no scrolling — that corrupts LCP). */
import { chromium } from 'playwright';

const url = process.argv[2];
const cpuRate = Number(process.argv[3] ?? 4);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
});
const page = await ctx.newPage();

// Install the observer before any navigation so nothing is missed.
await page.addInitScript(() => {
  window.__lcp = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__lcp.push({
        time: Math.round(e.startTime),
        tag: e.element?.tagName ?? '(none)',
        cls: (e.element?.className?.toString() ?? '').slice(0, 70),
        text: (e.element?.textContent ?? '').trim().slice(0, 40),
        url: (e.url || '').split('/').pop()?.slice(0, 50) ?? '',
        size: Math.round(e.size),
      });
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});

const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });

await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
await page.waitForTimeout(9000);

const lcp = await page.evaluate(() => window.__lcp);

console.log(`\nCPU ×${cpuRate} — LCP candidates in order:\n`);
for (const c of lcp) {
  console.log(
    `  ${String(c.time).padStart(6)}ms  ${c.tag.padEnd(6)} size=${String(c.size).padStart(7)}  ${c.url || c.text}`,
  );
  if (c.cls) console.log(`          ${c.cls}`);
}
console.log(`\n  → final LCP: ${lcp.at(-1)?.time ?? '?'}ms\n`);

await browser.close();
