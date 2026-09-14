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
    keywords: ["recruitment", "apply", "admit", "result", "exam", "answer", "vacancy", "joint recruitment", "भर्ती", "आवेदन", "प्रवेश", "परिणाम", "otr"],
  },
  {
    url: "https://sje.rajasthan.gov.in/Scholarship_Portal.aspx",
    source: "Rajasthan Social Justice & Empowerment Department",
    defaultCategory: "scholarship",
    keywords: ["scholarship", "student", "date extension", "scheme", "faq", "blacklist", "biometric", "otr", "छात्रवृत्ति", "छात्र", "योजना", "तिथि"],
  },
  {
    url: "https://scholarships.gov.in/",
    source: "National Scholarship Portal (NSP)",
    defaultCategory: "scholarship",
    keywords: ["scholarship", "student", "academic year", "2026-27", "otr", "application", "verification", "merit", "welfare"],
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
  {
    url: "https://rajshaladarpan.rajasthan.gov.in/ShalaSamvad/Home/SchemeSearch.aspx",
    source: "Shala Samvad Rajasthan",
    defaultCategory: "schemes",
    keywords: ["student beneficiary", "scheme", "beneficiary", "student", "scheme search", "योजना", "लाभार्थी", "छात्र"],
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
  if (/scholarship|छात्रवृत्ति|scooty|स्कूटी|otr/.test(value)) return "scholarship";
  if (/admission|प्रवेश|counselling|counseling/.test(value)) return "admission";
  if (/document|certificate|प्रमाण|दस्तावेज/.test(value)) return "documents";
  if (/scheme|योजना|incentive|वजीफा|beneficiary|लाभार्थी/.test(value)) return "schemes";
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

function buildStudentDescription(title: string, source: OfficialSource, categorySlug: string, sourceUrl: string) {
  const lower = title.toLowerCase();
  const action = categorySlug === "jobs"
    ? "अगर आप इस भर्ती से जुड़े हैं, तो पहले official notice में योग्यता, आयु, शुल्क, तारीख और दस्तावेज मिलाएं; पात्र होने पर आवेदन/अगला चरण official portal से ही करें।"
    : categorySlug === "admit-card"
      ? "अगर आपका admit card जारी हुआ है, तो official page से डाउनलोड करके नाम, रोल नंबर, परीक्षा केंद्र और परीक्षा निर्देश तुरंत जांचें।"
      : categorySlug === "answer-key"
        ? "अगर आपने परीक्षा दी है, तो official answer key से उत्तर मिलाएं और objection window उपलब्ध हो तो उसी official प्रक्रिया से आपत्ति दर्ज करें।"
        : categorySlug === "results"
          ? "अगर आप इस परीक्षा/परिणाम से जुड़े उम्मीदवार हैं, तो official result page पर अपना परिणाम देखें और आगे की प्रक्रिया official notice के अनुसार करें।"
          : categorySlug === "scholarship"
            ? "अगर आप छात्रवृत्ति लेना चाहते हैं, तो अपने session और scheme के अनुसार eligibility, OTR, documents, application/status और verification की स्थिति official portal पर जांचें।"
            : categorySlug === "schemes"
              ? "अगर आप किसी सरकारी योजना का लाभ देख रहे हैं, तो अपनी class, category, gender, income और अन्य लागू शर्तों के अनुसार official scheme details जांचें।"
              : categorySlug === "exams"
                ? "अगर यह परीक्षा आपके लिए लागू है, तो official notice से परीक्षा तारीख, syllabus, instructions और आगे की प्रक्रिया मिलाएं।"
                : categorySlug === "admission"
                  ? "अगर आप admission लेने वाले हैं, तो official notice में eligibility, dates, documents और counselling/application process जांचें।"
                  : "इस update का सही मतलब title और official source से समझें और यदि कोई action आपके लिए लागू है तो केवल official portal पर करें।";

  const context = lower.includes("date") || lower.includes("extension") || lower.includes("तिथि")
    ? "यह अपडेट तारीख/समय-सीमा से जुड़ा हो सकता है, इसलिए पुरानी जानकारी के बजाय इसी official notice को अंतिम मानें।"
    : lower.includes("faq") || lower.includes("help") || lower.includes("manual")
      ? "यह जानकारी प्रक्रिया समझने में मदद कर सकती है; आवेदन से पहले संबंधित official instructions जरूर पढ़ें।"
      : "यह पेज official source की जानकारी को छात्र के काम के हिसाब से आसान भाषा में समझाता है; अंतिम तथ्य मूल official page से ही सत्यापित करें।";

  return `क्या अपडेट है?\n${title}\n\nकिसके काम का है?\n${source.source} से आया यह update ${categorySlug === "jobs" ? "नौकरी/भर्ती उम्मीदवारों" : categorySlug === "scholarship" ? "छात्रवृत्ति लेने वाले छात्रों" : "संबंधित छात्रों या अभ्यर्थियों"} के लिए उपयोगी है।\n\nअभी क्या करें?\n${action}\n\nध्यान रखें\n${context}\n\nOfficial source\n${source.source}: ${sourceUrl}`;
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
      description: buildStudentDescription(title, source, categorySlug, href),
      imageUrl: null,
      sourceName: source.source,
      sourceUrl: href,
      publishedAt: new Date(),
      externalId: externalId(href, title),
      categorySlug,
    });
  }

  if (!items.length) {
    const title = `${source.source}: आधिकारिक छात्र अपडेट`;
    items.push({
      title,
      description: buildStudentDescription(title, source, source.defaultCategory, source.url),
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
