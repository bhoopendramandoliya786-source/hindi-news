export type NormalizedNews = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
  externalId: string;
  categorySlug: string;
};

type OfficialSource = {
  url: string;
  source: string;
  defaultCategory: string;
  keywords: string[];
};

const SOURCES: OfficialSource[] = [
  {
    url: "https://rpsc.rajasthan.gov.in/",
    source: "RPSC",
    defaultCategory: "jobs",
    keywords: ["recruitment", "result", "admit", "exam", "answer", "syllabus", "press note", "interview", "advt", "भर्ती", "परिणाम", "परीक्षा", "प्रवेश"],
  },
  {
    url: "https://www.recruitment.rajasthan.gov.in/",
    source: "Rajasthan Recruitment Portal",
    defaultCategory: "jobs",
    keywords: ["recruitment", "apply", "admit", "result", "exam", "answer", "vacancy", "joint recruitment", "भर्ती", "आवेदन", "प्रवेश", "परिणाम"],
  },
  {
    url: "https://sje.rajasthan.gov.in/Scholarship_Portal.aspx",
    source: "Rajasthan Social Justice & Empowerment Department",
    defaultCategory: "scholarship",
    keywords: ["scholarship", "student", "date extension", "scheme", "faq", "blacklist", "biometric", "छात्रवृत्ति", "छात्र", "योजना", "तिथि"],
  },
  {
    url: "https://rajeduboard.rajasthan.gov.in/main.asp",
    source: "RBSE",
    defaultCategory: "results",
    keywords: ["result", "exam", "scholarship", "certificate", "timetable", "board", "परिणाम", "परीक्षा", "छात्रवृत्ति", "प्रमाण-पत्र", "समय-सारणी"],
  },
  {
    url: "https://rajeduboard.rajasthan.gov.in/RESULT2026/Result2026.htm",
    source: "RBSE",
    defaultCategory: "results",
    keywords: ["result", "secondary", "senior secondary", "vocational", "परिणाम", "रिजल्ट"],
  },
  {
    url: "https://rajshaladarpan.rajasthan.gov.in/SD2/VPMS/AdmitCard.aspx",
    source: "Shala Darpan Rajasthan",
    defaultCategory: "admit-card",
    keywords: ["admit card", "scholarship", "प्रवेश पत्र", "छात्रवृत्ति"],
  },
];

function cleanHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(base: string, href: string) {
  try { return new URL(href, base).toString(); } catch { return ""; }
}

function classify(text: string, fallback: string) {
  const value = text.toLowerCase();
  if (/admit|प्रवेश पत्र|प्रवेशपत्र/.test(value)) return "admit-card";
  if (/answer key|model answer|आंसर|उत्तर कुंजी|objection/.test(value)) return "answer-key";
  if (/result|परिणाम|रिजल्ट|cutoff|cut off/.test(value)) return "results";
  if (/scholarship|छात्रवृत्ति|scooty|स्कूटी/.test(value)) return "scholarship";
  if (/admission|प्रवेश|counselling|counseling/.test(value)) return "admission";
  if (/document|certificate|प्रमाण|दस्तावेज/.test(value)) return "documents";
  if (/scheme|योजना|incentive|वजीफा/.test(value)) return "schemes";
  if (/exam|परीक्षा|syllabus|scheme and syllabus|calendar/.test(value)) return "exams";
  if (/job|recruit|vacancy|भर्ती|आवेदन|apply|advertisement|advt|selection|jen|teacher|police/.test(value)) return "jobs";
  return fallback;
}

function externalId(url: string, title: string) {
  return (url || `${title}`)
    .trim()
    .toLowerCase()
    .slice(0, 900);
}

function extractOfficialItems(html: string, source: OfficialSource): NormalizedNews[] {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set<string>();
  const items: NormalizedNews[] = [];

  for (const match of anchors) {
    const href = absoluteUrl(source.url, match[1]);
    const title = cleanHtml(match[2]);
    if (!href || !title || title.length < 10 || title.length > 220) continue;
    if (/javascript:|mailto:|#/.test(href)) continue;
    const haystack = `${title} ${href}`.toLowerCase();
    if (!source.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) continue;
    if (seen.has(href)) continue;
    seen.add(href);

    const categorySlug = classify(title, source.defaultCategory);
    items.push({
      title,
      description: `यह छात्र उपयोगी अपडेट ${source.source} के आधिकारिक स्रोत पर उपलब्ध जानकारी से लिया गया है। जरूरी तारीख, पात्रता, आवेदन या परिणाम जैसी जानकारी के लिए मूल आधिकारिक पेज देखें।`,
      imageUrl: null,
      sourceName: source.source,
      sourceUrl: href,
      publishedAt: new Date(),
      externalId: externalId(href, title),
      categorySlug,
    });
  }

  if (!items.length) {
    items.push({
      title: `${source.source}: आधिकारिक छात्र अपडेट`,
      description: `इस स्रोत पर उपलब्ध छात्र, परीक्षा, भर्ती, रिजल्ट या योजना से जुड़ी आधिकारिक जानकारी देखें।`,
      imageUrl: null,
      sourceName: source.source,
      sourceUrl: source.url,
      publishedAt: new Date(),
      externalId: externalId(source.url, source.source),
      categorySlug: source.defaultCategory,
    });
  }

  return items.slice(0, 25);
}

async function fetchSource(source: OfficialSource) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(source.url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StudentInfoBot/1.0; +https://hindi-news-omega.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return extractOfficialItems(await response.text(), source);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const sources = SOURCES.filter((source) => source.defaultCategory === categorySlug);
  const results = await Promise.allSettled(sources.map(fetchSource));
  return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const seen = new Set<string>();
  return results
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .filter((item) => {
      if (seen.has(item.externalId)) return false;
      seen.add(item.externalId);
      return true;
    });
}
