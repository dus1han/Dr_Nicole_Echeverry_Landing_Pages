import Script from 'next/script';

/**
 * Google Tag Manager container.
 *
 * The ID comes from NEXT_PUBLIC_GTM_ID. If it is unset — local development, or
 * before the client has created a container — both components render nothing,
 * so no network request is made and no console noise appears. Nothing else in
 * the codebase needs to know whether analytics is switched on.
 *
 * No Google Ads or GA4 identifiers live in this repo by design: they are
 * configured inside GTM, so a new pixel never requires a deploy.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GtmScript() {
  if (!GTM_ID) return null;

  return (
    <Script id="gtm-container" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

/**
 * The <noscript> half of the container. Must sit immediately after <body> —
 * without it, visitors with JavaScript disabled are invisible to analytics.
 */
export function GtmNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
