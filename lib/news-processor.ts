import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & { slug: string; content: string };

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const categoryHelp: Record<string, { label: string; audience: string; steps: string[]; verify: string }> = {
  jobs: { label: "सरकारी नौकरी", audience: "इस भर्ती से जुड़े उम्मीदवार", steps: ["official notification खोलें", "योग्यता, आयु, शुल्क और जरूरी शर्तें मिलाएं", "आवश्यक documents तैयार रखें", "eligible होने पर official portal से आवेदन या अगला चरण पूरा करें"], verify: "पद, vacancy, category, age limit, fee और अंतिम तारीख केवल official notification से verify करें।" },
  exams: { label: "परीक्षा", audience: "इस परीक्षा में शामिल होने वाले विद्यार्थी/अभ्यर्थी", steps: ["official exam notice खोलें", "exam date और syllabus देखें", "परीक्षा निर्देश और जरूरी documents जांचें", "बाद के बदलाव के लिए official source देखते रहें"], verify: "परीक्षा तारीख, syllabus, centre और instructions को official notice से verify करें।" },
  "admit-card": { label: "एडमिट कार्ड", audience: "जिन उम्मीदवारों की परीक्षा/भर्ती का admit card जारी हुआ है", steps: ["official admit-card page खोलें", "application/registration details तैयार रखें", "admit card डाउनलोड करें", "नाम, roll number, centre और instructions जांचें"], verify: "परीक्षा केंद्र और reporting time जैसी जानकारी admit card पर ही अंतिम मानें।" },
  "answer-key": { label: "आंसर की", audience: "जिन अभ्यर्थियों ने संबंधित परीक्षा दी है", steps: ["official answer key खोलें", "अपने उत्तरों का मिलान करें", "objection window और नियम देखें", "जरूरत होने पर official objection प्रक्रिया अपनाएं"], verify: "objection की तारीख, fee और evidence requirements official notice से verify करें।" },
  results: { label: "रिजल्ट", audience: "संबंधित परीक्षा/भर्ती के उम्मीदवार", steps: ["official result page खोलें", "मांगी गई application/roll जानकारी भरें", "result/merit document सुरक्षित रखें", "अगला चरण official notice के अनुसार पूरा करें"], verify: "cutoff, merit, document verification या appointment जैसी बातें official notice से ही verify करें।" },
  scholarship: { label: "स्कॉलरशिप", audience: "पात्र छात्र और scholarship applicants", steps: ["official scholarship portal/notice खोलें", "scheme और session के अनुसार eligibility देखें", "OTR और जरूरी documents जांचें", "application, verification और status official portal पर देखें"], verify: "scheme eligibility, documents, dates और verification rules current official order से verify करें।" },
  admission: { label: "एडमिशन", audience: "नए admission या counselling की तैयारी करने वाले विद्यार्थी", steps: ["official admission notice खोलें", "eligibility और dates देखें", "जरूरी documents तैयार करें", "application/counselling केवल official portal से करें"], verify: "seat, fee, eligibility, counselling dates और document rules official notice से verify करें।" },
  documents: { label: "डॉक्यूमेंट", audience: "जिस सरकारी/student काम के लिए document चाहिए", steps: ["official requirement देखें", "मान्य document और format जांचें", "जहां जरूरी हो verification पूरा करें", "original और सुरक्षित digital/photocopy रखें"], verify: "किस document की जरूरत है और उसकी validity क्या है, यह संबंधित विभाग के official निर्देश से verify करें।" },
  schemes: { label: "सरकारी योजना", audience: "योजना का लाभ लेने के योग्य विद्यार्थी/लाभार्थी", steps: ["official scheme page खोलें", "eligibility अपनी स्थिति से मिलाएं", "जरूरी documents और application method देखें", "application/status केवल official system से check करें"], verify: "लाभ, राशि, eligibility और deadline current official scheme information से verify करें।" },
  "current-affairs": { label: "करंट अफेयर्स", audience: "प्रतियोगी परीक्षा की तैयारी करने वाले विद्यार्थी", steps: ["official announcement पढ़ें", "तारीख, संस्था और निर्णय की पुष्टि करें", "परीक्षा उपयोगी facts नोट करें", "संदेह होने पर मूल सरकारी source देखें"], verify: "नाम, पद, तारीख, आंकड़े और सरकारी निर्णय official source से verify करें।" },
  "student-updates": { label: "राजस्थान छात्र अपडेट", audience: "राजस्थान के विद्यार्थी और अभ्यर्थी", steps: ["official notice खोलें", "देखें कि update आपके ऊपर लागू है या नहीं", "जरूरी deadline/action नोट करें", "कार्रवाई केवल official portal पर करें"], verify: "कोई भी अंतिम तारीख या पात्रता official notice से verify किए बिना न मानें।" },
};

function buildStudentContent(article: NormalizedNews) {
  const title = cleanTitle(article.title);
  const description = cleanDescription(article.description || "");
  const help = categoryHelp[article.categorySlug] || categoryHelp["student-updates"];
  const source = article.sourceName || "आधिकारिक स्रोत";

  return [
    `## ${help.label}: यह अपडेट क्या है?`,
    `**${title}** से जुड़ी जानकारी ${source} के official source से ली गई है।`,
    description ? `\nOfficial source से उपलब्ध जानकारी: ${description}` : "",
    "",
    "## यह किसके काम का है?",
    help.audience + " के लिए यह page उपयोगी है। अगर आपकी स्थिति इस update से match करती है, तभी आगे की कार्रवाई करें।",
    "",
    "## अब आपको क्या करना है",
    help.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## क्या-क्या verify करना है",
    help.verify,
    "",
    "## जरूरी सावधानी",
    "हम official source में उपलब्ध तथ्य को ही आधार मानते हैं। जहां official notice में कोई तथ्य स्पष्ट नहीं है, वहां इस page पर अनुमान लगाकर तारीख, fee, vacancy, eligibility या लाभ नहीं बताया जाएगा।",
    "",
    "## Official source",
    `${source}: ${article.sourceUrl}`,
    "",
    "## आगे क्या हो सकता है?",
    "इसी विषय में बाद में admit card, answer key, result, correction, verification, date extension या अगला official notice आ सकता है। इसलिए संबंधित official source और इस category को दोबारा check करें।",
  ].filter(Boolean).join("\n");
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
