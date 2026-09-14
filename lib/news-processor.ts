import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & { slug: string; content: string };

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const categoryHelp: Record<string, { label: string; steps: string[] }> = {
  jobs: { label: "सरकारी नौकरी", steps: ["आधिकारिक विज्ञापन खोलें", "पात्रता और जरूरी शर्तें जांचें", "दस्तावेज तैयार रखें", "आवेदन/आगे की कार्रवाई केवल official portal पर करें"] },
  exams: { label: "परीक्षा", steps: ["परीक्षा की official सूचना देखें", "सिलेबस और निर्देश पढ़ें", "जरूरी दस्तावेज/तैयारी पूरी करें", "अंतिम बदलाव के लिए official source देखें"] },
  "admit-card": { label: "एडमिट कार्ड", steps: ["official admit-card page खोलें", "आवेदन/रजिस्ट्रेशन विवरण तैयार रखें", "admit card डाउनलोड करें", "परीक्षा से पहले निर्देश और केंद्र की जानकारी जांचें"] },
  "answer-key": { label: "आंसर की", steps: ["official answer key देखें", "अपने उत्तरों का मिलान करें", "आपत्ति की अवधि और नियम official notice से जांचें", "जरूरत होने पर official objection प्रक्रिया अपनाएं"] },
  results: { label: "रिजल्ट", steps: ["official result page खोलें", "मांगी गई पहचान/आवेदन जानकारी भरें", "result/merit document सुरक्षित रखें", "अगला चरण official notice के अनुसार करें"] },
  scholarship: { label: "स्कॉलरशिप", steps: ["official scholarship notice पढ़ें", "पात्रता और दस्तावेज जांचें", "portal पर application/status देखें", "समस्या होने पर official helpdesk/portal का उपयोग करें"] },
  admission: { label: "एडमिशन", steps: ["official admission notice देखें", "eligibility और dates जांचें", "जरूरी documents तैयार करें", "application/counselling केवल official portal से करें"] },
  documents: { label: "डॉक्यूमेंट", steps: ["official requirement देखें", "मान्य document/format जांचें", "जहाँ जरूरी हो verification पूरा करें", "document की सुरक्षित copy रखें"] },
  schemes: { label: "सरकारी योजना", steps: ["योजना की official eligibility देखें", "लाभ और आवश्यक documents जांचें", "official application channel पहचानें", "application/status केवल official system से जांचें"] },
  "current-affairs": { label: "करंट अफेयर्स", steps: ["official announcement पढ़ें", "तारीख और संस्था की पुष्टि करें", "परीक्षा उपयोगी तथ्य नोट करें", "संदेह होने पर मूल सरकारी स्रोत देखें"] },
  "student-updates": { label: "छात्र अपडेट", steps: ["official notice खोलें", "आपके ऊपर लागू जानकारी पहचानें", "जरूरी deadline/action नोट करें", "कार्रवाई official portal पर ही करें"] },
};

function buildStudentContent(article: NormalizedNews) {
  const title = cleanTitle(article.title);
  const description = cleanDescription(article.description || "");
  const help = categoryHelp[article.categorySlug] || categoryHelp["student-updates"];
  const source = article.sourceName || "आधिकारिक स्रोत";

  return [
    `## ${help.label}: यह अपडेट आपके किस काम का है?`,
    description || `${source} पर उपलब्ध यह आधिकारिक अपडेट छात्रों/अभ्यर्थियों के लिए उपयोगी हो सकता है।`,
    "",
    "## अभी क्या करें",
    help.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## जरूरी सावधानी",
    "तारीख, पात्रता, फीस, पद, परिणाम, आवेदन की स्थिति या अन्य अंतिम निर्णय इस पेज पर तभी माना जाए जब वह आधिकारिक स्रोत पर उपलब्ध हो। कोई जानकारी स्पष्ट नहीं है तो अनुमान न लगाएं।",
    "",
    "## आधिकारिक स्रोत",
    `${source}: ${article.sourceUrl}`,
    "",
    "## आगे क्या देखें",
    "इस अपडेट में नया official notice, admit card, answer key, result या date extension आने पर जानकारी अपडेट की जा सकती है। कार्रवाई करने से पहले मूल आधिकारिक पेज अवश्य देखें।",
  ].join("\n");
}

export function processNews(article: NormalizedNews, uniqueSuffix: string): ProcessedNews {
  const title = cleanTitle(article.title);
  const description = cleanDescription(article.description || "") || `${article.sourceName || "आधिकारिक स्रोत"} का छात्र उपयोगी अपडेट।`;
  return {
    ...article,
    title,
    description,
    content: buildStudentContent({ ...article, title, description }),
    slug: createSlug(title, uniqueSuffix),
  };
}
