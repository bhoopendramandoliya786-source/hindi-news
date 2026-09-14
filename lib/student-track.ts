const STAGE_WORDS = new Set([
  "notification", "recruitment", "recruitment", "bharti", "online", "form", "apply", "application",
  "admit", "card", "answer", "key", "result", "results", "scorecard", "score", "rank", "cutoff", "cut", "merit",
  "exam", "examination", "examdate", "date", "schedule", "syllabus", "objection", "correction", "city", "intimation",
  "counselling", "counseling", "allotment", "selection", "final", "provisional", "revised", "declared", "out",
  "download", "letter", "notice", "official", "update", "latest", "2026", "2027", "2025", "2024", "2023",
]);

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "check", "here", "now", "new", "of", "to", "in", "on",
  "की", "का", "के", "को", "से", "में", "पर", "और", "या", "अब", "यह", "इस", "चेक", "देखें", "जारी", "जारी-",
]);

export function normalizeTrackText(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTrackTokens(title: string) {
  const text = normalizeTrackText(title);
  const tokens = text.split(/\s+/).filter(Boolean);
  const meaningful = tokens.filter((token) => {
    if (STOP_WORDS.has(token) || STAGE_WORDS.has(token)) return false;
    if (/^\d{4}$/.test(token)) return false;
    return token.length >= 3;
  });
  return meaningful.slice(0, 6);
}

export function buildTrackKey(title: string) {
  const tokens = getTrackTokens(title);
  return tokens.length ? tokens.join("-") : normalizeTrackText(title).replace(/\s+/g, "-").slice(0, 90);
}

export function buildTrackLabel(title: string) {
  const tokens = getTrackTokens(title);
  return tokens.length ? tokens.join(" ") : title.trim();
}

export function getTrackYears(title: string) {
  return Array.from(title.matchAll(/\b20\d{2}\b/g)).map((m) => m[0]);
}

export function scoreTrackMatch(title: string, tokens: string[]) {
  const normalized = normalizeTrackText(title);
  const matches = tokens.filter((token) => normalized.includes(token));
  const exactBoost = matches.length === tokens.length ? 20 : 0;
  return matches.length * 10 + exactBoost;
}
