export type StudentEntity = {
  key: string;
  name: string;
  categorySlug: string;
  count: number;
};

// Stage/action words are removed so the same recruitment/exam/scholarship
// remains one master entity across notification -> admit card -> answer key -> result.
// Keep year/session because 2025 and 2026 (or 2025-26 and 2026-27) are different entities.
const REMOVE_WORDS = new Set([
  "latest", "new", "out", "released", "release", "notification", "notice",
  "online", "form", "apply", "application", "result", "results", "admit",
  "card", "answer", "key", "syllabus", "exam", "date", "dates", "schedule",
  "recruitment", "recruit", "bharti", "vacancy", "vacancies", "final", "provisional",
  "official", "check", "download", "downloadable", "pdf", "direct", "joint",
  "selection", "selected", "shortlist", "merit", "cutoff", "cut", "off",
  "update", "updates", "advertisement", "advt",
  "भर्ती", "भर्तियां", "भर्तियाँ", "परीक्षा", "परिणाम", "रिजल्ट", "एडमिट", "कार्ड",
  "प्रवेश", "पत्र", "उत्तर", "कुंजी", "आंसर", "आवेदन", "फॉर्म", "अधिसूचना", "विज्ञप्ति",
  "पाठ्यक्रम", "तारीख", "तिथियां", "तिथियाँ", "समय-सारणी", "अनुसूची", "चयन", "चयनित",
  "मेरिट", "कटऑफ", "कट-ऑफ", "आपत्ति", "आपत्तियां", "आपत्तियाँ", "स्क्रूटिनी", "परिणाम",
  "सूची", "सूचना", "जारी", "जारीकरण", "डाउनलोड", "ऑनलाइन", "नोटिफिकेशन"
]);

const ACTION_PREFIX = /^(online\s+form|apply\s+online|admit\s+card|answer\s+key|result|final\s+result|exam\s+date|exam\s+schedule|syllabus|recruitment|notification|advertisement|advt|भर्ती|परीक्षा|परिणाम|रिजल्ट|एडमिट\s*कार्ड|उत्तर\s*कुंजी|आंसर\s*की|आवेदन\s*फॉर्म|अधिसूचना|विज्ञप्ति)\s*[:\-–—|]*/i;

function cleanTitle(title: string) {
  return title.replace(ACTION_PREFIX, "").replace(/[|:–—]+/g, " ").replace(/\s+/g, " ").trim();
}

export function getStudentEntityName(title: string) {
  const clean = cleanTitle(title);
  const words = clean.split(" ").filter(Boolean);
  const kept: string[] = [];
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^\p{L}\p{N}.\-/]/gu, "");
    if (!normalized || REMOVE_WORDS.has(normalized)) continue;
    kept.push(word);
    if (kept.length >= 9) break;
  }
  return (kept.length ? kept.join(" ") : clean || title).trim().replace(/\s+/g, " ");
}

export function getStudentEntityKey(title: string, _categorySlug = "student-updates") {
  const name = getStudentEntityName(title);
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (ascii) return `work-${ascii}`;
  return `work-${encodeURIComponent(name).replace(/%/g, "-")}`.slice(0, 180);
}

export function buildStudentEntities(items: { title: string }[], categorySlug: string): StudentEntity[] {
  const map = new Map<string, StudentEntity>();
  for (const item of items) {
    const name = getStudentEntityName(item.title);
    const key = getStudentEntityKey(item.title, categorySlug);
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, name, categorySlug, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "hi"));
}
