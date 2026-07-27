/**
 * Dev aid: real Core Web Vitals against the production build, on a throttled
 * mobile profile. Bundle size is a proxy; these are the actual numbers.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();

const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

// Throttle to roughly a mid-tier phone on fast 3G.
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

let transferred = 0;
let jsBytes = 0;
let imgBytes = 0;
page.on('response', async (res) => {
  try {
    const len = Number((await res.allHeaders())['content-length'] ?? 0);
    transferred += len;
    const type = res.request().resourceType();
    if (type === 'script') jsBytes += len;
    if (type === 'image') imgBytes += len;
  } catch {}
});

await page.goto(url, { waitUntil: 'load', timeout: 120_000 });

const vitals = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const out = { lcp: 0, cls: 0, fcp: 0 };

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        out.lcp = entries[entries.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) out.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        const fcp = list.getEntries().find((e) => e.name === 'first-contentful-paint');
        if (fcp) out.fcp = fcp.startTime;
      }).observe({ type: 'paint', buffered: true });

      /*
       * Do NOT scroll here. LCP keeps updating until the first real user
       * input, so programmatically scrolling the page makes every larger
       * below-the-fold image re-register as the "largest paint" and reports a
       * wildly inflated figure. LCP is about the initial viewport — settle,
       * then report. CLS is measured separately in a second pass.
       */
      setTimeout(() => resolve(out), 5000);
    }),
);

/* Second pass: scroll the whole page and accumulate layout shift. */
const scrollCls = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      (async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 220));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        setTimeout(() => resolve(cls), 900);
      })();
    }),
);

const fmt = (b) => `${(b / 1024).toFixed(0)} KB`;
const verdict = (v, good, ok) => (v <= good ? 'GOOD' : v <= ok ? 'NEEDS WORK' : 'POOR');

console.log('\nThrottled mobile (4× CPU, ~1.6 Mbps)\n');
console.log(`  FCP  ${(vitals.fcp / 1000).toFixed(2)}s   ${verdict(vitals.fcp, 1800, 3000)}`);
console.log(`  LCP  ${(vitals.lcp / 1000).toFixed(2)}s   ${verdict(vitals.lcp, 2500, 4000)}`);
console.log(`  CLS  ${vitals.cls.toFixed(4)}   ${verdict(vitals.cls, 0.1, 0.25)}  (initial view)`);
console.log(
  `  CLS  ${scrollCls.toFixed(4)}   ${verdict(scrollCls, 0.1, 0.25)}  (after full scroll)`,
);
console.log(`\n  JS transferred     ${fmt(jsBytes)}`);
console.log(`  Images transferred ${fmt(imgBytes)}`);
console.log(`  Total transferred  ${fmt(transferred)}\n`);

await browser.close();
