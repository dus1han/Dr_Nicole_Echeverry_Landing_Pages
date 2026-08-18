/**
 * Asserts the page's content is actually VISIBLE — on a full load, after
 * scrolling, and after a client-side navigation.
 *
 * Written after both landing pages rendered completely blank when reached by
 * clicking a link rather than by typing the URL. The reveal system starts every
 * block at opacity 0 and an IntersectionObserver adds the class that shows it;
 * the observer was set up once per full page load, so a client-side navigation
 * left the new page's ~95 blocks unobserved and invisible until the visitor
 * refreshed.
 *
 * Every existing check passed on that page. The accessibility audit only tests
 * visibility under `prefers-reduced-motion`, where the CSS forces everything
 * opaque; the image check asks whether bytes decoded, which they do at opacity
 * 0; layout stability measures height, which is unchanged. Nothing looked at
 * whether a person could see anything, which is the one thing that was wrong.
 *
 *   node scripts/check-visible-content.mjs <base-url> [slug] [slug...]
 */
import { chromium } from 'playwright';

const base = process.argv[2];
const slugs = process.argv.slice(3);
if (!base || slugs.length === 0) {
  console.error('usage: node scripts/check-visible-content.mjs <base-url> <slug> [slug...]');
  process.exit(2);
}

const browser = await chromium.launch();
let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
};

/**
 * Reveal blocks that are properly on screen and still invisible.
 *
 * "Properly" matters. The observer deliberately holds an element back until
 * 15% of it has cleared a bottom margin of 8% of the viewport, so a block just
 * peeking in at the bottom edge is supposed to be transparent — that is the
 * animation, not a fault. Counting those reported failures on a page that was
 * working correctly, so the threshold here mirrors the observer's own.
 */
const hiddenOnScreen = (page) =>
  page.evaluate(() => {
    // The observer's own geometry: threshold 0.15 of the element's height,
    // measured against a viewport shortened by 8% at the bottom. Reproduced
    // exactly rather than approximated — a "mostly on screen" rule of thumb
    // flagged a 648px block showing 72px of itself, which the observer is
    // right to be still holding back.
    const rootBottom = window.innerHeight * 0.92;
    return [...document.querySelectorAll('.rv')].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.height === 0) return false;
      const visible = Math.min(r.bottom, rootBottom) - Math.max(r.top, 0);
      const due = visible / r.height >= 0.15;
      return due && parseFloat(getComputedStyle(el).opacity) < 0.05;
    }).length;
  });

/**
 * Walk the page the way a reader does, checking nothing stays invisible.
 *
 * The settle time is generous on purpose: a reveal transition is 520ms, and
 * members of a group stagger by 80ms each, so the last card in a row of eight
 * is legitimately still transparent about 640ms after entering view. Judging
 * sooner measures the animation rather than the bug.
 */
async function scrollThrough(page) {
  let worstHidden = 0;
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = await page.evaluate(() => window.innerHeight * 0.8);
  for (let y = 0; y < height; y += step) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(1500);
    worstHidden = Math.max(worstHidden, await hiddenOnScreen(page));
  }
  return worstHidden;
}

for (const slug of slugs) {
  console.log(`\n/${slug}`);

  /* ---------- 1. Typed the URL ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/${slug}`, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(1200);

    report((await hiddenOnScreen(page)) === 0, 'content visible on a full page load');
    report((await scrollThrough(page)) === 0, 'content stays visible while scrolling');
    await ctx.close();
  }

  /* ---------- 2. Clicked a link to get here ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'load', timeout: 60_000 });

    const link = page.locator(`a[href="/${slug}"]`).first();
    if ((await link.count()) === 0) {
      report(false, `the index links to /${slug}`, 'no link found — nothing to click');
    } else {
      await link.click();
      await page.waitForURL(`**/${slug}`, { timeout: 30_000 });

      /*
       * Scrolled one screen before judging.
       *
       * At the very top of the page barely any block has met the observer's
       * threshold yet, so a page where the observer never ran at all still
       * looks fine here — this check passed against the broken site until it
       * moved. One screen down is where the difference actually shows.
       */
      await page.evaluate(() => window.scrollTo(0, window.innerHeight));
      await page.waitForTimeout(1600);

      report((await hiddenOnScreen(page)) === 0, 'content visible after a client-side navigation');
      report((await scrollThrough(page)) === 0, 'content stays visible while scrolling');
    }
    await ctx.close();
  }
}

await browser.close();
console.log(failures === 0 ? '\nAll content visible.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
