/**
 * The public origin this site is served from.
 *
 * Canonical URLs, `sitemap.xml`, `robots.txt` and the JSON-LD all have to agree
 * on one hostname. Getting it wrong is quiet and expensive: Google indexes the
 * wrong host, canonical tags point somewhere that 404s, and structured data is
 * rejected — none of which shows up when you look at the page.
 *
 * Baked in at BUILD time, and passed as a Docker build arg accordingly.
 *
 * Not because of `NEXT_PUBLIC_*` — this never reaches the browser — but because
 * every consumer is statically prerendered. `sitemap.xml`, `robots.txt` and the
 * canonical/OG tags are generated once during `next build`, which is what makes
 * the site fast. Setting `SITE_URL` on the running container therefore changes
 * nothing at all, and changing the hostname means a rebuild, not a restart.
 *
 * Verified the hard way: setting it in the container's environment and
 * restarting left `sitemap.xml` still advertising the old host.
 *
 * No trailing slash, or every generated URL gets a double one.
 */
export const ORIGIN = (process.env.SITE_URL || 'https://dranicolecheverry.com').replace(/\/+$/, '');
