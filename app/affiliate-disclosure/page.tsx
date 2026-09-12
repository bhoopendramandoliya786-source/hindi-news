export const metadata = { title: "Affiliate Disclosure" };

export default function AffiliateDisclosurePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-black text-gray-950">Affiliate Disclosure</h1>
        <div className="mt-6 space-y-4 leading-8 text-gray-700">
          <p>
            Hindi News भविष्य में कुछ products, services, courses या tools के affiliate links का उपयोग कर सकता है।
          </p>
          <p>
            अगर कोई पाठक ऐसे link से खरीदारी करता है, तो हमें बिना किसी अतिरिक्त cost के commission मिल सकता है।
          </p>
          <p>
            Affiliate relationship होने पर उसे स्पष्ट रूप से बताया जाएगा। Editorial coverage और paid promotion को अलग रखा जाएगा।
          </p>
        </div>
      </article>
    </main>
  );
}
