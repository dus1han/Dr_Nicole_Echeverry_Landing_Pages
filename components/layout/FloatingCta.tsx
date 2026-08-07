'use client';

import { Phone, CalendarHeart } from 'lucide-react';
import { site, telUrl, whatsappUrl } from '@/content/site';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useScrolledPast } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * Names the treatment the visitor is actually reading about.
 *
 * This was a constant naming Mommy Makeover, so the WhatsApp button on
 * /breast-lift opened a message about the wrong procedure. The treatment comes
 * from the page's slug via the shared registry rather than being written out
 * again here, so a third page cannot repeat it.
 */
const waMessage = (treatment?: string) =>
  treatment
    ? `Hi, I'd like to ask about a ${treatment} consultation with ${site.doctor.shortName}.`
    : `Hi, I'd like to ask about a consultation with ${site.doctor.shortName}.`;

/**
 * Always-on conversion layer — Call / WhatsApp / Book, wherever the visitor is.
 *
 * Two shapes of the same three actions: a bottom bar on phones, where the
 * bottom edge is within thumb reach, and a rail down the right edge from md up,
 * where a bottom bar would sit far from the pointer and cover the page.
 *
 * Both appear only after the hero has scrolled away, so neither competes with
 * the hero's own CTAs, and both stay mounted and slide on a CSS transform —
 * mounting and unmounting them through an animation library meant a runtime
 * resident on every page just to move one element off-screen.
 */
export function FloatingCta({ treatment }: { treatment?: string }) {
  const visible = useScrolledPast(600);

  const rail = [
    { href: telUrl, Icon: Phone, label: 'Call Now', external: false },
    {
      href: whatsappUrl(waMessage(treatment)),
      Icon: WhatsAppIcon,
      label: 'WhatsApp',
      external: true,
    },
    { href: '#book', Icon: CalendarHeart, label: 'Book Now', external: false },
  ];

  return (
    <>
      {/*
        The floating green WhatsApp bubble was removed at the client's request.
        WhatsApp is still reachable from the mobile bar below, the closing CTA
        and the footer.
      */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-gold-400/25 bg-cream/95 backdrop-blur-xl md:hidden',
          'transition-transform duration-300 ease-[var(--ease-out-soft)]',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        // Hidden from assistive tech while it is off-screen, so its three links
        // are not announced as available before they are.
        aria-hidden={!visible}
      >
        <div className="grid grid-cols-3">
          <a
            href={telUrl}
            tabIndex={visible ? undefined : -1}
            className="flex min-h-14 flex-col items-center justify-center gap-1 border-r border-blush-200 text-plum-800"
          >
            <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="font-sans text-[11px] font-semibold">Call</span>
          </a>
          <a
            href={whatsappUrl(waMessage(treatment))}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={visible ? undefined : -1}
            className="flex min-h-14 flex-col items-center justify-center gap-1 border-r border-blush-200 text-plum-800"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            <span className="font-sans text-[11px] font-semibold">WhatsApp</span>
          </a>
          <a
            href="#book"
            tabIndex={visible ? undefined : -1}
            className="flex min-h-14 flex-col items-center justify-center gap-1 bg-[image:var(--gradient-fill)] text-white"
          >
            <CalendarHeart className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="font-sans text-[11px] font-semibold">Book</span>
          </a>
        </div>
      </div>

      {/*
        ---------------- Desktop rail ----------------

        Vertically centred on the right edge, which keeps it clear of both the
        sticky header and the mobile bar's territory, and near the pointer
        wherever the visitor is reading.

        Cream rather than the brand gradient: this sits on top of the page for
        the whole visit, and a saturated block in the corner competes with the
        section it is floating over. The gradient is spent on Book Now alone —
        the one action of the three that is not simply a way to reach the
        clinic — so the eye lands on it first.

        `md:` is exactly where the bottom bar stops, so the two never show at
        once and no width is left without a persistent call to action.
      */}
      <div
        className={cn(
          'fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block',
          'transition-transform duration-300 ease-[var(--ease-out-soft)]',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!visible}
      >
        <ul className="flex flex-col overflow-hidden rounded-l-[var(--radius-md)] border border-r-0 border-blush-200 bg-cream/95 shadow-[var(--shadow-card)] backdrop-blur-xl">
          {rail.map(({ href, Icon, label, external }, i) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                tabIndex={visible ? undefined : -1}
                aria-label={label === 'Call Now' ? `Call ${site.contact.phoneDisplay}` : label}
                className={cn(
                  // 64px wide and at least 64px tall: comfortably past the 44px
                  // target minimum the rest of the page is held to.
                  'group flex w-16 flex-col items-center justify-center gap-1.5 px-1 py-3.5',
                  'transition-colors duration-300',
                  i > 0 && 'border-t border-blush-200',
                  label === 'Book Now'
                    ? 'bg-[image:var(--gradient-fill)] text-white'
                    : 'text-plum-800 hover:bg-blush-50',
                )}
              >
                <Icon
                  className={cn(
                    'h-[19px] w-[19px] transition-transform duration-300 group-hover:scale-110',
                    label === 'Book Now' ? '' : 'text-rose-600',
                  )}
                  aria-hidden="true"
                />
                <span className="text-center font-sans text-[10px] font-semibold leading-tight">
                  {label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Screen-reader-only fallback so the number is always reachable. */}
      <span className="sr-only">Call {site.contact.phoneDisplay}</span>
    </>
  );
}
