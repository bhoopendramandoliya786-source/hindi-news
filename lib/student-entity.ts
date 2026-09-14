export type StudentEntity = {
  key: string;
  name: string;
  categorySlug: string;
  count: number;
};

const REMOVE_WORDS = new Set([
  "latest", "new", "out", "released", "release", "notification", "notice",
  "online", "form", "apply", "application", "result", "results", "admit",
  "card", "answer", "key", "syllabus", "exam", "date", "dates", "schedule",
  "recruitment", "bharti", "vacancy", "vacancies", "final", "provisional",
  "official", "check", "download", "downloadable", "2024", "2025", "2026", "2027",
  "2028", "2029", "2030", "out", "pdf"
]);

const ACTION_PREFIX = /^(online\s+form|apply\s+online|admit\s+card|answer\s+key|result|final\s+result|exam\s+date|exam\s+schedule|syllabus|recruitment|notification)\s*[:\-–—|]*/i;

function cleanTitle(title: string) {
  return title
    .replace(ACTION_PREFIX, "")
    .replace(/[|:–—-]+/g, " ")
    .replace(/\b(202[4-9]|2030)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getStudentEntityName(title: string) {
  const clean = cleanTitle(title);
  const words = clean.split(" ").filter(Boolean);
  const kept: string[] = [];
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^\p{L}\p{N}.]/gu, "");
    if (!normalized || REMOVE_WORDS.has(normalized)) continue;
    kept.push(word);
    if (kept.length >= 7) break;
  }
  return (kept.length ? kept.join(" ") : clean || title).trim();
}

export function getStudentEntityKey(title: string, categorySlug = "student-updates") {
  const name = getStudentEntityName(title);
  const ascii = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii) return `${categorySlug}-${ascii}`;
  return `${categorySlug}-${encodeURIComponent(name).replace(/%/g, "-")}`.slice(0, 180);
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
