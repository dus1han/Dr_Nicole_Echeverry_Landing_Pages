import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import { site } from '@/content/site';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { GtmScript, GtmNoScript } from '@/components/analytics/Gtm';
import { ClickIdCapture } from '@/components/analytics/ClickIdCapture';
import { ORIGIN, INDEXABLE } from '@/lib/site-url';
import './globals.css';

/**
 * Playfair is a high-contrast Didone — near-identical to the "NE/EN" logo
 * mark, so the page and the logo read as one brand.
 */
// Weights are kept to exactly what the page uses — every extra weight is
// another font file on the critical path.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: `${site.doctor.name} — ${site.doctor.credentials}, Dubai`,
    template: `%s`,
  },
  description: site.doctor.credentials,
  authors: [{ name: site.doctor.name }],
  /*
   * The name of the SITE, as opposed to the name of any one page.
   *
   * Google's second choice after the homepage's `WebSite` structured data when
   * it decides what to print above a result, and it was absent entirely — so
   * the only spellings on offer were the ones in the JSON-LD and whatever it
   * could infer from the hostname. `dranicolecheverry.com` reads as "Dra"
   * whichever way you look at it, so leaving this unsaid was leaving the answer
   * to a guess.
   *
   * Set at the root so every page carries it. Each page still overrides
   * `openGraph.title` with its own — a site name and a page title are different
   * things, and Next merges rather than replaces.
   */
  openGraph: {
    siteName: site.doctor.name,
    type: 'website',
    locale: 'en_AE',
  },
  // Belt and braces with robots.txt: a disallow rule asks crawlers not to fetch
  // the page, but a URL discovered elsewhere can still be listed without being
  // fetched. The meta tag is what actually keeps it out of results.
  /*
   * `max-image-preview: large` is what lets a Google result carry a full-width
   * thumbnail instead of none. It matters here because emitting a robots meta
   * tag at all REPLACES Google's defaults — so declaring `index, follow` and
   * stopping, as this did, is how a page ends up listed with no picture beside
   * it. `og:image` does not help: Google builds its own thumbnail from images
   * in the page body and ignores the share card, which is why the portrait is
   * also named as `primaryImageOfPage` in lib/schema.ts.
   *
   * The snippet and video limits are set to unlimited for the same reason —
   * once the tag exists, anything left unsaid is a limit, not a default.
   */
  robots: INDEXABLE
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : { index: false, follow: false },
  // Google Ads / Search Console site ownership. Emits
  // <meta name="google-site-verification" ...> into every page's head, so it
  // holds on whichever URL Google decides to check.
  verification: {
    google: '4WDOuAwehn41EVBBLXeqmSOeGJkIzAf6Xtmz_LxQ27Q',
  },
};

export const viewport: Viewport = {
  themeColor: '#5E3E4C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * `no-js` is the DEFAULT, and RevealObserver removes it on mount.
   *
   * Scroll reveals start at opacity 0 and are shown by an observer, so a
   * visitor without JavaScript would otherwise meet a page of invisible blocks.
   * Defaulting to the safe state means the fallback holds even if the bundle
   * never arrives, rather than depending on it to opt out.
   */
  return (
    <html
      lang="en"
      dir="ltr"
      className={`no-js ${playfair.variable} ${manrope.variable}`}
    >
      <head>
        {/*
          GTM is injected after hydration, so by the time the browser learns it
          needs googletagmanager.com it has to do DNS, TCP and TLS from cold
          before a byte of the 148KB container arrives. Measured server latency
          to that origin was 707ms, the slowest of any origin the page touches.
          Warming the connection in <head> overlaps that handshake with work
          the page is doing anyway.

          Only the origin that actually serves the container is listed.
          Preconnecting to origins the page may never reach costs a connection
          each and is its own small waste.
        */}
        {site.analytics.gtmId ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          </>
        ) : null}
      </head>
      <body className="antialiased">
        {/* Must be the first thing in <body> — GTM's documented placement. */}
        <GtmNoScript id={site.analytics.gtmId} />
        <GtmScript id={site.analytics.gtmId} />
        <ClickIdCapture />
        <RevealObserver />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-[var(--radius-sm)] focus:bg-plum-900 focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {/*
          CursorGlow was removed for scroll performance. It was a viewport-sized
          fixed layer using `mix-blend-mode: soft-light`, which forces the whole
          stacking context to re-composite on every pointer move and every
          scroll frame — an expensive flourish almost nobody consciously notices.
        */}
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
