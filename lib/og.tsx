import { join } from 'node:path';
import sharp from 'sharp';
import { site } from '@/content/site';

/**
 * The social share card, in one place.
 *
 * Every page's `opengraph-image.tsx` was a copy of the first one, and the copy
 * carried a mistake nobody could see: /breast-lift's card had the literal
 * string "Mommy Makeover in Dubai" set into it, so sharing the breast page
 * previewed the wrong operation. A share card is invisible to everyone working
 * on the site — it never renders in a browser tab — which is exactly why it
 * must not be duplicated per page. Each route now supplies two strings and
 * nothing else.
 *
 * Shown wherever a link is unfurled: WhatsApp, Messenger, Facebook, LinkedIn,
 * X, Slack, iMessage. NOT in Google search results — Google builds its own
 * thumbnail from images in the page body and ignores `og:image` for that. See
 * `max-image-preview` in app/layout.tsx and `primaryImageOfPage` in
 * lib/schema.ts, which are the two things that do influence it.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/** Width of the portrait panel. The copy gets the remaining 760px. */
const PORTRAIT_W = 440;

/** How far the photograph fades out along its left edge. */
const FEATHER_W = 190;

/**
 * Dr. Nicole, cropped to the panel and faded out along her left edge, as a
 * data URI.
 *
 * Inlined rather than referenced by URL. The card is rendered during
 * `next build`, when the site is not yet being served — an `<img src="https://
 * dranicolecheverry.com/...">` would be a request to a host that is not
 * answering yet, and the build would emit a card with a hole in it rather than
 * fail.
 *
 * `doctor-alt.jpg` rather than the portrait used on the page itself: that one
 * is a full-length studio shot, and cropped to this panel it lands on her knees
 * rather than her face. This is already head-and-shoulders.
 *
 * THE FADE IS BAKED INTO THE PIXELS, and it has to be. Two attempts to do it in
 * the card's own markup both rendered as nothing at all: a `linear-gradient`
 * overlay whose stops carry alpha, and an `inset` box-shadow on the panel.
 * Satori accepted both silently and drew neither, leaving the photograph's warm
 * background meeting the plum on a hard vertical line. Doing it here also means
 * the transparency is real — the plum gradient shows through the fade, so the
 * blend stays correct no matter what sits behind it.
 */
async function portraitDataUri() {
  const source = join(process.cwd(), 'public', 'images', 'mommy-makeover', 'doctor-alt.jpg');

  const pixels = await sharp(source)
    .resize(PORTRAIT_W, OG_SIZE.height, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer();

  // Ramp the alpha channel from fully transparent at x=0 to opaque at
  // x=FEATHER_W. Squared, because a linear ramp reads as a visible grey band
  // rather than as a fade.
  for (let y = 0; y < OG_SIZE.height; y++) {
    for (let x = 0; x < FEATHER_W; x++) {
      const alpha = (y * PORTRAIT_W + x) * 4 + 3;
      pixels[alpha] = Math.round(255 * (x / FEATHER_W) ** 2);
    }
  }

  const png = await sharp(pixels, {
    raw: { width: PORTRAIT_W, height: OG_SIZE.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return `data:image/png;base64,${png.toString('base64')}`;
}

/**
 * The card's markup.
 *
 * Satori, not a browser: no cascade, no `gap` on block elements, and every
 * element that contains more than one child needs an explicit `display: flex`.
 * Keep the styles inline and literal — a shorthand that works in CSS may
 * silently do nothing here.
 *
 * System fonts throughout. Shipping Playfair's binary to the renderer is real
 * weight for something seen at thumbnail size, and the palette carries the
 * brand well enough on its own.
 */
export async function ogCard({
  headline,
  subline,
}: {
  /** The treatment and the city — the biggest thing on the card. */
  headline: string;
  /** One supporting line. Never repeat the headline here. */
  subline: string;
}) {
  const portrait = await portraitDataUri();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #3D162A 0%, #5E2340 55%, #8E3560 100%)',
        position: 'relative',
      }}
    >
      {/*
        No radial bloom here, unlike the earlier card. Satori's radial gradients
        band badly at this size — it rendered as a grey smudge behind the
        headline rather than as a glow, and the linear background is clean on
        its own.
      */}

      {/* ---------------- Copy ---------------- */}
      <div
        style={{
          width: OG_SIZE.width - PORTRAIT_W,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 56px 72px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 20,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#D9B98C',
            fontWeight: 600,
          }}
        >
          <div style={{ width: 48, height: 1, background: '#D9B98C', display: 'flex' }} />
          Dubai · Plastic Surgery
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 76,
            lineHeight: 1.03,
            color: '#FFF7F9',
            fontWeight: 700,
            letterSpacing: -2,
            display: 'flex',
          }}
        >
          {headline}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 32,
            lineHeight: 1.25,
            color: '#F3B8CC',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          {subline}
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            color: 'rgba(253,238,243,0.86)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 600, display: 'flex' }}>
            {site.doctor.name}
          </div>
          <div style={{ marginTop: 6, fontSize: 21, display: 'flex' }}>
            {site.doctor.credentials}
          </div>
        </div>
      </div>

      {/* ---------------- Portrait ---------------- */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: PORTRAIT_W,
          height: '100%',
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait}
          alt=""
          width={PORTRAIT_W}
          height={OG_SIZE.height}
          style={{ width: PORTRAIT_W, height: OG_SIZE.height, objectFit: 'cover' }}
        />
      </div>

      {/* Gold hairline along the bottom, matching the dividers on the page. */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 6,
          background: 'linear-gradient(90deg, #AE8544, #D9B98C, #AE8544)',
          display: 'flex',
        }}
      />
    </div>
  );
}
