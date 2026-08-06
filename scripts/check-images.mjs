/**
 * Asserts every image on a page actually decodes.
 *
 * Written after the before/after gallery shipped blank on desktop. Three
 * `/_next/image` requests hung indefinitely — the files were correct, the
 * markup was correct, the container was idle, and a restart cleared it. What
 * made it reach the client is that nothing here looked at pixels: the
 * accessibility audit counts `<img>` elements and checks their alt text, which
 * a broken image passes perfectly.
 *
 * So this checks the one thing that matters to a visitor — `naturalWidth > 0`,
 * meaning the bytes arrived and the browser decoded them. It catches a hung
 * optimizer, a missing file, a typo in a path, and a mis-sized crop, none of
 * which the other scripts can see.
 *
 * Both viewports, because the failure was desktop-only: the `sizes` attribute
 * makes each width request a DIFFERENT optimizer URL, so a gallery that is
 * perfect on a phone can be empty on a laptop.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('usage: node scripts/check-images.mjs <url>');
  process.exit(2);
}

const VIEWPORTS = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 390, height: 844, label: 'mobile' },
];

/** Long enough that a slow cold encode is not mistaken for a broken one. */
const SETTLE_MS = 20_000;

const browser = await chromium.launch();
let failures = 0;

for (const { width, height, label } of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width, height } });

  const badResponses = [];
  page.on('response', (r) => {
    if (r.request().resourceType() === 'image' && r.status() >= 400) {
      badResponses.push(`${r.status()} ${r.url().slice(0, 110)}`);
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // Everything below the fold is lazy-loaded, so it has to be walked past
  // before it will even be requested.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });

  // Poll rather than wait a flat interval: a healthy page finishes in about a
  // second, and only a genuine failure spends the whole budget.
  const deadline = Date.now() + SETTLE_MS;
  let broken = [];
  for (;;) {
    broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => {
          const r = img.getBoundingClientRect();
          // A zero-sized image is hidden at this viewport (an unmatched
          // `<picture>` source, a `lg:hidden` decoration) and is not expected
          // to load.
          return r.width > 0 && r.height > 0 && img.naturalWidth === 0;
        })
        .map((img) => ({
          src: (img.currentSrc || img.getAttribute('src') || '(no src)').slice(-90),
          alt: (img.getAttribute('alt') || '').slice(0, 40),
          complete: img.complete,
        })),
    );
    if (broken.length === 0 || Date.now() > deadline) break;
    await page.waitForTimeout(500);
  }

  const total = await page.evaluate(() => document.images.length);
  const ok = broken.length === 0 && badResponses.length === 0;
  if (!ok) failures++;

  console.log(
    `  ${ok ? '✓' : '✗'} ${label.padEnd(8)} ${total - broken.length}/${total} images decoded`,
  );
  for (const b of broken) {
    // `complete: true` with no pixels means the request finished and produced
    // nothing decodable; `false` means it never finished at all.
    console.log(
      `      ${b.complete ? 'returned undecodable bytes' : 'never finished loading'}` +
        ` — "${b.alt}" ${b.src}`,
    );
  }
  for (const r of badResponses) console.log(`      HTTP ${r}`);

  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\nAll images load.\n' : `\n${failures} viewport(s) with broken images.\n`);
process.exit(failures === 0 ? 0 : 1);
