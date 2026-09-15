const STAGE_WORDS = [
  "notification", "notice", "apply", "application", "admit", "admit card", "hall ticket", "answer key", "answer", "result", "results", "परिणाम", "रिजल्ट", "प्रवेश पत्र", "उत्तर कुंजी", "आंसर की", "exam date", "exam", "examination", "परीक्षा", "syllabus", "calendar", "schedule", "city intimation", "objection", "cut off", "cutoff", "merit list", "merit", "shortlist", "document verification", "scrutiny", "counselling", "counseling", "seat allotment", "admission", "admit-card", "scholarship status", "application status", "payment status", "status", "recruitment", "भर्ती", "आवेदन", "आवेदन पत्र", "जारी", "जारी हुआ", "जारी किए", "डाउनलोड", "अपडेट", "update", "latest", "today", "new"
];

const STOP_WORDS = new Set([
  "official", "officially", "website", "portal", "government", "govt", "राजस्थान", "सरकार", "सरकारी", "department", "departmental", "विभाग", "जानकारी", "सूचना", "जारी", "देखें", "यहां", "यहाँ", "के", "का", "की", "में", "से", "पर", "और", "या", "for", "the", "of", "and", "to", "in", "on", "from", "with", "latest", "update", "news"
]);

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[()\[\]{}:;|,./\\]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

export function buildEntityKey(title: string, sourceName?: string | null) {
  let value = normalize(title);
  for (const stage of STAGE_WORDS) {
    value = value.replace(new RegExp(`\\b${stage.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "giu"), " ");
  }
  if (sourceName) {
    const source = normalize(sourceName);
    if (source.length >= 3) value = value.replace(new RegExp(`\\b${source.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "giu"), " ");
  }
  const tokens = value.split(" ").filter(Boolean).filter((token) => !STOP_WORDS.has(token));
  const meaningful = tokens.filter((token) => token.length >= 2);
  const key = slug(meaningful.slice(0, 14).join(" "));
  return key || slug(normalize(title)) || "student-update";
}
