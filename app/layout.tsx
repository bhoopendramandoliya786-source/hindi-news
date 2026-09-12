import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Hindi News - ताज़ा हिंदी खबरें", template: "%s | Hindi News" },
  description: "भारत, राजस्थान, सरकारी नौकरी, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की ताज़ा खबरें।",
  keywords: ["Hindi News", "हिंदी न्यूज़", "Rajasthan News", "राजस्थान न्यूज़", "सरकारी नौकरी", "Latest News"],
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "hi_IN", siteName: "Hindi News", title: "Hindi News - ताज़ा हिंदी खबरें", description: "भारत और राजस्थान की ताज़ा खबरें।", url: siteUrl },
  twitter: { card: "summary_large_image", title: "Hindi News - ताज़ा हिंदी खबरें", description: "भारत और राजस्थान की ताज़ा खबरें।" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hindi News",
    url: siteUrl,
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hindi News",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="hi">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
