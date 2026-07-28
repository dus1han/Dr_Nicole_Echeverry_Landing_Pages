/**
 * Dev aid: end-to-end check of the lead → thank-you → conversion flow.
 *
 * GTM itself does not need to be configured. The dataLayer is a plain array,
 * so we can read exactly what GTM would receive.
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

let pass = 0;
let fail = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  ok ? pass++ : fail++;
};

/* 1 — click ID captured from the landing URL */
console.log('\nClick ID capture');
await page.goto(`${base}/mommy-makeover?gclid=TEST_GCLID_123`, {
  waitUntil: 'networkidle',
  timeout: 90_000,
});
await page.waitForTimeout(1200);

const stored = await page.evaluate(() => localStorage.getItem('nme:click-id'));
check(!!stored && stored.includes('TEST_GCLID_123'), 'gclid stored', stored ?? 'nothing');

/* iOS variants */
await page.goto(`${base}/mommy-makeover?wbraid=TEST_WBRAID`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const wb = await page.evaluate(() => JSON.parse(localStorage.getItem('nme:click-id') ?? '{}'));
check(wb.source === 'wbraid', 'wbraid handled (iOS traffic)', wb.source ?? 'none');

/* 2 — submit the form */
console.log('\nSubmission');
await page.goto(`${base}/mommy-makeover?gclid=TEST_GCLID_123`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Capture what the browser actually sends to the API.
let sentBody = null;
page.on('request', (r) => {
  if (r.url().includes('/api/consultation') && r.method() === 'POST') {
    try {
      sentBody = JSON.parse(r.postData() ?? '{}');
    } catch {}
  }
});

await page.locator('#book-form input[name="name"]').fill('Test Patient');
await page.locator('#book-form input[name="phone"]').fill('+971 55 000 0000');
await page.locator('#book-form input[name="email"]').fill('test@example.com');
await page.locator('#book-form button[type="submit"]').click();

await page.waitForURL('**/thank-you', { timeout: 20_000 });
check(page.url().includes('/mommy-makeover/thank-you'), 'redirected to thank-you', page.url());
check(sentBody?.gclid === 'TEST_GCLID_123', 'click ID sent with the enquiry', sentBody?.gclid ?? 'missing');

/* 3 — conversion event fired exactly once */
console.log('\nConversion event');
await page.waitForTimeout(1200);
const events = await page.evaluate(() =>
  (window.dataLayer ?? []).filter((e) => e && e.event === 'generate_lead'),
);
check(events.length === 1, 'generate_lead pushed once', `${events.length} event(s)`);
check(events[0]?.form_location === 'mommy-makeover', 'event carries context', JSON.stringify(events[0] ?? {}));

const flagCleared = await page.evaluate(() => sessionStorage.getItem('nme:lead-submitted'));
check(flagCleared === null, 'one-time flag cleared');

/* 4 — refresh must NOT fire again */
console.log('\nGuards');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const afterReload = await page.evaluate(() =>
  (window.dataLayer ?? []).filter((e) => e && e.event === 'generate_lead').length,
);
check(afterReload === 0, 'refresh does not re-fire', `${afterReload} event(s)`);

/* 5 — direct visit must NOT fire */
const fresh = await ctx.newPage();
await fresh.goto(`${base}/mommy-makeover/thank-you`, { waitUntil: 'networkidle' });
await fresh.waitForTimeout(1200);
const direct = await fresh.evaluate(() =>
  (window.dataLayer ?? []).filter((e) => e && e.event === 'generate_lead').length,
);
check(direct === 0, 'direct visit does not fire', `${direct} event(s)`);

const robots = await fresh.evaluate(
  () => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
);
check(robots.includes('noindex'), 'thank-you page is noindex', robots || 'no robots meta');

console.log(`\n${fail === 0 ? `All ${pass} checks passed.` : `${fail} of ${pass + fail} failed.`}\n`);

await browser.close();
process.exit(fail === 0 ? 0 : 1);
