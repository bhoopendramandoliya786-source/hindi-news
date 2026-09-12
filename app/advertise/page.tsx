export const metadata = {
  title: "विज्ञापन दें",
  description: "Hindi News पर विज्ञापन, sponsored content और भर्ती promotion के लिए संपर्क करें।",
};

export default function AdvertisePage() {
  const email = process.env.NEXT_PUBLIC_ADVERTISING_EMAIL || "contact@hindi-news.example";

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <article className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">BUSINESS</span>
        <h1 className="mt-4 text-3xl font-black text-gray-950 sm:text-4xl">Hindi News पर विज्ञापन दें</h1>
        <p className="mt-4 text-base leading-8 text-gray-600">
          अगर आपका business, coaching institute, local service, recruitment campaign या brand है,
          तो Hindi News पर targeted promotion के लिए हमसे संपर्क कर सकते हैं।
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["Display Ads", "Homepage और article pages पर banner/display placement."],
            ["Sponsored Story", "स्पष्ट sponsored label के साथ promotional article."],
            ["Job Promotion", "भर्ती, coaching और career-related campaigns के लिए promotion."],
            ["Local Business", "राजस्थान और आसपास के local businesses के लिए targeted visibility."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="font-black text-gray-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-gray-950 p-6 text-white">
          <h2 className="text-xl font-black">Advertising enquiries</h2>
          <p className="mt-2 text-sm text-gray-300">अपना brand, budget और campaign duration बताकर enquiry भेजें।</p>
          <a href={`mailto:${email}`} className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-black hover:bg-red-700">
            {email}
          </a>
        </div>
      </article>
    </main>
  );
}
