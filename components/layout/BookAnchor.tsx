'use client';

import { useEffect } from 'react';

/**
 * Makes every "Book" link land in the right place for the viewport.
 *
 * Desktop: scroll to the booking SECTION, so the heading is read first and the
 * form arrives in context rather than as a bare card.
 *
 * Mobile: scroll straight to the FORM, so the heading does not sit between the
 * tap and the first input — the visitor has already decided; don't make her
 * scroll again to act on it.
 *
 * Delegated from the document, so it covers every `#book` link on the page
 * (nav, hero, section CTAs, the mobile bar) with no per-link wiring.
 */
const MOBILE_QUERY = '(max-width: 1023px)';

export function BookAnchor() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Let modified clicks (new tab/window) behave normally.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href="#book"]');
      if (!link) return;

      const useForm = window.matchMedia(MOBILE_QUERY).matches;
      const destination = document.getElementById(useForm ? 'book-form' : 'book');
      if (!destination) return; // fall through to the default anchor jump

      event.preventDefault();
      event.stopPropagation();

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      destination.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });

      // Keep the URL meaningful without triggering a second jump.
      history.replaceState(null, '', '#book');
    };

    /*
     * Capture phase, not bubble.
     *
     * These CTAs render as next/link, whose own click handler runs on the
     * anchor itself and calls preventDefault. A document-level bubble listener
     * fires after that, so the handler either saw `defaultPrevented` and bailed
     * or fought the router's own scroll. Capturing on the document runs this
     * first, so the viewport-aware target always wins.
     */
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
