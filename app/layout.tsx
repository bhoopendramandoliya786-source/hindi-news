import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSense";
import { AdsterraSocialBar } from "@/components/AdsterraAds";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Student Update";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - नौकरी, परीक्षा, रिजल्ट, स्कॉलरशिप और छात्र अपडेट`,
    template: `%s | ${siteName}`,
  },
  description: "राजस्थान के छात्रों और नौकरी अभ्यर्थियों के लिए सरकारी भर्ती, परीक्षा, एडमिट कार्ड, आंसर की, रिजल्ट, स्कॉलरशिप, एडमिशन, डॉक्यूमेंट और सरकारी योजनाओं की आधिकारिक जानकारी।",
  keywords: ["Rajasthan Jobs", "RPSC", "RSSB", "REET", "Admit Card", "Result", "Scholarship", "Admission", "सरकारी नौकरी", "परीक्षा", "रिजल्ट", "स्कॉलरशिप"],
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "hi_IN", siteName, title: `${siteName} - छात्रों के जरूरी अपडेट`, description: "नौकरी, परीक्षा, रिजल्ट, स्कॉलरशिप और छात्र काम की जानकारी एक जगह।", url: siteUrl },
  twitter: { card: "summary_large_image", title: `${siteName} - छात्र उपयोगी जानकारी`, description: "नौकरी, परीक्षा, रिजल्ट, स्कॉलरशिप और सरकारी अपडेट।" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: siteName, url: siteUrl };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return <html lang="hi"><head><meta name="google-site-verification" content="mjwnFJ_8h6tNf1HgsE9WVZyprx1aqlRsJQhA8DExR0s" /></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} /><AdSenseScript/><Analytics/><Header/><AdsterraSocialBar/>{children}<Footer/></body></html>;
}
