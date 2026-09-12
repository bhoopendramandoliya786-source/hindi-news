import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSense";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Hindi News";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} - ताज़ा हिंदी खबरें`, template: `%s | ${siteName}` },
  description: "भारत, राजस्थान, सरकारी नौकरी, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की ताज़ा हिंदी खबरें।",
  keywords: ["Hindi News", "हिंदी न्यूज़", "Rajasthan News", "राजस्थान न्यूज़", "सरकारी नौकरी", "Latest News"],
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "hi_IN", siteName, title: `${siteName} - ताज़ा हिंदी खबरें`, description: "भारत, राजस्थान और दुनिया की ताज़ा खबरें।", url: siteUrl },
  twitter: { card: "summary_large_image", title: `${siteName} - ताज़ा हिंदी खबरें`, description: "भारत, राजस्थान और दुनिया की ताज़ा खबरें।" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: siteName, url: siteUrl };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return (
    <html lang="hi">
      <head>
        <meta name="google-site-verification" content="mjwnFJ_8h6tNf1HgsE9WVZyprx1aqlRsJQhA8DExR0s" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
        <AdSenseScript />
        <Analytics />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
