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
import { mkdir, access, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, '..', 'Mommy makeover');
const SRC_LOGO = join(SRC, 'Doctor photos & logo');
const SRC_RESULTS = join(SRC, 'New set');
const SRC_CREDS = join(SRC, 'Logos for description');
const SRC_HERO = join(SRC, 'Tummy Tuck');
/** Later client deliveries: the English lockup, a society mark, a new case. */
const SRC_NEW = join(ROOT, '..', 'New logos');
/** Later delivery again: four replacement before/after composites. */
const SRC_NEW_BA = join(ROOT, '..', 'New B&A');

/**
 * Hero frames — [source file, output slug].
 *
 * Three of the five supplied, chosen because they share a composition: subject
 * on the right, open negative space on the left. That is what lets them
 * dissolve into one another behind fixed copy without the text ever landing on
 * a body.
 *
 * The dark brown frame is left out deliberately — against the other two its
 * exposure jumps, and a cross-fade between them reads as a fault rather than a
 * transition.
 *
 * Sources are 1.4–1.8MB PNGs at 1672×941. Re-encoded to mozjpeg because this is
 * the LCP image on the page and a PNG of a photograph is several hundred
 * kilobytes spent on nothing.
 */
const HERO_FRAMES = [
  ['d7135601-8bba-4ba7-ba83-d55921ca4c25.png', 'hero-1.jpg'],
  ['a86c4f08-fc3b-4097-8da9-f2606ec58c80.png', 'hero-2.jpg'],
  ['ce403b0a-e785-42cd-8e32-f035c642de4f.png', 'hero-3.jpg'],
];
const OUT_CREDS = join(ROOT, 'public', 'logo', 'credentials');
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
 * to cut each in half and feed a two-image card, but the seam is not where you
 * would assume: measured across this set it sits at x=321, x=350 and x=364 on a
 * 700px canvas, and across the previous set it ranged to x=404. A fixed 50% cut
 * would slice through a patient's body, and on a medical results gallery that
 * is not a cosmetic defect.
 *
 * Anything in OUT_RESULTS that these no longer produce is deleted, so replacing
 * six cases with three does not leave three orphans behind for the next person
 * to wonder about.
 */
const RESULT_CASES = [
  ['Untitled design (18).png', 'case-1'],
  ['Untitled design (19).png', 'case-2'],
  ['Untitled design (20).png', 'case-3'],
];

/**
 * Training and affiliation marks — [source file, slug].
 *
 * They arrive as five unrelated exports: 277×366 to 1080×1080, some with
 * transparency, some on baked-in white, and in four different brand colours.
 * Dropped onto a page as-is they read as clip-art.
 *
 * Each is trimmed of its surrounding whitespace and then padded to an IDENTICAL
 * canvas. Trimming first is what makes them look consistent — the whitespace
 * around each source is arbitrary, so scaling the raw files to a common height
 * makes the tightly-cropped ones tower over the generously-padded ones. The
 * shared canvas afterwards means one fixed width/height in the markup and no
 * layout shift.
 */
const CREDENTIAL_LOGOS = [
  ['images (1).png', 'sccp'],
  ['ASPS-Logo (1).png', 'asps'],
  ['images.png', 'isaps'],
  ['ezgif.com-webp-to-png-converter (10).png', 'aasma'],
  ['617948713_1222577283308881_8873968276905512861_n.jpg', 'universidad-del-sinu'],
  ['Logo_universidad_del_tolima_version_web.png', 'universidad-del-tolima'],
];

/**
 * 2× the rendered box, so the marks stay crisp on a retina screen.
 *
 * A shared canvas means one width/height in the markup and therefore no layout
 * shift, but it also pads every mark out to the same rendered width. Keep it
 * only slightly wider than the widest artwork (the Sinú mark, at 1.39:1) —
 * a roomier canvas is dead space that pushes five logos onto two rows.
 */
const CRED_W = 200;
const CRED_H = 120;

/**
 * Every mark is redrawn as a single-tone silhouette in this colour.
 *
 * Not a stylistic preference — three of the five sources have white baked into
 * the file, so on anything other than a white card they show as white
 * rectangles. Deriving an alpha channel from luminance removes the background
 * for all five at once and, as a side effect, resolves the four clashing brand
 * palettes into one band.
 *
 * plum-900: dark enough to read on the blush wash, muted enough not to compete
 * with the copy it sits under.
 */
