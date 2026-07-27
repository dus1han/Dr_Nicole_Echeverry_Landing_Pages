/**
 * Dev aid: verify "Book" links land on the SECTION on desktop and on the FORM
 * on mobile.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();

async function run(label, width, height, expected) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(800);

  // The nav "Book Consultation" is hidden under 640px, so use whichever
  // #book link is actually visible at this width.
  const link = page.locator('a[href="#book"]:visible').first();
  await link.click();
  // Smooth-scrolling ~14,000px takes a while — poll until the page stops moving
  // rather than guessing a fixed wait.
  await page.waitForFunction(
    () =>
      new Promise((resolve) => {
        let last = -1;
        let still = 0;
        const tick = () => {
          const y = Math.round(window.scrollY);
          still = y === last ? still + 1 : 0;
          last = y;
          if (still > 5) return resolve(true);
          requestAnimationFrame(tick);
        };
        tick();
      }),
    null,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(200);

  const result = await page.evaluate(() => {
    const section = document.getElementById('book');
    const form = document.getElementById('book-form');
    return {
      sectionTop: Math.round(section.getBoundingClientRect().top),
      formTop: Math.round(form.getBoundingClientRect().top),
    };
  });

  /*
   * Assert the expected target actually sits near the top of the viewport.
   * An earlier version just picked whichever target was *closer*, which
   * reported a pass even when the page had not scrolled at all.
   */
  // html scroll-padding-top (88px) and the element's own scroll-margin stack,
  // so a correctly-landed target sits ~100-190px below the viewport top.
  const TOLERANCE = 220;
  const actual = expected === 'section' ? result.sectionTop : result.formTop;
  const ok = Math.abs(actual) <= TOLERANCE;

  console.log(
    `  ${ok ? '✓' : '✗'} ${label.padEnd(22)} ${expected} at ${actual}px from top ` +
      `(need |x| ≤ ${TOLERANCE})  [section@${result.sectionTop} form@${result.formTop}]`,
  );

  await page.close();
  return ok;
}

console.log('\nBook-link destination\n');
const a = await run('desktop 1440px', 1440, 900, 'section');
const b = await run('mobile 390px', 390, 844, 'form');
console.log();

await browser.close();
process.exit(a && b ? 0 : 1);
