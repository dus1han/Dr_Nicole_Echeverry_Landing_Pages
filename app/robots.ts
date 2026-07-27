import type { MetadataRoute } from 'next';

const ORIGIN = 'https://dranicolecheverry.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
