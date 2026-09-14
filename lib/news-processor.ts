import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & { slug: string; content: string };

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const categoryHelp: Record<string, { label: string; audience: string; meaning: string; steps: string[]; prepare: string; verify: string; next: string }> = {
  jobs: { label: "सरकारी नौकरी", audience: "इस भर्ती से जुड़े उम्मीदवार", meaning: "इस तरह के अपडेट में सबसे जरूरी बात यह समझना है कि official notice में भर्ती किस पद/प्रक्रिया से जुड़ी है और उम्मीदवार को अभी आवेदन करना है, सुधार करना है, admit card का इंतजार करना है या अगले चरण की तैयारी करनी है।", steps: ["official recruitment notification खोलें", "पद, योग्यता, आयु, category और अन्य शर्तें मिलाएं", "जरूरी documents और application details तैयार रखें", "eligible होने पर official portal से आवेदन या उपलब्ध अगला चरण पूरा करें"], prepare: "मूल विज्ञापन, पहचान/शैक्षणिक documents और application से जुड़ी जानकारी अपने पास रखें; केवल वही document अनिवार्य मानें जो official notice में बताया गया हो।", verify: "पद, vacancy, category, age limit, fee, application dates और अंतिम तारीख केवल official notification से verify करें।", next: "भर्ती प्रक्रिया में आगे admit card, परीक्षा, answer key, result, document verification या appointment से जुड़ा अलग official update आ सकता है।" },
  exams: { label: "परीक्षा", audience: "इस परीक्षा में शामिल होने वाले विद्यार्थी/अभ्यर्थी", meaning: "यह अपडेट परीक्षा की तैयारी या परीक्षा प्रक्रिया से जुड़ा है। पहले यह देखें कि सूचना आपके exam, board, recruitment या course पर लागू होती है या नहीं।", steps: ["official exam notice खोलें", "exam date, syllabus और परीक्षा से जुड़े निर्देश देखें", "जरूरी documents और registration details जांचें", "बाद के बदलाव के लिए official source देखते रहें"], prepare: "सिलेबस, परीक्षा निर्देश और उपलब्ध official notice सुरक्षित रखें ताकि तैयारी और परीक्षा-दिन की जानकारी एक ही जगह मिल सके।", verify: "परीक्षा तारीख, syllabus, centre, reporting time और instructions को official notice/admit card से verify करें।", next: "परीक्षा के बाद answer key, objection, result या अगली प्रक्रिया का अलग official notice आ सकता है।" },
  "admit-card": { label: "एडमिट कार्ड", audience: "जिन उम्मीदवारों की परीक्षा/भर्ती का admit card जारी हुआ है", meaning: "Admit card केवल प्रवेश-पत्र नहीं है; इसमें परीक्षा से जुड़े उम्मीदवार के लिए जरूरी पहचान, centre और instructions की जानकारी हो सकती है।", steps: ["official admit-card page खोलें", "application/registration details तैयार रखें", "admit card डाउनलोड करें", "नाम, roll number, centre और सभी instructions जांचें"], prepare: "डाउनलोड की गई PDF/print को सुरक्षित रखें और परीक्षा से पहले उसमें दिए निर्देश पढ़ लें।", verify: "परीक्षा केंद्र, reporting time और पहचान संबंधी निर्देश admit card पर ही अंतिम मानें।", next: "परीक्षा के बाद answer key और result जैसे अगले official चरण आ सकते हैं।" },
  "answer-key": { label: "आंसर की", audience: "जिन अभ्यर्थियों ने संबंधित परीक्षा दी है", meaning: "Answer key से उम्मीदवार अपने उत्तरों का official answer के साथ मिलान कर सकता है और जहां official objection process उपलब्ध हो वहां उसे समझ सकता है।", steps: ["official answer key खोलें", "अपने उत्तरों का मिलान करें", "objection window और नियम देखें", "जरूरत होने पर official objection प्रक्रिया अपनाएं"], prepare: "अपने प्रश्न/उत्तर और यदि मांगा गया हो तो supporting evidence को official नियमों के अनुसार तैयार रखें।", verify: "objection की तारीख, fee, प्रश्न संख्या और evidence requirements official notice से verify करें।", next: "Objection के बाद revised/final answer key या result जारी हो सकता है; इसे official source से ही देखें।" },
  results: { label: "रिजल्ट", audience: "संबंधित परीक्षा/भर्ती के उम्मीदवार", meaning: "Result update में पहले यह देखें कि किस परीक्षा/भर्ती का परिणाम है और result देखने या डाउनलोड करने के लिए official portal पर क्या प्रक्रिया दी गई है।", steps: ["official result page खोलें", "मांगी गई application/roll जानकारी भरें", "result/merit document सुरक्षित रखें", "अगला चरण official notice के अनुसार पूरा करें"], prepare: "Roll number/application details और डाउनलोड किए गए result की copy सुरक्षित रखें।", verify: "cutoff, merit, document verification, counselling या appointment जैसी बातें official notice/document से ही verify करें।", next: "Result के बाद scrutiny, document verification, counselling, preference या appointment से जुड़ा अगला official चरण हो सकता है।" },
  scholarship: { label: "स्कॉलरशिप", audience: "पात्र छात्र और scholarship applicants", meaning: "Scholarship update में scheme, academic session और student की eligibility सबसे पहले समझनी होती है। इसके बाद application, verification और status की प्रक्रिया देखनी चाहिए।", steps: ["official scholarship portal/notice खोलें", "scheme और session के अनुसार eligibility देखें", "OTR और जरूरी documents जांचें", "application, verification और status official portal पर देखें"], prepare: "जहां official portal मांगता है वहां OTR, academic details, marksheet, admission/bank या अन्य दस्तावेज तैयार रखें; अनिवार्यता current official notice से ही तय करें।", verify: "scheme eligibility, documents, dates, institute verification और biometric/verification rules current official order से verify करें।", next: "Application के बाद institute/department verification, correction, status update या payment से जुड़ी अलग सूचना आ सकती है।" },
  admission: { label: "एडमिशन", audience: "नए admission या counselling की तैयारी करने वाले विद्यार्थी", meaning: "Admission update को समझते समय course/college/university और उस admission cycle की official conditions को पहले मिलाना जरूरी है।", steps: ["official admission notice खोलें", "eligibility और dates देखें", "जरूरी documents तैयार करें", "application/counselling केवल official portal से करें"], prepare: "शैक्षणिक documents, पहचान और admission notice में मांगी गई जानकारी तैयार रखें।", verify: "seat, fee, eligibility, counselling dates, reservation और document rules official notice से verify करें।", next: "Application के बाद merit, counselling, allotment, document verification या fee submission का अगला official चरण हो सकता है।" },
  documents: { label: "डॉक्यूमेंट", audience: "जिस सरकारी/student काम के लिए document चाहिए", meaning: "Document से जुड़े update में सबसे जरूरी बात यह है कि किस काम के लिए कौन-सा document चाहिए और उसकी validity/verification किस विभाग ने तय की है।", steps: ["official requirement देखें", "मान्य document और format जांचें", "जहां जरूरी हो verification पूरा करें", "original और सुरक्षित digital/photocopy रखें"], prepare: "Original document के साथ जरूरत पड़ने पर सुरक्षित scan/photocopy रखें, लेकिन कौन-सा format स्वीकार होगा यह official निर्देश से तय करें।", verify: "किस document की जरूरत है, उसकी validity क्या है और verification कहां होगा—यह संबंधित विभाग के official निर्देश से verify करें।", next: "Document के आधार पर application, scholarship, admission, recruitment या verification का अगला चरण पूरा हो सकता है।" },
  schemes: { label: "सरकारी योजना", audience: "योजना का लाभ लेने के योग्य विद्यार्थी/लाभार्थी", meaning: "Scheme update में पहले eligibility और लागू शर्तें समझें। केवल headline देखकर लाभ की राशि या पात्रता तय न करें।", steps: ["official scheme page खोलें", "eligibility अपनी स्थिति से मिलाएं", "जरूरी documents और application method देखें", "application/status केवल official system से check करें"], prepare: "योजना के official निर्देश में मांगे गए documents और application details तैयार रखें।", verify: "लाभ, राशि, eligibility, category, income/age/class conditions और deadline current official scheme information से verify करें।", next: "Application के बाद verification, approval, status या benefit delivery से जुड़ा अलग official update हो सकता है।" },
  "current-affairs": { label: "करंट अफेयर्स", audience: "प्रतियोगी परीक्षा की तैयारी करने वाले विद्यार्थी", meaning: "Current affairs को सिर्फ headline की तरह नहीं, बल्कि परीक्षा में पूछे जा सकने वाले verified facts के रूप में पढ़ें।", steps: ["official announcement पढ़ें", "तारीख, संस्था और निर्णय की पुष्टि करें", "परीक्षा उपयोगी facts नोट करें", "संदेह होने पर मूल सरकारी source देखें"], prepare: "नाम, पद, संस्था, तारीख और सरकारी निर्णय जैसे facts को short notes में रखें।", verify: "नाम, पद, तारीख, आंकड़े और सरकारी निर्णय official source से verify करें।", next: "इसी विषय से संबंधित official clarification या नया government update आने पर facts को अपडेट करें।" },
  "student-updates": { label: "राजस्थान छात्र अपडेट", audience: "राजस्थान के विद्यार्थी और अभ्यर्थी", meaning: "यह update किसी सरकारी/student काम से जुड़ा हो सकता है। पहले यह पहचानें कि सूचना आपके class, exam, recruitment, scholarship, admission या document काम पर लागू है या नहीं।", steps: ["official notice खोलें", "देखें कि update आपके ऊपर लागू है या नहीं", "जरूरी deadline/action नोट करें", "कार्रवाई केवल official portal पर करें"], prepare: "जिस काम से update जुड़ा है उसकी application/registration details और official documents सुरक्षित रखें।", verify: "कोई भी अंतिम तारीख, पात्रता, fee या benefit official notice से verify किए बिना न मानें।", next: "इस update के बाद संबंधित विभाग की नई सूचना, correction, extension या अगला process notice आ सकता है।" },
};

