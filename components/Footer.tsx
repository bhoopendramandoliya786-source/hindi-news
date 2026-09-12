import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-950 text-gray-300">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">📰 Hindi News</h2>
          <p className="text-sm leading-6">भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की ताज़ा खबरों के लिए आपका न्यूज़ प्लेटफॉर्म।</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">पाठकों के लिए</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-white">होम</Link>
            <Link href="/search" className="hover:text-white">खबर खोजें</Link>
            <Link href="/jobs" className="hover:text-white">सरकारी नौकरी</Link>
            <Link href="/about" className="hover:text-white">हमारे बारे में</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">Business</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/advertise" className="hover:text-white">विज्ञापन दें</Link>
            <Link href="/affiliate-disclosure" className="hover:text-white">Affiliate Disclosure</Link>
            <Link href="/contact" className="hover:text-white">संपर्क करें</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">कानूनी जानकारी</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800"><div className="container py-5 text-center text-sm">© {new Date().getFullYear()} Hindi News. All Rights Reserved.</div></div>
    </footer>
  );
}
