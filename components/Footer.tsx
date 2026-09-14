import Link from "next/link";

const tasks = [
  ["सरकारी नौकरी", "/category/jobs"],
  ["परीक्षा", "/category/exams"],
  ["एडमिट कार्ड", "/category/admit-card"],
  ["रिजल्ट", "/category/results"],
  ["स्कॉलरशिप", "/category/scholarship"],
  ["एडमिशन", "/category/admission"],
  ["डॉक्यूमेंट", "/category/documents"],
  ["सरकारी योजनाएं", "/category/schemes"],
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-950 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">🎓 Student Update</h2>
          <p className="text-sm leading-6">राजस्थान के छात्रों और नौकरी अभ्यर्थियों को सरकारी काम समझाने वाला student action portal। पहले आसान जानकारी, फिर जरूरी तैयारी और अंत में संबंधित official website।</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">छात्र के काम</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {tasks.map(([label, href]) => <Link key={href} href={href} className="hover:text-white">{label}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">साइट</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-white">Student Home</Link>
            <Link href="/search" className="hover:text-white">अपना काम खोजें</Link>
            <Link href="/about" className="hover:text-white">हमारे बारे में</Link>
            <Link href="/contact" className="hover:text-white">संपर्क करें</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">Business & Legal</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/advertise" className="hover:text-white">विज्ञापन दें</Link>
            <Link href="/affiliate-disclosure" className="hover:text-white">Affiliate Disclosure</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800"><div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm">© {new Date().getFullYear()} Student Update. All Rights Reserved.</div></div>
    </footer>
  );
}
