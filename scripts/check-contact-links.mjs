/**
 * Every tel: and wa.me link on a page points at the clinic's current number,
 * and every WhatsApp message names the treatment the visitor is reading about.
 *
 * The number lives in one place (`content/site.ts`) and every component reads
 * it, so a wrong number is unlikely — but "unlikely" is how the WhatsApp
 * prefill on /breast-lift came to say "Mommy Makeover": that text was a
 * constant in the component rather than a value from the page, and no check
 * ever read it. A patient tapping WhatsApp from a breast-lift ad would have
 * opened a message about a different operation.
 *
 * Both viewports, because the mobile Call / WhatsApp bar does not exist on
 * desktop and the desktop nav's phone link does not exist on mobile.
 *
 *   node scripts/check-contact-links.mjs <url> <expected-digits> [treatment]
 */
import { chromium } from 'playwright';

const [url, expected, treatment] = process.argv.slice(2);
if (!url || !expected) {
  console.error('usage: node scripts/check-contact-links.mjs <url> <digits> [treatment]');
  process.exit(2);
}

const digitsOf = (s) => (s ?? '').replace(/\D/g, '');
const want = digitsOf(expected);

const browser = await chromium.launch();
let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
};

for (const [width, height, label] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

  // The mobile bar only appears once the hero has scrolled away.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(700);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"]')).map((a) => ({
      href: a.getAttribute('href'),
      text: a.textContent.trim().slice(0, 40),
    })),
  );

  console.log(`\n${label} — ${links.length} contact link(s)`);
  report(links.length > 0, 'the page has contact links at all');

  for (const l of links) {
    const isTel = l.href.startsWith('tel:');
    const number = isTel ? digitsOf(l.href) : digitsOf(l.href.split('wa.me/')[1]?.split('?')[0]);
    report(number === want, `${isTel ? 'call' : 'WhatsApp'} link dials ${want}`, number);

    // A tel: link that displays a number must display the one it dials.
    if (isTel && /\d/.test(l.text)) {
      report(digitsOf(l.text) === want, 'displayed number matches the dialled one', l.text);
    }

    if (!isTel && treatment) {
      const message = decodeURIComponent(l.href.split('text=')[1] ?? '');
      report(
        message.includes(treatment),
        `WhatsApp message names "${treatment}"`,
        message || '(no prefilled message)',
      );
    }
  }

  await page.close();
}

await browser.close();
console.log(`\n${failures === 0 ? 'All contact links correct.' : `${failures} check(s) failed.`}\n`);
process.exit(failures === 0 ? 0 : 1);
