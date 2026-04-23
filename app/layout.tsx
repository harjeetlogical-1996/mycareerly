import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getSettings, SETTING_KEYS } from "./lib/settings";
import { SITE_URL } from "./lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyCareerly | Find Local Flower Shops Near You",
    template: "%s | MyCareerly",
  },
  description:
    "Find verified local flower shops near you across the USA. Browse 200+ trusted florists, read expert flower guides, and discover fresh flowers for every occasion.",
  keywords: [
    "flower shops near me",
    "local florists USA",
    "buy flowers online",
    "flower delivery",
    "best florists",
    "flower shop directory",
    "fresh flowers",
    "flower bouquet",
    "rose delivery",
    "wedding flowers",
  ],
  authors: [{ name: "MyCareerly" }],
  creator: "MyCareerly",
  publisher: "MyCareerly",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MyCareerly",
    title: "MyCareerly | America's Flower Shop Directory",
    description:
      "Find verified local flower shops near you. 200+ trusted florists across the USA, expert flower guides, and same-day delivery options.",
    images: [
      {
        url: "/images/articles/cover-7-popular-flowers.jpg",
        width: 1200,
        height: 630,
        alt: "MyCareerly - America's Flower Shop Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyCareerly | Find Local Flower Shops Near You",
    description:
      "America's trusted flower shop directory. Discover verified local florists, expert guides, and fresh flowers for every occasion.",
    images: ["/images/articles/cover-7-popular-flowers.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "directory",
  applicationName: "MyCareerly",
};

export const viewport = {
  themeColor: "#E8705A",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load analytics + verification settings (admin-configurable)
  const s = await getSettings([
    SETTING_KEYS.GA4_MEASUREMENT_ID,
    SETTING_KEYS.GSC_VERIFICATION,
    SETTING_KEYS.BING_VERIFICATION,
    SETTING_KEYS.YANDEX_VERIFICATION,
    SETTING_KEYS.PINTEREST_VERIFICATION,
    SETTING_KEYS.FB_PIXEL_ID,
    SETTING_KEYS.CLARITY_ID,
  ]);

  const ga4 = s[SETTING_KEYS.GA4_MEASUREMENT_ID];
  const gsc = s[SETTING_KEYS.GSC_VERIFICATION];
  const bing = s[SETTING_KEYS.BING_VERIFICATION];
  const yandex = s[SETTING_KEYS.YANDEX_VERIFICATION];
  const pinterest = s[SETTING_KEYS.PINTEREST_VERIFICATION];
  const fbPixel = s[SETTING_KEYS.FB_PIXEL_ID];
  const clarity = s[SETTING_KEYS.CLARITY_ID];

  return (
    <html lang="en-US" className={`${poppins.variable} h-full antialiased scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        {/* Performance: preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* RSS / Atom feed (future-proof) */}
        <link rel="alternate" type="application/rss+xml" title="MyCareerly Articles" href="/feed.xml" />

        {/* Search engine verification tags — populated from admin settings */}
        {gsc && <meta name="google-site-verification" content={gsc} />}
        {bing && <meta name="msvalidate.01" content={bing} />}
        {yandex && <meta name="yandex-verification" content={yandex} />}
        {pinterest && <meta name="p:domain_verify" content={pinterest} />}
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)] bg-[#FAFAF8] text-[#1A1A1A]">
        {children}

        {/* Google Analytics 4 */}
        {ga4 && /^G-[A-Z0-9]+$/i.test(ga4) && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4}', { send_page_view: true });
            `}</Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {clarity && (
          <Script id="ms-clarity" strategy="afterInteractive">{`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarity}");
          `}</Script>
        )}

        {/* Meta (Facebook) Pixel */}
        {fbPixel && /^\d+$/.test(fbPixel) && (
          <Script id="fb-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixel}'); fbq('track', 'PageView');
          `}</Script>
        )}
      </body>
    </html>
  );
}
