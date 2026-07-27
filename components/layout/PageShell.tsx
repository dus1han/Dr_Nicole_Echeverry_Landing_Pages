import type { ReactNode } from 'react';
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
  nav,
  announcements,
  children,
}: {
  nav: Array<{ label: string; href: string }>;
  announcements: string[];
  children: ReactNode;
}) {
  return (
    <>
      <BookAnchor />
      <Navbar items={nav} announcements={announcements} />
      <main id="main">{children}</main>
      <Footer items={nav} />
      <FloatingCta />
    </>
  );
}
