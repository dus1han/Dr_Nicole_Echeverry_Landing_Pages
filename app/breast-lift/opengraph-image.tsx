import { ImageResponse } from 'next/og';
import { breastLift as content } from '@/content/breast-lift';
import { site } from '@/content/site';

export const alt = content.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social share card, generated at build time.
 *
 * Uses system fonts rather than fetching Playfair — the edge renderer would
 * need the font binary shipped alongside, and a share card is not worth the
 * extra weight. The palette carries the brand.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #3D162A 0%, #5E2340 55%, #8E3560 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: 'radial-gradient(closest-side, rgba(221,110,150,0.55), transparent)',
            display: 'flex',
          }}
        />

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
            marginTop: 28,
            fontSize: 84,
            lineHeight: 1.02,
            color: '#FFF7F9',
            fontWeight: 700,
            letterSpacing: -2,
            display: 'flex',
          }}
        >
          {content.meta.ogHeadline}
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 40,
            color: '#F3B8CC',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          Mommy Makeover in Dubai
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 26,
            color: 'rgba(253,238,243,0.82)',
          }}
        >
          {site.doctor.name}
          <div style={{ width: 6, height: 6, background: '#D9B98C', display: 'flex' }} />
          {site.doctor.credentials}
        </div>
      </div>
    ),
    size,
  );
}
