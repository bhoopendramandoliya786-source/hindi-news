export type StudentContext = {
  label: string;
  question: string;
  actionLabel: string;
};

const CONTEXT: Record<string, StudentContext> = {
  jobs: { label: "भर्ती", question: "यह किस भर्ती की जानकारी है?", actionLabel: "भर्ती देखें" },
  exams: { label: "परीक्षा", question: "यह किस परीक्षा की जानकारी है?", actionLabel: "परीक्षा देखें" },
  "admit-card": { label: "एडमिट कार्ड", question: "यह किस परीक्षा/भर्ती का एडमिट कार्ड है?", actionLabel: "एडमिट कार्ड देखें" },
  "answer-key": { label: "आंसर की", question: "यह किस परीक्षा की आंसर की है?", actionLabel: "आंसर की देखें" },
  results: { label: "रिजल्ट", question: "यह किस परीक्षा/भर्ती का रिजल्ट है?", actionLabel: "रिजल्ट देखें" },
  scholarship: { label: "छात्रवृत्ति", question: "यह किस छात्रवृत्ति की जानकारी है?", actionLabel: "छात्रवृत्ति देखें" },
  admission: { label: "एडमिशन", question: "यह किस course/college/university के admission की जानकारी है?", actionLabel: "एडमिशन देखें" },
  documents: { label: "डॉक्यूमेंट", question: "यह किस student/government काम के document से जुड़ी जानकारी है?", actionLabel: "दस्तावेज देखें" },
  schemes: { label: "सरकारी योजना", question: "यह किस सरकारी योजना की जानकारी है?", actionLabel: "योजना देखें" },
  "citizen-services": { label: "नागरिक सेवा", question: "यह किस नागरिक सेवा की जानकारी है?", actionLabel: "सेवा देखें" },
  education: { label: "शिक्षा", question: "यह किस शिक्षा/संस्थान/course से जुड़ी जानकारी है?", actionLabel: "शिक्षा अपडेट देखें" },
  "current-affairs": { label: "करंट अफेयर्स", question: "यह किस student-useful current update की जानकारी है?", actionLabel: "अपडेट देखें" },
  "student-updates": { label: "स्टूडेंट अपडेट", question: "यह किस student update की जानकारी है?", actionLabel: "अपडेट देखें" },
};

export function getStudentContext(categorySlug: string, title: string): StudentContext {
  const context = CONTEXT[categorySlug] || { label: "स्टूडेंट अपडेट", question: "यह किस student update की जानकारी है?", actionLabel: "अपडेट देखें" };
  return { ...context };
}

export function buildStudentIdentity(categorySlug: string, title: string) {
  const context = getStudentContext(categorySlug, title);
  const cleanTitle = title.replace(/\s+/g, " ").trim();
  return `${context.question} ${cleanTitle}`;
}