const CRED_TINT = { r: 0x58, g: 0x40, b: 0x49 };

/* ------------------------------------------------------------------ *
 * Page 2 — /breast-lift
 *
 * Its own source folder and its own output folder. Nothing is shared but the
 * helper functions, so re-running this can never touch the first page's
 * photographs.
 * ------------------------------------------------------------------ */
const SRC_BL = join(ROOT, '..', 'Breast Lift');
const SRC_BL_HERO = join(SRC_BL, 'Breast Augmentation');
const SRC_BL_RESULTS = join(SRC_BL, 'Breast lift', 'B A');
/** Breast reduction imagery, supplied separately from the rest of the set. */
const SRC_BL_REDUCTION = join(SRC_BL, 'BR');
const OUT_IMG_BL = join(ROOT, 'public', 'images', 'breast-lift');
const OUT_RESULTS_BL = join(OUT_IMG_BL, 'results');

/** The three widest frames — the only ones composed with space at the left for copy. */
const BL_HERO_FRAMES = [
  ['8317bdc7-6b57-4a61-9af3-5dd2ea1c1a68.png', 'hero-1.jpg'],
  ['91e2d1dd-46fe-40e8-8a24-b583409d13a3.png', 'hero-2.jpg'],
  ['fe3488fe-de10-42ce-a8f6-627570deb9e6.png', 'hero-3.jpg'],
];

/**
 * The subject sits further right in this set than in the first page's, so the
 * portrait window is shifted accordingly — a window tuned for one set crops the
 * wrong part of another.
 */
const BL_HERO_PORTRAIT = { left: 800, top: 0, width: 706, height: 941 };

const BL_PHOTOS = [
  ['630999bc-379d-4073-8f59-43f6507dff0f.png', 'what-is-it.jpg', 1200],
  ['3d5bcaf8-8a53-4325-b212-0b5bd5127b80.png', 'procedure-lift.jpg', 1100],
  ['9f3486b3-8a31-4fb8-bb10-5cfdd553c561.png', 'procedure-augmentation.jpg', 1100],
  ['b4e3641d-6a82-420c-8626-d95bfc4e62ca.png', 'procedure-combined.jpg', 1100],
  // From the BR folder. Chosen over the two files the client named "Select"
  // because it matches the other three cards — same warm neutral wall, same
  // shoulders-down framing. The "Select" frames are a pink backdrop and a much
  // tighter crop, either of which breaks the row.
  ['e0ece1f6-5f79-4fdf-9942-efa99d4f8224.png', 'procedure-reduction.jpg', 1100],
  ['6e3b7b40-cd66-48d0-ab6c-f8447fafb415.png', 'candidacy.jpg', 1100],
];

/* ------------------------------------------------------------------ *
 * Page 3 — /breast-augmentation
 *
 * The page reuses /breast-lift's photographs for everything except the three
 * technique cards in "Breast Augmentation Options", which the client supplied
 * separately. Only those are built here; the shared frames keep coming from
 * OUT_IMG_BL, which is why content/breast-augmentation.ts still points IMG at
 * /images/breast-lift.
 *
 * There is no `SRC_BA` any more. The page used to carry a single procedure
 * card built from a 'Breast aug' delivery folder; the three options replaced
 * it, so that folder, its BA_PHOTOS entry and the procedure-augmentation.jpg
 * they produced are all gone rather than left generating an image nothing
 * renders.
 * ------------------------------------------------------------------ */
const OUT_IMG_BA = join(ROOT, 'public', 'images', 'breast-augmentation');

/*
 * The three augmentation-option cards, supplied 17 Sep 2026 - [source, slug].
 *
 * A designed set rather than three unrelated photographs: one model, one
 * dusty-pink backdrop, and an inset circle carrying that option's instrument
 * (an implant, a vial and syringe, both together). They only read as a set if
 * all three are cropped identically, which is what buildOptionCards does.
 */
const SRC_BA_OPTIONS = join(ROOT, '..', 'Options', 'BA Images');

const BA_OPTION_CARDS = [
  // "Imaplant.png" is the client's spelling of the source file. Left alone -
  // renaming their delivery is how the next re-run stops finding it.
  ['Imaplant.png', 'option-implants.jpg'],
  ['Fat transfer.png', 'option-fat-transfer.jpg'],
  ['Hybrid.png', 'option-hybrid.jpg'],
];

