export type StudentEntity = {
  key: string;
  name: string;
  categorySlug: string;
  count: number;
};

// Words that describe the stage/action, not the actual recruitment, exam,
// result, scholarship, admission or service being tracked.
const REMOVE_WORDS = new Set([
  "latest", "new", "out", "released", "release", "notification", "notice",
  "online", "form", "apply", "application", "result", "results", "admit",
  "card", "answer", "key", "syllabus", "exam", "date", "dates", "schedule",
  "recruitment", "recruit", "bharti", "vacancy", "vacancies", "final", "provisional",
  "official", "check", "download", "downloadable", "pdf", "direct", "joint",
  "selection", "selected", "shortlist", "merit", "cutoff", "cut", "off",
  "update", "updates", "notification", "advertisement", "advt"
]);

const ACTION_PREFIX = /^(online\s+form|apply\s+online|admit\s+card|answer\s+key|result|final\s+result|exam\s+date|exam\s+schedule|syllabus|recruitment|notification|advertisement|advt)\s*[:\-–—|]*/i;

function cleanTitle(title: string) {
  return title
    .replace(ACTION_PREFIX, "")
    .replace(/[|:–—]+/g, " ")
    // Keep years/session in the identity. This prevents SSC CGL 2025 and
    // SSC CGL 2026, or Scholarship 2025-26 and 2026-27, from being merged.
    .replace(/\s+/g, " ")
    .trim();
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

  // Prefer an identity that contains the year/session when the title has one.
  // The final fallback still works for Hindi-only titles.
  const identity = (kept.length ? kept.join(" ") : clean || title).trim();
  return identity.replace(/\s+/g, " ");
}

export function getStudentEntityKey(title: string, _categorySlug = "student-updates") {
  const name = getStudentEntityName(title);
  const ascii = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // IMPORTANT: do not include categorySlug here. A recruitment is one entity
  // across jobs → exam → admit card → answer key → result → selection.
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
