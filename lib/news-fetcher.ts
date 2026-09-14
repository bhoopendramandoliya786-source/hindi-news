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

// Rajasthan-first official monitoring layer. New sources can be appended here
// without changing the saving or page-generation pipeline.
const SOURCES: OfficialSource[] = [
  {
    url: "https://rpsc.rajasthan.gov.in/",
    source: "RPSC",
    defaultCategory: "jobs",
    keywords: ["recruitment", "result", "admit", "exam", "answer", "syllabus", "press note", "interview", "advt", "recruit", "भर्ती", "परिणाम", "परीक्षा", "प्रवेश", "उत्तर कुंजी"],
  },
  {
    url: "https://www.recruitment.rajasthan.gov.in/",
    source: "Rajasthan Recruitment Portal",
    defaultCategory: "jobs",
    keywords: ["recruitment", "apply", "admit", "result", "exam", "answer", "vacancy", "joint recruitment", "appointment", "otr", "objection", "scrutiny", "भर्ती", "आवेदन", "प्रवेश", "परिणाम", "उत्तर कुंजी", "नियुक्ति"],
  },
  {
    url: "https://police.rajasthan.gov.in/old/Home.aspx",
    source: "Rajasthan Police",
    defaultCategory: "jobs",
    keywords: ["recruitment", "result", "answer key", "admit card", "constable", "sub inspector", "police", "भर्ती", "परिणाम", "उत्तर कुंजी", "प्रवेश पत्र", "पुलिस"],
  },
  {
    url: "https://police.rajasthan.gov.in/old/Results.aspx",
    source: "Rajasthan Police",
    defaultCategory: "results",
    keywords: ["result", "answer key", "constable", "sub inspector", "recruitment", "परिणाम", "उत्तर कुंजी", "भर्ती"],
  },
  {
    url: "https://sje.rajasthan.gov.in/Scholarship_Portal.aspx",
    source: "Rajasthan Social Justice & Empowerment Department",
    defaultCategory: "scholarship",
    keywords: ["scholarship", "student", "date extension", "scheme", "faq", "blacklist", "biometric", "otr", "application", "status", "छात्रवृत्ति", "छात्र", "योजना", "तिथि", "आवेदन", "स्थिति"],
  },
  {
    url: "https://scholarship.rajasthan.gov.in/",
    source: "Rajasthan Scholarship Portal",
    defaultCategory: "scholarship",
    keywords: ["scholarship", "scheme", "student", "application", "status", "academic year", "college education", "merit", "छात्रवृत्ति", "योजना", "आवेदन", "स्थिति", "शैक्षणिक सत्र"],
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
    keywords: ["result", "exam", "scholarship", "certificate", "timetable", "board", "scrutiny", "supplementary", "परिणाम", "परीक्षा", "छात्रवृत्ति", "प्रमाण-पत्र", "समय-सारणी", "पूरक", "स्क्रूटिनी"],
  },
  {
    url: "https://rajeduboard.rajasthan.gov.in/RESULT2026/Result2026.htm",
    source: "RBSE",
    defaultCategory: "results",
    keywords: ["result", "secondary", "senior secondary", "vocational", "praveshika", "varishtha", "deaf", "cwsn", "परिणाम", "रिजल्ट"],
  },
  {
    url: "https://rajshaladarpan.rajasthan.gov.in/SD4/Home/Public2/Default.aspx",
    source: "Integrated Shala Darpan Rajasthan",
    defaultCategory: "student-updates",
    keywords: ["result", "circular", "news", "admission", "student", "school", "exam", "class 5", "class 8", "press release", "परिणाम", "प्रवेश", "छात्र", "विद्यालय", "परीक्षा", "कक्षा"],
  },
  {
    url: "https://rajshaladarpan.rajasthan.gov.in/SD1/StudentAdmission/Home/HomePage.aspx",
    source: "Shala Darpan Rajasthan",
    defaultCategory: "admission",
    keywords: ["admission", "application", "lottery", "selected", "merit", "school", "राजकीय विद्यालय", "प्रवेश", "आवेदन", "लॉटरी", "चयन", "मेरिट"],
  },
  {
    url: "https://rajshaladarpan.rajasthan.gov.in/Class5th_8thExam/Home/Result.aspx/Schedule.aspx",
    source: "Shala Darpan 5th & 8th Exam",
    defaultCategory: "results",
    keywords: ["result", "admit card", "exam time table", "schedule", "class 5", "class 8", "परिणाम", "प्रवेश पत्र", "समय सारणी", "कक्षा 5", "कक्षा 8"],
  },
  {
    url: "https://dceapp.rajasthan.gov.in/",
    source: "Department of College Education Rajasthan",
    defaultCategory: "admission",
    keywords: ["admission", "merit", "waiting", "college", "course", "fee", "renewal", "schedule", "प्रवेश", "मेरिट", "महाविद्यालय", "पाठ्यक्रम", "शुल्क", "नवीनीकरण"],
  },
  {
    url: "https://hte.rajasthan.gov.in/",
    source: "Higher & Technical Education Rajasthan",
    defaultCategory: "education",
    keywords: ["admission", "exam", "result", "university", "college", "technical", "notice", "education", "प्रवेश", "परीक्षा", "परिणाम", "विश्वविद्यालय", "महाविद्यालय", "तकनीकी", "शिक्षा"],
  },
  {
    url: "https://janaadhaar.rajasthan.gov.in/content/raj/janaadhaar/hi/home.html",
    source: "Rajasthan Jan Aadhaar",
    defaultCategory: "citizen-services",
    keywords: ["latest news", "enrolment", "e-kyc", "verification", "e-card", "update", "scheme", "eligibility", "आधार", "जन आधार", "ई-केवाईसी", "सत्यापन", "ई-कार्ड", "संशोधन", "योजना", "पात्रता"],
  },
  {
    url: "https://janaadhaar.rajasthan.gov.in/content/raj/janaadhaar/hi/important-websites.html",
    source: "Rajasthan Jan Aadhaar",
    defaultCategory: "citizen-services",
    keywords: ["rajasthan sampark", "e-mitra", "jan suchana", "uidai", "important websites", "महत्वपूर्ण वेबसाइट", "ई-मित्र", "जन सूचना"],
  },
  {
    url: "https://emitra.rajasthan.gov.in/emitraApps",
    source: "Rajasthan e-Mitra",
    defaultCategory: "citizen-services",
    keywords: ["news", "circular", "office order", "service", "transaction", "verification", "certificate", "application", "government services", "समाचार", "परिपत्र", "सेवा", "लेनदेन", "प्रमाण पत्र", "आवेदन"],
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
  if (/result|परिणाम|रिजल्ट|cutoff|cut off|merit result/.test(value)) return "results";
  if (/scholarship|छात्रवृत्ति|scooty|स्कूटी|otr/.test(value)) return "scholarship";
  if (/admission|प्रवेश|counselling|counseling|merit|waiting list|lottery/.test(value)) return "admission";
  if (/document|certificate|प्रमाण|दस्तावेज/.test(value)) return "documents";
  if (/jan aadhaar|जन आधार|e-mitra|ई-मित्र|sampark|जन सूचना|citizen service|transaction status|enrolment|e-kyc/.test(value)) return "citizen-services";
  if (/scheme|योजना|incentive|वजीफा|beneficiary|लाभार्थी/.test(value)) return "schemes";
  if (/exam|परीक्षा|syllabus|scheme and syllabus|calendar|time table|timetable/.test(value)) return "exams";
  if (/job|recruit|vacancy|भर्ती|आवेदन|apply|advertisement|advt|selection|jen|teacher|police|constable|sub inspector/.test(value)) return "jobs";
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
  const yearMatch = title.match(/(?:19|20)\d{2}(?:-\d{2})?/);
  const yearText = yearMatch ? ` यह रिकॉर्ड ${yearMatch[0]} से जुड़ा दिख रहा है, इसलिए पुराने और नए वर्ष के अपडेट को अलग रखें।` : "";
  const action = categorySlug === "jobs"
    ? "पहले official notice में योग्यता, आयु, शुल्क, तारीख और दस्तावेज मिलाएं; पात्र होने पर आवेदन या अगला चरण official portal से ही करें।"
    : categorySlug === "admit-card"
      ? "official page से admit card डाउनलोड करके नाम, रोल नंबर, परीक्षा केंद्र और परीक्षा निर्देश तुरंत जांचें।"
      : categorySlug === "answer-key"
        ? "official answer key से अपने उत्तर मिलाएं और objection window उपलब्ध हो तो उसी official प्रक्रिया से आपत्ति दर्ज करें।"
        : categorySlug === "results"
          ? "official result page पर अपना परिणाम देखें और आगे की प्रक्रिया official notice के अनुसार करें।"
          : categorySlug === "scholarship"
            ? "अपने session और scheme के अनुसार eligibility, OTR, documents, application/status और verification की स्थिति official portal पर जांचें।"
            : categorySlug === "admission"
              ? "official notice में eligibility, dates, documents, merit/counselling और fee process जांचें।"
              : categorySlug === "citizen-services"
                ? "यह सेवा/नोटिस आपके Jan Aadhaar, e-Mitra, verification, certificate या दूसरी नागरिक सेवा से जुड़ा हो सकता है; पहले प्रक्रिया और जरूरी दस्तावेज समझें, फिर official service पर जाएं।"
                : categorySlug === "schemes"
                  ? "अपनी class, category, gender, income और अन्य लागू शर्तों के अनुसार official scheme details जांचें।"
                  : categorySlug === "exams"
                    ? "official notice से परीक्षा तारीख, syllabus, instructions और आगे की प्रक्रिया मिलाएं।"
                    : "इस update का सही मतलब official source से समझें और लागू action केवल official portal पर करें।";

  const context = lower.includes("date") || lower.includes("extension") || lower.includes("तिथि")
    ? "यह तारीख/समय-सीमा से जुड़ा अपडेट हो सकता है, इसलिए पुरानी जानकारी के बजाय इसी official notice को अंतिम मानें।"
    : lower.includes("faq") || lower.includes("help") || lower.includes("manual")
      ? "यह जानकारी प्रक्रिया समझने में मदद कर सकती है; आवेदन से पहले संबंधित official instructions पढ़ें।"
      : "यह पेज official source की जानकारी को छात्र/नागरिक के काम के हिसाब से आसान भाषा में समझाता है; अंतिम तथ्य मूल official page से ही सत्यापित करें।";

  return `क्या अपडेट है?\n${title}\n\nकिसके काम का है?\n${source.source} से आया यह update संबंधित छात्रों, अभ्यर्थियों या राजस्थान के नागरिकों के लिए उपयोगी हो सकता है।${yearText}\n\nअभी क्या करें?\n${action}\n\nक्या verify करें?\n${context}\n\nOfficial source\n${source.source}: ${sourceUrl}`;
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
    const title = `${source.source}: आधिकारिक छात्र/नागरिक अपडेट`;
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

  return items.slice(0, 30);
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
