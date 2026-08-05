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
  // Belt and braces with robots.txt: a disallow rule asks crawlers not to fetch
  // the page, but a URL discovered elsewhere can still be listed without being
  // fetched. The meta tag is what actually keeps it out of results.
  robots: { index: INDEXABLE, follow: INDEXABLE },
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