/*
 * Six cases, renumbered 1-6 after a removal — the slugs are positions in the
 * gallery, not patient identifiers, so they are kept contiguous rather than
 * left with a hole at case-1.
 *
 * The original case-1 ('Untitled design (32).png') was dropped at the client's
 * request. It had a strip of video-player UI baked into the top-left of the
 * frame — the composite had been exported from a screen recording rather than
 * from the originals — which is not something that can be cropped out without
 * cutting into the patient.
 *
 * The four 'Luis - Nicole' files are the replacement delivery. Same 700x380
 * composite as the rest of the set, same clinic watermark, before on the left.
 */
const BL_RESULT_CASES = [
  ['Untitled design (38).png', 'case-1'],
  ['Untitled design (34).png', 'case-2'],
  ['Luis - Nicole - Before after.png', 'case-3'],
  ['Luis - Nicole - Before after (1).png', 'case-4'],
  ['Luis - Nicole - Before after (2).png', 'case-5'],
  ['Luis - Nicole - Before after (3).png', 'case-6'],
];

const exists = async (p) => access(p).then(() => true).catch(() => false);

async function ensureDirs() {
  const dirs = [OUT_IMG, OUT_RESULTS, OUT_LOGO, OUT_CREDS, OUT_IMG_BL, OUT_RESULTS_BL, OUT_IMG_BA];
  for (const d of dirs) {
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

async function copyPhotos({
  label = 'Photographs',
  srcDirs = [SRC, SRC_LOGO],
  outDir = OUT_IMG,
  photos = [...PHOTOS, ...PORTRAITS],
} = {}) {
  console.log(`\n· ${label}`);
  for (const [src, dest, width] of photos) {
    // First directory that actually holds the file — the source sets are not
    // organised the same way from one page to the next.
    let from = null;
    for (const dir of srcDirs) {
      if (await exists(join(dir, src))) {
        from = join(dir, src);
        break;
      }
    }
    if (!from) {
      console.warn(`  ! ${src} not found — skipped`);
      continue;
    }
    if (await optimise(from, join(outDir, dest), width)) {
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
/**
 * Procedure-option cards, cropped to the shape the card actually renders.
 *
 * The sources are 1254x1254 squares and Procedures.tsx puts them in an
 * `aspect-4/3` box under `object-cover`, so a quarter of every image height
 * would be downloaded and then thrown away by the browser. Cropping here
 * means the file matches the box it is shown in.
 *
 * The crop is anchored at the TOP rather than centred. Centred is what
 * `object-cover` would have done and it is wrong for this set: the subject
 * runs chin-to-waist, so taking the excess off both edges trims the neckline
 * and the lower torso at once. Anchoring at the top keeps the neckline and
 * drops only the abdomen, which is not what any of the three photographs is
 * about. It also keeps the inset instrument circle, which sits mid-left,
 * comfortably inside the frame.
 *
 * 1100px wide to match the other multi-card procedure images: these sit three
 * abreast at roughly 30vw, so 1100 still covers a 2x screen.
 */
async function buildOptionCards() {
  console.log('\n- Procedure options');

  if (!(await exists(SRC_BA_OPTIONS))) {
    console.warn(`  ! source folder not found, skipping:\n    ${SRC_BA_OPTIONS}`);
    return;
  }

  const WIDTH = 1100;
  const ASPECT = 4 / 3;

  for (const [file, dest] of BA_OPTION_CARDS) {
    const from = join(SRC_BA_OPTIONS, file);
    if (!(await exists(from))) {
      console.warn(`  ! ${file} not found - skipped`);
      continue;
    }

    const { width, height } = await sharp(from).metadata();
    const keep = Math.min(height, Math.round(width / ASPECT));

    await sharp(from)
      .extract({ left: 0, top: 0, width, height: keep })
      .resize({ width: WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(join(OUT_IMG_BA, dest));

    console.log(`  + ${dest} (${width}x${height} -> ${WIDTH}x${Math.round(WIDTH / ASPECT)})`);
  }
}

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

/**
 * Where the logo comes from, newest delivery first.
 *
 * The English lockup replaced the original, whose credential line was in
 * Spanish. Preferred rather than swapped in place so the original still builds
 * on a machine that only has the first delivery.
 */
async function logoSource() {
  for (const candidate of [
    join(SRC_NEW, 'WhatsApp Image 2026-08-06 at 16.07.31 (1).jpeg'),
    join(SRC_LOGO, 'logo.png'),
  ]) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

/**
 * The logo artwork, as white-on-transparent, whichever form the client sent.
 *
 * Everything downstream — the plum recolour, the footer's white mark, the
 * browser icons — assumes white art on transparency, which is what the original
 * PNG was. The English lockup arrived as a JPEG: black art on a white square,
 * no alpha at all. Dropped in as-is it would have shown a white rectangle on
 * the cream header and a white slab in the blush footer.
 *
 * So an opaque source is converted rather than special-cased: darkness becomes
 * opacity, which preserves the anti-aliased edges of the serif exactly, and the
 * colour channels are then replaced with white. A source that already has
 * transparency is passed through untouched.
 *
 * Trimmed either way. The English artwork is a square canvas with the lockup in
 * the upper two thirds, and that dead space would otherwise be baked into every
 * placement as invisible padding.
 */
async function loadLogoArtwork(src) {
  const meta = await sharp(src).metadata();

  if (meta.hasAlpha) {
    return sharp(src).trim().png().toBuffer();
  }

  const { data, info } = await sharp(src)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 255 - luminance: black ink becomes fully opaque, the white ground fully
  // transparent, and every grey edge pixel keeps its exact coverage.
  const alpha = Buffer.allocUnsafe(info.width * info.height);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = 255 - data[i];

  const white = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();

  const opaqueOnly = await sharp(white)
    .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(opaqueOnly).trim().png().toBuffer();
}

/** Replace RGB while keeping alpha — a tint would leave the white showing. */
async function recolour(buf, rgb) {
  const { width, height } = await sharp(buf).metadata();
  const alpha = await sharp(buf).ensureAlpha().extractChannel('alpha').toBuffer();
  const flat = await sharp({ create: { width, height, channels: 3, background: rgb } })
    .png()
    .toBuffer();
  return sharp(flat).joinChannel(alpha).png({ compressionLevel: 9 }).toBuffer();
}

async function buildLogos() {
  console.log('\n· Logo');
  const src = await logoSource();
  if (!src) {
    console.warn('  ! no logo source found — skipped');
    return;
  }

  const art = await loadLogoArtwork(src);

  // White on transparent: for the dark footer.
  await sharp(art).png({ compressionLevel: 9 }).toFile(join(OUT_LOGO, 'logo-white.png'));
  console.log('  ✓ logo-white.png');

  const plum = { r: 0x3d, g: 0x16, b: 0x2a }; // --color-plum-900
  await writeFile(join(OUT_LOGO, 'logo-plum.png'), await recolour(art, plum));
  console.log('  ✓ logo-plum.png (generated for the light navigation bar)');
}

/**
 * Rows of the artwork that contain ink, grouped into bands.
 *
 * Used to find the monogram without knowing the artwork's dimensions. The
 * previous version cropped y24–312, measured off the original 800×450 lockup;
 * the English one is a square with the monogram much further down, so those
 * numbers would have cut the icon in half. Reading the alpha channel works on
 * whatever the client sends next.
 */
async function inkBands(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bands = [];
  let start = null;
  for (let y = 0; y <= info.height; y += 1) {
    let inked = false;
    if (y < info.height) {
      for (let x = 0; x < info.width; x += 1) {
        // 24, not 0: JPEG ringing leaves a faint haze around the artwork that
        // would otherwise join every band into one.
        if (data[y * info.width + x] > 24) {
          inked = true;
          break;
        }
      }
    }
    if (inked && start === null) start = y;
    else if (!inked && start !== null) {
      bands.push({ top: start, height: y - start });
      start = null;
    }
  }

  /*
   * Merge rows of the same element back together.
   *
   * The monogram is NE stacked over EN with clear space between them, so
   * "first band of ink" was the letters NE alone and the icon came out missing
   * half the mark. Measured on this artwork: 21px between NE and EN, 71px
   * between the monogram and the wordmark below it — the two are not separable
   * by gap size on its own, because the wordmark is a fifth of the height.
   *
   * Relative to the smaller neighbour they are unambiguous: 21px is a tenth of
   * a 210px letter, 71px is well over the 50px wordmark. Merging while the gap
   * is under half the smaller neighbour therefore joins NE to EN and keeps the
   * wordmark separate.
   */
  const merged = [];
  for (const band of bands) {
    const prev = merged[merged.length - 1];
    const gap = prev ? band.top - (prev.top + prev.height) : Infinity;
    if (prev && gap <= 0.5 * Math.min(prev.height, band.height)) {
      prev.height = band.top + band.height - prev.top;
    } else {
      merged.push({ ...band });
    }
  }

  return { bands: merged, width: info.width, height: info.height };
}

/**
 * Browser-tab icon, built from the logo's NE/EN monogram alone.
 *
 * The full lockup includes "NICOLE ECHEVERRY" and a line of credentials which
 * are illegible at 32px, so only the monogram is used — the first band of ink,
 * found by reading the artwork rather than by hardcoded coordinates.
 *
 * The artwork is white on transparent by this point, so it is recoloured to
 * plum — the same treatment as the on-site logo — and left on a TRANSPARENT
 * background, per the client.
 *
 * One exception: `apple-icon.png` keeps a cream background. iOS composites a
 * transparent home-screen icon onto black, which would make a plum monogram
 * almost invisible.
 */
async function buildIcons() {
  console.log('\n· Browser icons');
  const src = await logoSource();
  if (!src) {
    console.warn('  ! no logo source found — skipped');
    return;
  }

  const art = await loadLogoArtwork(src);
  const { bands, width } = await inkBands(art);
  if (bands.length === 0) {
    console.warn('  ! logo artwork has no visible ink — skipped');
    return;
  }

  // The monogram is the first band; the wordmark and credential line follow.
  const band = bands[0];
  console.log(
    `  · ${bands.length} band(s) of ink; monogram at y${band.top}–${band.top + band.height}`,
  );

  // Two passes: sharp allows only one extract per pipeline before a resize, and
  // chaining .extract().trim() in a single pipeline errors with "bad extract
  // area". Crop to a buffer first, then trim that.
  const cropped = await sharp(art)
    .extract({ left: 0, top: band.top, width, height: band.height })
    .png()
    .toBuffer();

  const trimmed = await sharp(cropped).trim().png().toBuffer();
  const monogram = await recolour(trimmed, { r: 0x58, g: 0x40, b: 0x49 }); // --color-plum-900

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

    /*
     * PALETTE, not truecolour.
     *
     * This is one plum glyph on a flat ground — a few dozen distinct RGBA
     * values in total, and every one of them an anti-aliasing step on the same
     * hue. Encoded as truecolour, icon.png came to 85KB: a favicon costing
     * more than the LCP photograph, downloaded by every visitor on every page.
     *
     * Measured against the truecolour original, flattened onto cream so the
     * arbitrary RGB under transparent pixels cannot skew the comparison: a
     * maximum channel difference of 2/255 at the 32px and 48px a browser
     * actually renders a favicon at. 85KB -> 19KB for a difference nobody can
     * see.
     */
    await sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: glyph, gravity: 'centre' }])
      .png({ palette: true, colours: 64, compressionLevel: 9, effort: 10 })
      .toFile(join(ROOT, 'app', name));

    console.log(`  ✓ app/${name} (${size}×${size})`);
  }
}

async function buildResults({
  srcDirs = [SRC_RESULTS],
  outDir = OUT_RESULTS,
  cases = RESULT_CASES,
} = {}) {
  console.log('\n· Before/after — clinic-supplied composites');

  let built = 0;
  for (const [file, slug] of cases) {
    // Searched across directories: replacement cases arrive one at a time, in
    // whichever folder the client happened to send them in.
    let from = null;
    for (const dir of srcDirs) {
      if (await exists(join(dir, file))) {
        from = join(dir, file);
        break;
      }
    }
    if (!from) {
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
      .toFile(join(outDir, `${slug}.jpg`));

    console.log(`  ✓ ${slug}.jpg (${meta.width}×${meta.height})`);
    built += 1;
  }

  // Remove anything this run did not produce. Without it, cutting the gallery
  // from six cases to three leaves case-4/5/6 in public/ — unreferenced, still
  // committed, and still real patients' photographs sitting in a public repo.
  const expected = new Set(cases.map(([, slug]) => `${slug}.jpg`));
  for (const file of await readdir(outDir)) {
    if (!expected.has(file)) {
      await rm(join(outDir, file));
      console.log(`  – removed ${file} (no longer in the set)`);
    }
  }

  if (built < cases.length) {
    console.warn(`\n  ! only ${built}/${cases.length} cases built`);
  }
  console.log('\n  Real patient photographs. Consent must be on file before launch —');
  console.log('  see docs/open-questions.md.');
}

/*
 * AVIF settings for the hero frames.
 *
 * The hero is the LCP element on every page, so this is the one image on the
 * site where bytes are worth measuring rather than guessing at.
 *
 * 62 was chosen by comparing each candidate back against the ORIGINAL PNG,
 * not against the JPEG. Against hero-1's 1672x941 source:
 *
 *   shipping JPEG (q80 mozjpeg)   49,866 B   43.52 dB
 *   AVIF q60                      17,241 B   43.64 dB
 *   AVIF q62                      19,144 B   43.85 dB
 *   AVIF q65                      21,883 B   44.15 dB
 *
 * So q62 is both SMALLER and closer to the original than what it replaces —
 * 62% fewer bytes at higher fidelity. Going further down the curve keeps
 * saving bytes, but q55 (13KB) falls below the JPEG on fidelity, and on a
 * plastic-surgery page the photography is the product.
 *
 * The JPEG is still written. It is the <picture> fallback, and it is what
 * every non-AVIF client gets.
 */
const AVIF_QUALITY = 62;
/** sharp's slowest-but-smallest is 9; 6 is within ~2% of it and far quicker. */
const AVIF_EFFORT = 6;

/**
 * Hero frames for one page.
 *
 * Parameterised because there is more than one landing page now. The portrait
 * window is per-page: it is chosen by where the subject sits in that set's
 * photographs, and a window tuned for one set crops the wrong part of another.
 */
async function buildHeroFrames({
  label = 'Hero frames',
  srcDir = SRC_HERO,
  outDir = OUT_IMG,
  frames = HERO_FRAMES,
  portrait = { left: 660, top: 0, width: 706, height: 941 },
} = {}) {
  console.log(`\n· ${label}`);

  for (const [file, out] of frames) {
    const from = join(srcDir, file);
    if (!(await exists(from))) {
      console.warn(`  ! ${file} not found — skipped`);
      continue;
    }

    // stat, not sharp's metadata().size — that is only populated when the
    // input is a Buffer, and reports NaN for a file path.
    const before = (await stat(from)).size;

    await sharp(from)
      // 1672 wide is the source. Kept, not upscaled: on a full-bleed hero the
      // browser picks from the responsive set, and there is nothing to gain by
      // inventing pixels the photographer did not take.
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(join(outDir, out));

    // An AVIF companion, offered first in the <picture> and with the JPEG kept
    // as the fallback. See AVIF_QUALITY for why 62 and not something rounder.
    await sharp(from)
      .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
      .toFile(join(outDir, out.replace(/\.jpg$/, '.avif')));

    /*
     * A portrait companion for phones — art direction, not a resize.
     *
     * A 16:9 frame stretched over a tall phone viewport crops so hard that only
     * a narrow vertical slice survives, and the subject reads as an abstract
     * close-up rather than a body. Cropping deliberately around the subject
     * keeps the photograph legible at the shape a phone actually is.
     *
     * The window is clamped to the source, because the two sets are not the
     * same size — 1672×941 and 1652×952 — and an extract that runs past the
     * edge throws rather than clipping.
     */
    const meta = await sharp(from).metadata();
    const win = {
      left: Math.max(0, Math.min(portrait.left, meta.width - 1)),
      top: Math.max(0, Math.min(portrait.top, meta.height - 1)),
      width: Math.min(portrait.width, meta.width - portrait.left),
      height: Math.min(portrait.height, meta.height - portrait.top),
    };

    const portraitName = out.replace('.jpg', '-portrait.jpg');
    await sharp(from)
      .extract(win)
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(join(outDir, portraitName));

    await sharp(from)
      .extract(win)
      .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
      .toFile(join(outDir, portraitName.replace(/\.jpg$/, '.avif')));

    const after = (await stat(join(outDir, out))).size;
    const afterP = (await stat(join(outDir, portraitName))).size;
    console.log(
      `  ✓ ${out}  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB` +
        `   + ${portraitName} ${Math.round(afterP / 1024)}KB`,
    );
  }
}

async function buildCredentialLogos() {
  console.log('\n· Training & affiliation marks');

  for (const [file, slug] of CREDENTIAL_LOGOS) {
    // Searched across directories, because later marks arrived in a different
    // delivery folder and moving a client's originals to suit this script is
    // how originals get lost.
    let from = null;
    for (const dir of [SRC_CREDS, SRC_NEW]) {
      if (await exists(join(dir, file))) {
        from = join(dir, file);
        break;
      }
    }
    if (!from) {
      console.warn(`  ! ${file} not found — skipped`);
      continue;
    }

    // Flatten before trimming: `trim` keys off the corner pixel, and a
    // transparent corner gives it nothing to match against.
    const flattened = await sharp(from)
      .flatten({ background: '#ffffff' })
      .png()
      .toBuffer();

    const trimmed = await sharp(flattened).trim({ threshold: 12 }).toBuffer();

    /*
     * Luminance becomes alpha: white background → fully transparent, the ink of
     * the mark → fully opaque, and the greys in between keep their weight so
     * fine lettering does not turn into a solid blob.
     *
     * `normalise` first because the JPEG source has an off-white background
     * that compression left at roughly 250 rather than 255 — without it that
     * background stays very faintly visible as a rectangle, which is the exact
     * problem this is meant to solve.
     */
    const { data, info } = await sharp(trimmed)
      .greyscale()
      .normalise()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rgba = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0; i < info.width * info.height; i += 1) {
      rgba[i * 4] = CRED_TINT.r;
      rgba[i * 4 + 1] = CRED_TINT.g;
      rgba[i * 4 + 2] = CRED_TINT.b;
      rgba[i * 4 + 3] = 255 - data[i];
    }

    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .resize(CRED_W, CRED_H, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: false,
      })
      .png({ compressionLevel: 9 })
      .toFile(join(OUT_CREDS, `${slug}.png`));

    console.log(
      `  ✓ ${slug}.png  (trimmed to ${info.width}×${info.height} → ${CRED_W}×${CRED_H}, tinted)`,
    );
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`\nSource folder not found:\n  ${SRC}\n`);
    process.exit(1);
  }
  await ensureDirs();

  // --- shared across every page -------------------------------------------
  console.log('Shared assets…');
  await buildLogos();
  await buildIcons();
  await buildCredentialLogos();

  // --- /mommy-makeover -----------------------------------------------------
  console.log('\n\nPreparing /mommy-makeover…');
  await copyPhotos();
  await buildHero();
  await buildResults();
  await buildHeroFrames();

  /*
   * --- /breast-lift -------------------------------------------------------
   *
   * Skipped rather than fatal when its source folder is absent. The two pages'
   * assets are independent, and someone rebuilding one should not be blocked
   * by not having the other's originals on their machine.
   */
  console.log('\n\nPreparing /breast-lift…');
  if (!(await exists(SRC_BL))) {
    console.warn(`  ! source folder not found, skipping:\n    ${SRC_BL}`);
  } else {
    await copyPhotos({
      label: 'Photographs',
      srcDirs: [SRC_BL_HERO, SRC_BL_REDUCTION, SRC_BL],
      outDir: OUT_IMG_BL,
      photos: BL_PHOTOS,
    });
    await buildResults({
      srcDirs: [SRC_BL_RESULTS, SRC_NEW, SRC_NEW_BA],
      outDir: OUT_RESULTS_BL,
      cases: BL_RESULT_CASES,
    });
    await buildHeroFrames({
      srcDir: SRC_BL_HERO,
      outDir: OUT_IMG_BL,
      frames: BL_HERO_FRAMES,
      portrait: BL_HERO_PORTRAIT,
    });
  }

  /*
   * --- /breast-augmentation ------------------------------------------------
   *
   * Just the three option cards now. Everything else on the page is
   * /breast-lift's, by path rather than by copy. buildOptionCards skips
   * rather than throws when its source folder is absent, for the same reason
   * as /breast-lift above.
   */
  console.log('\n\nPreparing /breast-augmentation…');
  await buildOptionCards();

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
