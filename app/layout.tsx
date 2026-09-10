import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Hindi News - ताज़ा हिंदी खबरें",
    template: "%s | Hindi News"
  },
  description:
    "भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की ताज़ा खबरें।",
  keywords: [
    "Hindi News",
    "हिंदी न्यूज़",
    "India News",
    "Rajasthan News",
    "Latest News"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
