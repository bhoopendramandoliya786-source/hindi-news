import type { ReactNode } from "react";
export const metadata = { title: "हमारे बारे में" };
export default function AboutPage(){return <Info title="हमारे बारे में"><p>Hindi News एक हिंदी डिजिटल न्यूज़ प्लेटफॉर्म है, जिसका उद्देश्य भारत, राजस्थान, सरकारी नौकरी, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन से जुड़ी उपयोगी और स्पष्ट जानकारी पहुँचाना है।</p><p>हमारी प्राथमिकता तथ्य-जांच, स्पष्ट भाषा और पाठकों के लिए उपयोगी संदर्भ देना है।</p></Info>}
function Info({title,children}:{title:string;children:ReactNode}){return <main className="min-h-screen bg-gray-50 py-10"><article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10"><h1 className="text-3xl font-black">{title}</h1><div className="mt-6 space-y-4 leading-8 text-gray-700">{children}</div></article></main>}
