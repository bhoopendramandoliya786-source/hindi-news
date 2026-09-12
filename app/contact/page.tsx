import type { Metadata } from "next";

const EMAIL = "hindinews.contactme@gmail.com";

export const metadata: Metadata = {
  title: "संपर्क करें",
  description: "Hindi News की editorial, feedback, advertising, business और job promotion inquiries के लिए संपर्क करें।",
};

const inquiryTypes = [
  ["📰 संपादकीय / खबर", "खबर में सुधार, तथ्यात्मक त्रुटि, source information या editorial feedback."],
  ["📢 विज्ञापन / Business", "Display ads, sponsored content, local business और brand promotion."],
  ["💼 सरकारी नौकरी / Promotion", "Recruitment, coaching और career campaign promotion."],
  ["💬 सामान्य सुझाव", "Website, content, usability या reader feedback."],
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 to-orange-500 p-7 text-white shadow-sm sm:p-10">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">CONTACT & SUPPORT</span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">हमसे संपर्क करें</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-red-50 sm:text-base">
            खबर, correction, feedback, advertising, business collaboration या job promotion से जुड़ी inquiry के लिए हमें email करें।
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-gray-950">किस तरह की inquiry भेज सकते हैं?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {inquiryTypes.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="font-black text-gray-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5">
              <h2 className="font-black text-gray-950">खबर में correction बताना है?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Email में खबर का title या URL, गलती की जानकारी और सही source/reference जरूर लिखें। इससे editorial team के लिए verification आसान होगा।
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-gray-950 p-6 text-white shadow-sm sm:p-7">
            <div className="text-3xl">✉️</div>
            <h2 className="mt-3 text-2xl font-black">Official Contact</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">सभी general और business inquiries के लिए हमारा official email:</p>
            <a href={`mailto:${EMAIL}`} className="mt-5 block break-all rounded-2xl bg-white p-4 text-sm font-black text-red-600 hover:bg-red-50">
              {EMAIL}
            </a>
            <a href={`mailto:${EMAIL}?subject=Hindi%20News%20Inquiry`} className="mt-4 block rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-black hover:bg-red-700">
              Email भेजें →
            </a>
            <p className="mt-5 text-xs leading-5 text-gray-400">Advertising और sponsored campaign के लिए subject में “Advertising” लिखना बेहतर रहेगा।</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
