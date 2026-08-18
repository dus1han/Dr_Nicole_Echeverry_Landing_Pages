'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * One IntersectionObserver for every reveal on the page.
 *
 * Mounted once in the layout. It replaces ~80 individual Motion components,
 * each of which carried its own observer and animation state — the bulk of a
 * 5,250ms Total Blocking Time on a mid-range phone.
 *
 * It also removes the `no-js` class, which the document carries by default so
 * that a visitor without JavaScript sees the content rather than a page of
 * invisible blocks. Doing it here rather than in an inline script means the
 * fallback is correct even if this bundle never loads.
 */
export function RevealObserver() {
  /*
   * Re-runs on every route change, and that is the whole point.
   *
   * This effect had an empty dependency array. The layout does not remount on a
   * client-side navigation, so it ran exactly once per full page load — and the
   * nodes it observed belonged to whichever page happened to be open at the
   * time. Navigate to another page and its ~95 revealed blocks were never
   * observed by anything, so they sat at opacity 0 forever: a blank page that
   * came right on refresh, because a refresh is a full load.
   *
   * It stayed invisible until the pages started linking to each other. With no
   * internal links every arrival was a full load, which is the one case that
   * worked.
   */
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('no-js');

    const nodes = document.querySelectorAll<HTMLElement>('.rv:not(.is-in)');
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    for (const node of nodes) {
      /*
       * Anything already on screen is shown at once rather than transitioned —
       * an element the visitor is already looking at should not fade in.
       *
       * This was the stated intent but was never implemented: every node went
       * to the observer, and one taller than the viewport can never expose the
       * 15% the threshold asks for, so it stayed invisible while being looked
       * at. Testing the rectangle directly does not care how tall the element
       * is.
       */
      const box = node.getBoundingClientRect();
      const onScreen = box.height > 0 && box.top < window.innerHeight && box.bottom > 0;

      if (onScreen) node.classList.add('is-in');
      else observer.observe(node);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
