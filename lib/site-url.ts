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
const CONFIGURED = (process.env.SITE_URL || '').trim();

export const ORIGIN = (CONFIGURED || 'https://dranicolecheverry.com').replace(/\/+$/, '');

/**
 * Whether this build should be allowed into search results.
 *
 * A real deployment is always HTTPS on a hostname. Anything else — a bare IP, a
 * port, plain HTTP — is a preview, and a preview that Google indexes is a
 * genuine problem rather than a cosmetic one: the clinic's page ends up in the
 * index at an address that will stop existing, and on launch day the real
 * domain competes with it for the same content.
 *
 * Deliberately derived rather than configured. A separate "is this production"
 * flag is one more thing to set correctly under time pressure, and the failure
 * is silent in exactly the situation where nobody is checking. The origin
 * already carries the answer, so infer it: the day SITE_URL becomes a real
 * HTTPS domain, indexing switches on by itself.
 */
export const INDEXABLE = (() => {
  // Nothing configured means nobody has said where this is being served from,
  // which is not a state to start inviting Google into. The fallback origin is
  // there so URLs are well-formed, not as a claim that the site is launched.
  if (!CONFIGURED) return false;

  try {
    const { protocol, hostname } = new URL(ORIGIN);
    if (protocol !== 'https:') return false;
    // IPv4 literal, or IPv6 in brackets — never a production hostname.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[')) return false;
    return hostname.includes('.');
  } catch {
    return false;
  }
})();
