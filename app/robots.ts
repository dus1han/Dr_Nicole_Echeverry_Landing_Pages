import type { MetadataRoute } from 'next';
import { ORIGIN } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
