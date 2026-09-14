export const categories = [
  { nameHi: "सरकारी नौकरी", nameEn: "Government Jobs", slug: "jobs" },
  { nameHi: "परीक्षा", nameEn: "Exams", slug: "exams" },
  { nameHi: "एडमिट कार्ड", nameEn: "Admit Cards", slug: "admit-card" },
  { nameHi: "आंसर की", nameEn: "Answer Keys", slug: "answer-key" },
  { nameHi: "रिजल्ट", nameEn: "Results", slug: "results" },
  { nameHi: "स्कॉलरशिप", nameEn: "Scholarships", slug: "scholarship" },
  { nameHi: "एडमिशन", nameEn: "Admissions", slug: "admission" },
  { nameHi: "डॉक्यूमेंट", nameEn: "Documents", slug: "documents" },
  { nameHi: "सरकारी योजनाएं", nameEn: "Government Schemes", slug: "schemes" },
  { nameHi: "नागरिक सेवाएं", nameEn: "Citizen Services", slug: "citizen-services" },
  { nameHi: "करंट अफेयर्स", nameEn: "Current Affairs", slug: "current-affairs" },
  { nameHi: "राजस्थान छात्र अपडेट", nameEn: "Rajasthan Student Updates", slug: "student-updates" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
