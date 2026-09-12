export const categories = [
  { nameHi: "भारत", nameEn: "India", slug: "india" },
  { nameHi: "राजस्थान", nameEn: "Rajasthan", slug: "rajasthan" },
  { nameHi: "दुनिया", nameEn: "World", slug: "world" },
  { nameHi: "बिज़नेस", nameEn: "Business", slug: "business" },
  { nameHi: "टेक्नोलॉजी", nameEn: "Technology", slug: "technology" },
  { nameHi: "खेल", nameEn: "Sports", slug: "sports" },
  { nameHi: "मनोरंजन", nameEn: "Entertainment", slug: "entertainment" },
  { nameHi: "सरकारी नौकरी", nameEn: "Government Jobs", slug: "jobs" },
] as const;
export type CategorySlug = (typeof categories)[number]["slug"];
export function getCategoryBySlug(slug: string) { return categories.find((category) => category.slug === slug); }
