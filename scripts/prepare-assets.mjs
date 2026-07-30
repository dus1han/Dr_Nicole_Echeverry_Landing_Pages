/**
 * Asset pipeline — run once at setup: `npm run assets`
 *
 * Reads from the client's source folder, writes into public/. The source
 * folder is never modified.
 *
 *  1. Copies + optimises the six supplied photographs under semantic names.
 *  2. Generates a plum-tinted logo from the supplied white-on-transparent PNG,
 *     because the original is invisible on the light navigation bar.
 *  3. Generates DUMMY before/after pairs for the results slider. The "before"
 *     plate is a softened, desaturated derivative of the "after" so the
 *     drag-reveal demonstrates a real visual difference.
 *     No real patient is depicted. See docs/open-questions.md.
 */

import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, '..', 'Mommy makeover');
const SRC_LOGO = join(SRC, 'Doctor photos & logo');
const SRC_RESULTS = join(SRC, 'before after');
const OUT_IMG = join(ROOT, 'public', 'images', 'mommy-makeover');
const OUT_RESULTS = join(OUT_IMG, 'results');
const OUT_LOGO = join(ROOT, 'public', 'logo');

/** Source photograph → destination name. */
const PHOTOS = [
  ['ChatGPT Image Jul 27, 2026, 02_59_12 AM.png', 'procedure-tummy.jpg', 1100],
  ['ChatGPT Image Jul 27, 2026, 03_08_24 AM.png', 'procedure-breast.jpg', 1100],
  ['grok-image-53e50550-1707-4948-89bf-afaaecf66a2a.jpg', 'procedure-lipo.jpg', 1100],
];

const PORTRAITS = [
  ['dra-nicole-echeverry-en-cirugia-1.jpg', 'surgeon-operating.jpg', 1080],
  ['482030689_1402814974390728_1545758584537348466_n.jpg', 'doctor-portrait.jpg', 1200],
  ['images (2).jpg', 'doctor-alt.jpg', 640],
];

/**
 * Real before/after cases, supplied by the clinic — [source file, case slug].
 *
 * Each source is a single composite: before on the left, after on the right,
 * already watermarked with the clinic's branding.
 *
 * They are used WHOLE and never split down the middle. The obvious shortcut is
 * to cut each in half and feed the existing two-image card, but the seam is not
 * where you would assume — measured across these six it lands anywhere from
 * x=321 to x=404 on a 700px canvas. A fixed 50% cut would slice through a
 * patient's body on most of them, and on a medical results gallery that is not
 * a cosmetic defect.
 */
const RESULT_CASES = [
  ['Untitled design (18).png', 'case-1'],
  ['Untitled design (19).png', 'case-2'],
  ['Untitled design (20).png', 'case-3'],
  ['Untitled design (21).png', 'case-4'],
  ['Untitled design (22).png', 'case-5'],
  ['Untitled design (23).png', 'case-6'],
];

const exists = async (p) => access(p).then(() => true).catch(() => false);

async function ensureDirs() {
  for (const d of [OUT_IMG, OUT_RESULTS, OUT_LOGO]) {
    await mkdir(d, { recursive: true });
  }
}

async function optimise(from, to, width) {
  if (!(await exists(from))) {
    console.warn(`  ! missing source, skipped: ${from}`);
    return false;
  }
  await sharp(from)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(to);
  return true;
}

async function copyPhotos() {
  console.log('\n· Photographs');
  for (const [src, dest, width] of [...PHOTOS, ...PORTRAITS]) {
    const from = (await exists(join(SRC, src))) ? join(SRC, src) : join(SRC_LOGO, src);
    if (await optimise(from, join(OUT_IMG, dest), width)) {
      console.log(`  ✓ ${dest}`);
    }
  }
}

/**
 * Hero photograph.
 *
 * The source (`her.png`, 1672×941) is a wide 16:9 room shot with the subject
 * centred around x≈920. The hero frame is square on desktop and 5:4 on phones,
 * so a plain resize would letterbox her into a sliver of a much larger room.
 *
 * Cropped to the tallest possible square centred on her instead: she fills the
 * frame while the window, plant and sofa still read behind her, which is what
 * makes it feel like a real clinic rather than a stock cut-out.
 */
async function buildHero() {
  console.log('\n· Hero');
  const src = join(SRC, 'her.png');
  if (!(await exists(src))) {
    console.warn('  ! her.png not found — skipped');
    return;
  }

  const { width, height } = await sharp(src).metadata();

  const SUBJECT_CENTRE_X = 920; // measured from the source artwork
  const size = height; // tallest square that fits
  const left = Math.max(0, Math.min(width - size, Math.round(SUBJECT_CENTRE_X - size / 2)));

  await sharp(src)
    .extract({ left, top: 0, width: size, height: size })
    .resize(1200, 1200)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(join(OUT_IMG, 'hero.jpg'));

  console.log(`  ✓ hero.jpg (square crop ${size}px from x=${left}, centred on the subject)`);
}

