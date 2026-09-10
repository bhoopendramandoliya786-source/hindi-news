export function createSlug(title: string, suffix?: string) {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const base = cleanTitle || "news";

  return suffix ? `${base}-${suffix}` : base;
}
