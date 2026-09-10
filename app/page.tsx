const demoNews = [
  {
    category: "भारत",
    title: "भारत की बड़ी खबरें जल्द यहाँ दिखाई देंगी",
    description:
      "News API और हमारे database को जोड़ने के बाद यहाँ वास्तविक खबरें दिखाई जाएंगी।"
  },
  {
    category: "राजस्थान",
    title: "राजस्थान की ताज़ा खबरें एक जगह",
    description:
      "राजस्थान से जुड़ी महत्वपूर्ण खबरों के लिए अलग category तैयार की जाएगी।"
  },
  {
    category: "टेक्नोलॉजी",
    title: "टेक्नोलॉजी की नई और महत्वपूर्ण खबरें",
    description:
      "Technology news के लिए अलग section और search सुविधा भी होगी।"
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container py-10 md:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
              🔴 ताज़ा खबरें
            </div>

            <h1 className="text-4xl font-black leading-tight text-gray-950 md:text-6xl">
              देश और दुनिया की
              <span className="text-red-600"> ताज़ा खबरें</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की
              खबरें एक ही जगह।
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-8 rounded-xl bg-gray-200 p-6 text-center text-sm text-gray-500">
          Advertisement Space
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-950">
            📰 ताज़ा खबरें
          </h2>

          <span className="text-sm font-semibold text-red-600">
            Latest News
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {demoNews.map((news) => (
            <article
              key={news.title}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
                News Image
              </div>

              <div className="p-5">
                <span className="text-sm font-bold text-red-600">
                  {news.category}
                </span>

                <h3 className="mt-2 text-xl font-bold leading-7 text-gray-950">
                  {news.title}
                </h3>

                <p className="mt-3 leading-6 text-gray-600">
                  {news.description}
                </p>

                <button className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                  और पढ़ें →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
