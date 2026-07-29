/**
 * The public origin this site is served from.
 *
 * Canonical URLs, `sitemap.xml`, `robots.txt` and the JSON-LD all have to agree
 * on one hostname. Getting it wrong is quiet and expensive: Google indexes the
 * wrong host, canonical tags point somewhere that 404s, and structured data is
 * rejected — none of which shows up when you look at the page.
 *
 * Read at RUNTIME, not build time. It is deliberately not `NEXT_PUBLIC_*` —
 * everything that consumes it renders on the server, so pointing the site at a
 * new domain is an environment change plus a container restart, not a rebuild
 * and redeploy. That matters when DNS lands at an awkward moment.
 *
 * No trailing slash, or every generated URL gets a double one.
 */
export const ORIGIN = (process.env.SITE_URL || 'https://dranicolecheverry.com').replace(/\/+$/, '');
