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
const OUT_IMG = join(ROOT, 'public', 'images', 'mommy-makeover');
const OUT_RESULTS = join(OUT_IMG, 'results');
const OUT_LOGO = join(ROOT, 'public', 'logo');

/** Source photograph → destination name. */
const PHOTOS = [
  ['ChatGPT Image Jul 27, 2026, 03_32_08 AM.png', 'hero-dubai.jpg', 1600],
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
 * Dummy result cases — [source plate, case slug, crop position, zoom].
 *
 * Only three body photographs were supplied, so six cases are produced by
 * cropping each source two different ways (different framing and zoom). They
 * read as distinct cases at gallery size without pretending to be six real
 * patients. Placeholders only — see docs/open-questions.md.
 */
const RESULT_CASES = [
  ['procedure-tummy.jpg', 'case-1', 'centre', 1.0],
  ['procedure-breast.jpg', 'case-2', 'centre', 1.0],
  ['procedure-lipo.jpg', 'case-3', 'centre', 1.0],
  ['procedure-tummy.jpg', 'case-4', 'top', 1.35],
  ['procedure-lipo.jpg', 'case-5', 'bottom', 1.25],
  ['procedure-breast.jpg', 'case-6', 'top', 1.3],
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
 * The mark is white, so it is placed on a plum tile — that reads on both light
 * and dark browser chrome, unlike a transparent white glyph which vanishes on
 * a light tab bar.
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

  const monogram = await sharp(cropped).trim().png().toBuffer();

  const plum = { r: 0x58, g: 0x40, b: 0x49, alpha: 1 }; // --color-plum-900

  for (const [name, size, pad] of [
    ['icon.png', 512, 0.2],
    ['apple-icon.png', 180, 0.16], // iOS crops corners; a little less padding
  ]) {
    const inner = Math.round(size * (1 - pad * 2));
    const glyph = await sharp(monogram)
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background: plum } })
      .composite([{ input: glyph, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(join(ROOT, 'app', name));

    console.log(`  ✓ app/${name} (${size}×${size})`);
  }
}

async function buildDummyResults() {
  console.log('\n· Before/after — DUMMY CONTENT');
  const W = 800;
  const H = 1000;

  for (const [plate, slug, position, zoom] of RESULT_CASES) {
    const from = join(OUT_IMG, plate);
    if (!(await exists(from))) {
      console.warn(`  ! ${plate} not found — skipped`);
      continue;
    }

    // Zoom by cropping to a larger frame, then scaling back down.
    const frame = (img) =>
      img.resize(Math.round(W * zoom), Math.round(H * zoom), {
        fit: 'cover',
        position,
      });

    // "After" — the unmodified plate.
    await frame(sharp(from))
      .resize(W, H)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(join(OUT_RESULTS, `${slug}-after.jpg`));

    // "Before" — softened and desaturated so the pair shows a genuine visual
    // difference. Purely a placeholder; depicts no real patient.
    await frame(sharp(from))
      .resize(W, H)
      .modulate({ saturation: 0.62, brightness: 0.96 })
      .blur(1.6)
      .linear(0.94, 8)
      .jpeg({ quality: 83, mozjpeg: true })
      .toFile(join(OUT_RESULTS, `${slug}-before.jpg`));

    console.log(`  ✓ ${slug}-before.jpg + ${slug}-after.jpg`);
  }
  console.log('\n  ⚠ These are placeholders. Replace with real, consented');
  console.log('    photographs and set isPlaceholder: false in the content file.');
}

async function main() {
  console.log('Preparing assets for /mommy-makeover…');
  if (!(await exists(SRC))) {
    console.error(`\nSource folder not found:\n  ${SRC}\n`);
    process.exit(1);
  }
  await ensureDirs();
  await copyPhotos();
  await buildLogos();
  await buildIcons();
  await buildDummyResults();
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
