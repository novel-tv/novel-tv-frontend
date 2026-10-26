import Script from "next/script";

// afterInteractive (not beforeInteractive) — GA doesn't need to block the
// page's own hydration, it just needs to load after the page is usable.
export function GoogleAnalytics({ measurementId }: { measurementId: string | null }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
