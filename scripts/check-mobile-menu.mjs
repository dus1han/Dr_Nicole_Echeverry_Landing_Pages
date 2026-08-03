/**
 * Dev aid: the mobile menu must close when any of its links is used.
 *
 * This exists because of a bug no single-component test would have found. A
 * document-level capture listener in BookAnchor called `stopPropagation()`,
 * which prevented the event ever reaching React — React binds to the root
 * container, a descendant of `document` — so the overlay's own
 * `onClick={() => setOpen(false)}` never ran for the "Book Consultation"
 * button. The page scrolled to the form underneath a menu that was still
 * covering it and still holding the scroll lock.
 *
 * Both symptoms are asserted: the overlay unmounts, AND the scroll lock is
 * released. Checking only the first would still pass with the page frozen.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('usage: node scripts/check-mobile-menu.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch();
const results = [];

async function trial(label, selector) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(600);

  await page.locator('button[aria-label="Open menu"]').click();
  await page.waitForTimeout(800);

  // The close button is rendered only while the overlay is mounted, so its
  // presence is a direct read of the menu's open state.
  const closeButton = 'button[aria-label="Close menu"]';
  const opened = (await page.locator(closeButton).count()) > 0;

  // Scoped to the overlay: several of these hrefs also exist in the header and
  // the sticky bottom bar, and clicking the wrong one proves nothing.
  await page.locator(`${closeButton} >> xpath=../../.. >> ${selector}`).click();
  await page.waitForTimeout(1500);

  const stillOpen = (await page.locator(closeButton).count()) > 0;
  const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
  const unlocked = overflow !== 'hidden';

  const ok = opened && !stillOpen && unlocked;
  console.log(
    `  ${ok ? '✓' : '✗'} ${label.padEnd(26)} closed=${!stillOpen}  scroll unlocked=${unlocked}`,
  );

  await page.close();
  results.push(ok);
}

console.log('\nMobile menu closes on selection\n');
await trial('nav item', 'a[href="#procedures"]');
await trial('Book Consultation', 'a[href="#book"]');
await trial('phone number', 'a[href^="tel:"]');
console.log();

await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
