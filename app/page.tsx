import type { Metadata } from "next";
import StudentPortalHome from "@/components/StudentPortalHome";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Student Update | भारत और राजस्थान छात्रों के सरकारी काम की आधिकारिक जानकारी",
  description: "भारत और राजस्थान के छात्रों तथा नौकरी अभ्यर्थियों के लिए सरकारी भर्ती, परीक्षा, एडमिट कार्ड, आंसर की, रिजल्ट, छात्रवृत्ति, एडमिशन, शिक्षा और सरकारी सेवाओं की आधिकारिक जानकारी।",
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "Student Update | छात्रों के जरूरी सरकारी काम", description: "खबर नहीं—भर्ती, परीक्षा, रिजल्ट, स्कॉलरशिप और एडमिशन का पूरा काम आसान हिंदी में समझें।", url: "/" },
};

export default function HomePage() {
  return <StudentPortalHome />;
}
