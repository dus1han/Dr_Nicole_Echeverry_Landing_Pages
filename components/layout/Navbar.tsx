'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { site, telUrl } from '@/content/site';
import { useScrolledPast, useScrollLock } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import { Marquee } from '@/components/effects/Marquee';

type NavItem = { label: string; href: string };

/**
 * Fixed header: announcement marquee on top, navigation below.
 *
 * Both live in one fixed element so they can never overlap. On scroll the
 * marquee row collapses to nothing and the nav frosts over — the page gains
 * vertical room exactly when the user starts reading.
 */
export function Navbar({
  items,
  announcements,
}: {
  items: NavItem[];
  announcements: string[];
}) {
  const scrolled = useScrolledPast(60);
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          // bg-cream/95 + a light blur, not /85 + blur-xl: a large backdrop
          // filter across the full viewport width re-composites on every scroll
          // frame. Raising the opacity means far less blur is needed to keep
          // the frosted look.
          scrolled
            ? 'border-b border-gold-400/25 bg-cream/95 backdrop-blur-sm shadow-[0_1px_24px_-12px_rgba(142,53,96,0.35)]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        {/*
          Legibility scrim, shown only while the header is transparent.

          Before this, the header carried no background at rest and simply
          borrowed the contrast of whatever sat beneath it. That held for as long
          as every page opened on a pale section, and broke the moment the hero
          became full-bleed photography: the links and the phone number ended up
          on skin tone at close to no contrast.

          Fixing it here rather than in the hero matters. A scrim inside the hero
          protects this one page; a scrim inside the header protects any section
          that ever sits under it, including whatever page two turns out to be.

          Note the automated contrast audit passed throughout — it resolves a
          background by walking up the DOM and cannot evaluate text over an
          image. A green check was not evidence here.
        */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[9.5rem] transition-opacity duration-300',
            'bg-[linear-gradient(to_bottom,var(--color-cream)_0%,rgba(254,250,248,0.9)_42%,rgba(254,250,248,0.5)_72%,transparent_100%)]',
            scrolled ? 'opacity-0' : 'opacity-100',
          )}
        />
        <div
          className={cn(
            'overflow-hidden border-b border-gold-500/20 bg-blush-100 transition-[height,opacity] duration-300',
            scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100',
          )}
        >
          <div className="flex h-9 items-center">
            <Marquee items={announcements} />
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="container-page flex items-center justify-between gap-6 py-3"
        >
          <Link
            href={`/${site.landingPages[0]?.slug ?? ''}`}
            className="relative block shrink-0"
            aria-label={`${site.doctor.name} — home`}
          >
            {/*
              `sizes` matters here: the logo renders ~100px wide, but without
              it next/image requested a 1600px variant for a 56px-tall mark
              and it became an early LCP candidate.
            */}
            <Image
              src="/logo/logo-plum.png"
              alt={site.doctor.name}
              width={800}
              height={450}
              priority
              sizes="220px"
              className={cn(
                'w-auto transition-all duration-300',
                scrolled ? 'h-11' : 'h-14',
              )}
            />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {items.map((item) => (
              <li key={item.href}>
                {/* py-2 keeps the hit area ≥24px tall (WCAG 2.2 SC 2.5.8). */}
                <a
                  href={item.href}
                  className="relative block py-2 font-sans text-sm font-medium text-ink/80 transition-colors hover:text-plum-700
                             after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left
                             after:scale-x-0 after:bg-[image:var(--gradient-brand)] after:transition-transform
                             after:duration-300 hover:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={telUrl}
              className="hidden items-center gap-2 py-2 font-sans text-sm font-medium text-plum-700 transition-colors hover:text-rose-600 xl:flex"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>

            <ButtonLink href="#book" size="sm" className="hidden sm:inline-flex">
              Book Consultation
            </ButtonLink>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] border border-blush-200 bg-white/70 text-plum-800 backdrop-blur-sm transition-colors hover:bg-white lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {/*
        Conditionally rendered, with a CSS fade on the way in.
        AnimatePresence existed to animate the exit as well; that is not worth
        an animation runtime resident on every page, and the menu closing
        instantly is if anything the more responsive behaviour.
      */}
      {open && (
        <div className="anim-fade-in fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-blush-100)_100%)]" />

            <div className="relative flex h-full flex-col">
              <div className="container-page flex items-center justify-between py-4">
                <Image
                  src="/logo/logo-plum.png"
                  alt={site.doctor.name}
                  width={800}
                  height={450}
                  sizes="220px"
                  className="h-12 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] border border-blush-200 bg-white/70 text-plum-800"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <ul className="container-page flex flex-1 flex-col justify-center gap-2">
                {items.map((item, i) => (
                  // Staggered by a per-item delay rather than by a parent
                  // orchestrating its children.
                  <li
                    key={item.href}
                    className="anim-menu-item"
                    style={{ animationDelay: `${0.06 * i + 0.1}s` }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-blush-200 py-4 font-display text-3xl text-plum-800"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="container-page flex flex-col gap-3 pb-10">
                <ButtonLink
                  href="#book"
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Book Consultation
                </ButtonLink>
                {/*
                  Closes the menu too. A tel: link hands off to the dialer
                  rather than navigating, so without this the visitor returns
                  from the call to a menu still covering the page — and, because
                  the overlay holds a scroll lock, to a page that will not
                  scroll.
                */}
                <a
                  href={telUrl}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 font-sans text-sm text-muted"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {site.contact.phoneDisplay}
                </a>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
