import Script from 'next/script';

/**
 * Microsoft Clarity — session recording and heatmaps.
 *
 * The ID comes from the `id` prop, falling back to NEXT_PUBLIC_CLARITY_ID.
 * Same arrangement as `Gtm.tsx` and for the same reason: the project ID lives
 * with the client's other settings in `content/site.ts`, so a project derived
 * from this one replaces it rather than silently recording a second clinic's
 * visitors into Dr. Nicole's dashboard. The env var still wins when set, which
 * is how a staging build points somewhere else.
 *
 * With neither, this renders nothing — no network request, no console noise.
 *
 * WHY THIS IS IN THE PAGE AND NOT IN GTM
 *
 * Clarity ships a GTM template and adding it there would need no deploy, which
 * is the arrangement `content/types.ts` describes for Google Ads pixels. It is
 * here instead because of what Clarity is: it reconstructs the session from
 * the first paint onward. Loaded through GTM it starts a container-load later
 * than the page does, and the opening seconds — the ones that show whether a
 * visitor understood the hero — are the seconds it would miss.
 *
 * `afterInteractive`, deliberately, and NOT `lazyOnload`. That was measured on
 * this site with the GTM container: deferring a heavy third-party script past
 * the load event does not remove its work, it relocates the long tasks to a
 * later, emptier window where nothing overlaps them and Time to Interactive
 * simply moves out to meet them. Total Blocking Time went from 380ms to
 * 1,076ms and the performance score from 79 to 60. See the note in Gtm.tsx.
 *
 * No preconnect for clarity.ms. GTM gets one in app/layout.tsx because it was
 * measured as the slowest origin the page touches and it is on the critical
 * path for conversion tracking. A preconnect here would open a third
 * connection during the window the hero photograph is still fetching, which is
 * the one thing the LCP work on this page was protecting.
 */

const resolveId = (id?: string) => process.env.NEXT_PUBLIC_CLARITY_ID || id || '';

export function ClarityScript({ id }: { id?: string }) {
  const CLARITY_ID = resolveId(id);
  if (!CLARITY_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
