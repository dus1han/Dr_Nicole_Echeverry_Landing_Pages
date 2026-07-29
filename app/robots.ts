import type { MetadataRoute } from 'next';
import { ORIGIN, INDEXABLE } from '@/lib/site-url';

/**
 * Google Ads crawls landing pages with AdsBot to assess quality and policy, and
 * an ad whose destination it cannot fetch is disapproved as "destination not
 * crawlable" — the campaign stops, not just the SEO.
 *
 * AdsBot ignores `User-agent: *` by design, so the preview disallow below does
 * not actually block it. That is worth stating rather than relying on: the
 * behaviour is non-obvious, and someone tightening robots.txt later would have
 * no way to know they were about to take the ads down with it.
 *
 * Serving ads and being indexed are unrelated. A noindex page runs ads
 * perfectly well.
 */
const ADS_BOTS = ['AdsBot-Google', 'AdsBot-Google-Mobile'];

export default function robots(): MetadataRoute.Robots {
  // While the site is served from a preview address — an IP, a port, plain
  // HTTP — keep it out of the index entirely. Getting a clinic page removed
  // from Google after it has been crawled is slow and manual; not being
  // crawled in the first place costs nothing.
  if (!INDEXABLE) {
    return {
      rules: [
        { userAgent: '*', disallow: '/' },
        { userAgent: ADS_BOTS, allow: '/' },
      ],
    };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      { userAgent: ADS_BOTS, allow: '/' },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
