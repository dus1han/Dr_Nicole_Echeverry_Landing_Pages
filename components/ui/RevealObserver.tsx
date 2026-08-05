'use client';

import { useEffect } from 'react';

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
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('no-js');

    const nodes = document.querySelectorAll<HTMLElement>('.rv:not(.is-in)');
    if (!nodes.length) return;

    // Anything already on screen at load is shown immediately rather than
    // transitioned — an element the visitor is looking at should not fade in.
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

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return null;
}
