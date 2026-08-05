'use client';

import { Phone, CalendarHeart } from 'lucide-react';
import { site, telUrl, whatsappUrl } from '@/content/site';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useScrolledPast } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const WA_MESSAGE =
  "Hi, I'd like to ask about a Mommy Makeover consultation with Dr. Nicole.";

/**
 * Always-on conversion layer — a sticky Call / WhatsApp / Book bar on mobile.
 *
 * It appears only after the hero has scrolled away, so it never competes with
 * the hero's own CTAs. Desktop has no floating element: the sticky navigation
 * already carries a persistent "Book Consultation" button.
 *
 * The bar stays mounted and slides on a CSS transform. It used to be added and
 * removed through AnimatePresence, which meant an animation runtime resident on
 * every page just to move one element 100% down.
 */
export function FloatingCta() {
  const visible = useScrolledPast(600);

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
            href={whatsappUrl(WA_MESSAGE)}
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

      {/* Screen-reader-only fallback so the number is always reachable. */}
      <span className="sr-only">Call {site.contact.phoneDisplay}</span>
    </>
  );
}