function buildStudentContent(article: NormalizedNews) {
  const title = cleanTitle(article.title);
  const description = cleanDescription(article.description || "");
  const help = categoryHelp[article.categorySlug] || categoryHelp["student-updates"];
  const source = article.sourceName || "आधिकारिक स्रोत";
  const sourceLine = article.sourceUrl ? `${source}: ${article.sourceUrl}` : `${source} का मूल लिंक उपलब्ध होने पर यहां दिखाया जाएगा।`;

  return [
    `## ${help.label}: यह अपडेट क्या है?`,
    `**${title}** से जुड़ी जानकारी ${source} के official source से ली गई है।`,
    description ? `Official source से उपलब्ध जानकारी: ${description}` : "",
    "",
    "## इस अपडेट का मतलब क्या है?",
    help.meaning,
    "",
    "## यह किसके काम का है?",
    help.audience + " के लिए यह page उपयोगी है। अगर आपकी स्थिति इस update से match करती है, तभी आगे की कार्रवाई करें।",
    "",
    "## अब आपको क्या करना है",
    help.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## पहले से क्या तैयार रखें",
    help.prepare,
    "",
    "## क्या-क्या verify करना है",
    help.verify,
    "",
    "## जरूरी सावधानी",
    "हम official source में उपलब्ध तथ्य को ही आधार मानते हैं। जहां official notice में कोई तथ्य स्पष्ट नहीं है, वहां इस page पर अनुमान लगाकर तारीख, fee, vacancy, eligibility या लाभ नहीं बताया जाएगा।",
    "",
    "## Official source",
    sourceLine,
    "",
    "## आगे क्या हो सकता है?",
    help.next,
    "इसलिए इस page को केवल पढ़कर छोड़ने के बजाय ऊपर दिए official source को भी खोलें और अपनी स्थिति के अनुसार कार्रवाई करें।",
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