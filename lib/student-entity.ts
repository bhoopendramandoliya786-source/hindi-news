import { buildEntityKey } from "@/lib/entity-key";

export type StudentEntity = {
  key: string;
  name: string;
  categorySlug: string;
  count: number;
};

export function getStudentEntityKey(title: string, categorySlug = "student-updates", sourceName?: string | null) {
  void categorySlug;
  return buildEntityKey(title, sourceName);
}

export function getStudentEntityName(title: string) {
  const value = title.replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  return value || "Student Update";
}

export function buildStudentEntities(items: { title: string; categorySlug?: string; sourceName?: string | null }[]): StudentEntity[] {
  const map = new Map<string, StudentEntity>();
  for (const item of items) {
    const key = getStudentEntityKey(item.title, item.categorySlug || "student-updates", item.sourceName);
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, name: getStudentEntityName(item.title), categorySlug: item.categorySlug || "student-updates", count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "hi"));
}