async function buildLogos() {
  console.log('\n· Logo');
  const src = join(SRC_LOGO, 'logo.png');
  if (!(await exists(src))) {
    console.warn('  ! logo.png not found — skipped');
    return;
  }

  // The supplied logo is pure white on transparent: perfect for the dark footer.
  await sharp(src).png({ compressionLevel: 9 }).toFile(join(OUT_LOGO, 'logo-white.png'));
  console.log('  ✓ logo-white.png');

  // Recolour to plum-900 by keeping the alpha channel and replacing RGB.
  // A plain tint would leave the white showing through; this rebuilds the
  // colour channels from scratch and re-attaches the original alpha.
  const { width, height } = await sharp(src).metadata();
  const alpha = await sharp(src).ensureAlpha().extractChannel('alpha').toBuffer();

  const plum = { r: 0x3d, g: 0x16, b: 0x2a }; // --color-plum-900
  const flat = await sharp({
    create: { width, height, channels: 3, background: plum },
  })
    .png()
    .toBuffer();

  await sharp(flat)
    .joinChannel(alpha)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT_LOGO, 'logo-plum.png'));
  console.log('  ✓ logo-plum.png (generated for the light navigation bar)');
}

/**
 * Browser-tab icon, built from the logo's NE/EN monogram alone.
 *
 * The full lockup includes "NICOLE ECHEVERRY" and a line of Spanish credentials
 * which are illegible at 32px, so only the monogram is used. Measured from the
 * source alpha channel: the monogram occupies y29–304 of the 800×450 artwork,
 * the wordmark starts at y338.
 *
 * The source mark is white, so it is recoloured to plum — the same treatment as
 * the on-site logo — and left on a TRANSPARENT background, per the client.
 *
 * One exception: `apple-icon.png` keeps a cream background. iOS composites a
 * transparent home-screen icon onto black, which would make a plum monogram
 * almost invisible.
 */
async function buildIcons() {
  console.log('\n· Browser icons');
  const src = join(SRC_LOGO, 'logo.png');
  if (!(await exists(src))) {
    console.warn('  ! logo.png not found — skipped');
    return;
  }

  const meta = await sharp(src).metadata();
  // Clamp to the real artwork size rather than assuming 800×450.
  const top = Math.min(24, meta.height - 1);
  const height = Math.min(288, meta.height - top);

  // Two passes: sharp allows only one extract per pipeline before a resize, and
  // chaining .extract().trim() in a single pipeline errors with "bad extract
  // area". Crop to a buffer first, then trim that.
  const cropped = await sharp(src)
    .ensureAlpha()
    .extract({ left: 0, top, width: meta.width, height })
    .png()
    .toBuffer();

  const trimmed = await sharp(cropped).trim().png().toBuffer();

  // Recolour the white artwork to plum by keeping its alpha and replacing RGB —
  // the same technique used for logo-plum.png.
  const tm = await sharp(trimmed).metadata();
  const alphaCh = await sharp(trimmed).ensureAlpha().extractChannel('alpha').toBuffer();
  const plumFlat = await sharp({
    create: {
      width: tm.width,
      height: tm.height,
      channels: 3,
      background: { r: 0x58, g: 0x40, b: 0x49 }, // --color-plum-900
    },
  })
    .png()
    .toBuffer();
  const monogram = await sharp(plumFlat).joinChannel(alphaCh).png().toBuffer();

  const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
  const CREAM = { r: 0xfe, g: 0xfa, b: 0xf8, alpha: 1 }; // --color-cream

  for (const [name, size, pad, background] of [
    ['icon.png', 512, 0.06, TRANSPARENT],
    // iOS ignores transparency and composites onto black, which would swallow a
    // plum glyph — so this one keeps the site's cream behind it.
    ['apple-icon.png', 180, 0.16, CREAM],
  ]) {
    const inner = Math.round(size * (1 - pad * 2));
    const glyph = await sharp(monogram)
      .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: glyph, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(join(ROOT, 'app', name));

    console.log(`  ✓ app/${name} (${size}×${size})`);
  }
}

async function buildResults() {
  console.log('\n· Before/after — clinic-supplied composites');

  let built = 0;
  for (const [file, slug] of RESULT_CASES) {
    const from = join(SRC_RESULTS, file);
    if (!(await exists(from))) {
      console.warn(`  ! ${file} not found — skipped`);
      continue;
    }

    const meta = await sharp(from).metadata();

    // No resize. The sources are 700×380 and the card renders narrower than
    // that on every breakpoint, so scaling up would invent detail and scaling
    // down would throw away the only copy of a real patient photograph that
    // exists in this repo. Re-encode only.
    await sharp(from)
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(join(OUT_RESULTS, `${slug}.jpg`));

    console.log(`  ✓ ${slug}.jpg (${meta.width}×${meta.height})`);
    built += 1;
  }

  if (built < RESULT_CASES.length) {
    console.warn(`\n  ! only ${built}/${RESULT_CASES.length} cases built`);
  }
  console.log('\n  Real patient photographs. Consent must be on file before launch —');
  console.log('  see docs/open-questions.md.');
}

async function main() {
  console.log('Preparing assets for /mommy-makeover…');
  if (!(await exists(SRC))) {
    console.error(`\nSource folder not found:\n  ${SRC}\n`);
    process.exit(1);
  }
  await ensureDirs();
  await copyPhotos();
  await buildHero();
  await buildLogos();
  await buildIcons();
  await buildResults();
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
