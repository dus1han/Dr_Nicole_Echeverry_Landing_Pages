import type { MetadataRoute } from 'next';
import { ORIGIN, INDEXABLE } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  // While the site is served from a preview address — an IP, a port, plain
  // HTTP — keep it out of the index entirely. Getting a clinic page removed
  // from Google after it has been crawled is slow and manual; not being
  // crawled in the first place costs nothing.
  if (!INDEXABLE) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
