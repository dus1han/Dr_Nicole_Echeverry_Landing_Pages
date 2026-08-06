/**
 * Dev aid: structural accessibility + reduced-motion checks.
 *
 * Not a replacement for axe or a manual screen-reader pass — it catches the
 * specific regressions this page is prone to.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();
let failures = 0;

const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
};

/* ---------- 1. Structure ---------- */
console.log('\nStructure');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

  const h1s = await page.locator('h1').count();
  report(h1s === 1, 'exactly one <h1>', `found ${h1s}`);

  const imgsNoAlt = await page.locator('img:not([alt])').count();
  report(imgsNoAlt === 0, 'every <img> has an alt attribute', `${imgsNoAlt} missing`);

  const btnsNoName = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).filter(
      (b) =>
        !b.textContent.trim() &&
        !b.getAttribute('aria-label') &&
        !b.getAttribute('aria-labelledby'),
    ).length,
  );
  report(btnsNoName === 0, 'every <button> has an accessible name', `${btnsNoName} unnamed`);

  const linksNoName = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).filter(
      (a) => !a.textContent.trim() && !a.getAttribute('aria-label'),
    ).length,
  );
  report(linksNoName === 0, 'every <a> has an accessible name', `${linksNoName} unnamed`);

  const iframeNoTitle = await page.locator('iframe:not([title])').count();
  report(iframeNoTitle === 0, 'every <iframe> has a title', `${iframeNoTitle} missing`);

  const skip = await page.locator('a[href="#main"]').count();
  report(skip > 0, 'skip-to-content link present');

  const lang = await page.getAttribute('html', 'lang');
  report(lang === 'en', 'html[lang] set', lang ?? 'none');

  /* ---------- 2. Target size ---------- */
  // WCAG 2.2 SC 2.5.8 (AA) requires 24px minimum. 44px is the stricter
  // AAA/mobile-ergonomics figure we hold touch controls to; inline desktop
  // nav links are checked against 24. Skip-links are excluded — they are
  // sr-only until focused, at which point they render full size.
  console.log('\nTarget size (WCAG 2.2 AA: ≥24px)');
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a, button')) {
      if (el.classList.contains('sr-only')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.height < 24) {
        out.push(
          `${el.tagName}"${(el.textContent || '').trim().slice(0, 24)}" ${Math.round(r.height)}px`,
        );
      }
    }
    return out.slice(0, 8);
  });
  report(small.length === 0, 'all interactive targets ≥24px tall', small.join(' | '));

  const smallTouch = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a, button')) {
      if (el.classList.contains('sr-only')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Only controls that are primary tap targets need the full 44px.
      const isTouchTarget =
        el.closest('[data-touch-target]') !== null ||
        el.matches('[role="tab"], [role="slider"], form button, .min-h-11');
      if (isTouchTarget && r.height < 44) {
        out.push(`${el.tagName}"${(el.textContent || '').trim().slice(0, 24)}"`);
      }
    }
    return out.slice(0, 8);
  });
  report(smallTouch.length === 0, 'primary touch controls ≥44px tall', smallTouch.join(' | '));

  /* ---------- 3. Keyboard reachability ---------- */
  console.log('\nKeyboard');
  // The before/after drag slider was replaced by a static gallery, so there is
  // no longer an interactive control here to focus — instead verify every
  // result image carries a descriptive alt naming which half it is.
  const gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#results img'));
    return {
      count: imgs.length,
      labelled: imgs.filter((i) => /before|after/i.test(i.getAttribute('alt') ?? '')).length,
    };
  });
  report(
    gallery.count > 0 && gallery.count === gallery.labelled,
    'before/after images all carry a before/after alt',
    `${gallery.labelled}/${gallery.count}`,
  );

  const faqAria = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#faq button[aria-expanded]'));
    return {
      count: btns.length,
      controlled: btns.filter((b) => b.getAttribute('aria-controls')).length,
    };
  });
  report(
    faqAria.count > 0 && faqAria.count === faqAria.controlled,
    'FAQ buttons expose aria-expanded + aria-controls',
    `${faqAria.controlled}/${faqAria.count}`,
  );

  await page.close();
}

/* ---------- 4. Reduced motion ---------- */
console.log('\nprefers-reduced-motion: reduce');
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);

  const canvas = await page.locator('canvas').count();
  report(canvas === 0, 'petal canvas not mounted');

  const running = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll('*')) {
      for (const a of el.getAnimations?.() ?? []) {
        // CSS keyframe loops should be halted; Motion's one-shot entrances
        // are already reduced to a 150ms fade and may still be settling.
        if (a instanceof CSSAnimation && a.playState === 'running') n++;
      }
    }
    return n;
  });
  report(running === 0, 'no CSS keyframe animations running', `${running} running`);

  // Content must still be visible — reduced motion must never hide anything.
  const invisible = await page.evaluate(() => {
    const out = [];
    for (const sel of ['#procedures h3', '#candidacy li', '#reviews p', '#faq h3']) {
      for (const el of document.querySelectorAll(sel)) {
        if (getComputedStyle(el).opacity === '0') out.push(sel);
      }
    }
    return [...new Set(out)];
  });
  report(invisible.length === 0, 'all content visible under reduced motion', invisible.join(', '));

  await page.close();
}

/* ---------- 5. No-JS fallback ---------- */
console.log('\nJavaScript disabled');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  /*
   * Asserted structurally, not against known strings.
   *
   * These used to look for "Feel Like Yourself Again" and "Frequently Asked
   * Questions" — the first page's copy. That passed for as long as there was
   * one page, then reported two failures the moment a second one arrived with
   * different words, which is a bug in the test rather than the page. What
   * actually matters is that the content is server-rendered at all.
   */
  const noJs = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.innerText?.trim() ?? '',
    faq: document.querySelector('#faq h2')?.innerText?.trim() ?? '',
    answers: document.querySelectorAll('#faq [role="region"]').length,
  }));
  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

  report(noJs.h1.length > 10, `hero headline present without JS — "${noJs.h1.slice(0, 40)}"`);
  report(noJs.faq.length > 3, `FAQ heading present without JS — "${noJs.faq}"`);
  report(noJs.answers > 0, `FAQ answers in the DOM without JS — ${noJs.answers}`);
  report(bodyText.includes('+971 55 557 3563'), 'phone number present without JS');
  await ctx.close();
}

await browser.close();
console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}\n`);
process.exit(failures === 0 ? 0 : 1);
