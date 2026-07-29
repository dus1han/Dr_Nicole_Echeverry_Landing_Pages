import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { ORIGIN } from '@/lib/site-url';

/** Auto-enumerates every live landing page from content/site.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: ORIGIN, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...site.landingPages
      .filter((page) => page.live)
      .map((page) => ({
        url: `${ORIGIN}/${page.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 1,
      })),
  ];
}
