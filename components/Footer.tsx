import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-950 text-gray-300">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">
            📰 Hindi News
          </h2>

          <p className="text-sm leading-6">
            भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की
            ताज़ा खबरों के लिए आपका न्यूज़ प्लेटफॉर्म।
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-white">महत्वपूर्ण लिंक</h3>

          <div className="flex flex-col gap-2 text-sm">
            <Link href="/about" className="hover:text-white">
              हमारे बारे में
            </Link>

            <Link href="/contact" className="hover:text-white">
              संपर्क करें
            </Link>

            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-white">भाषा</h3>

          <p className="text-sm">
            हिंदी और English दोनों भाषाओं में न्यूज़ उपलब्ध होगी।
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container py-5 text-center text-sm">
          © {new Date().getFullYear()} Hindi News. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
