import type { ReactNode } from 'react';
import { pageTitle } from '@/content/site';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingCta } from './FloatingCta';
import { BookAnchor } from './BookAnchor';

/**
 * The chrome every landing page shares.
 *
 * Nav links and announcements come from the page's own content file, so a new
 * campaign page gets the whole shell for free without editing anything here.
 */
export function PageShell({
  slug,
  nav,
  announcements,
  children,
}: {
  /** Identifies which treatment this page is about, for the WhatsApp prefill. */
  slug: string;
  nav: Array<{ label: string; href: string }>;
  announcements: string[];
  children: ReactNode;
}) {
  return (
    <>
      <BookAnchor />
      <Navbar items={nav} announcements={announcements} />
      <main id="main">{children}</main>
      <Footer items={nav} treatment={pageTitle(slug)} />
      <FloatingCta treatment={pageTitle(slug)} />
    </>
  );
}
