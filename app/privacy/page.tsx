export const metadata = {
  title: "Privacy Policy",
  description: "Hindi News की privacy policy और third-party services की जानकारी।",
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-black text-gray-950">Privacy Policy</h1>
        <div className="mt-6 space-y-5 leading-8 text-gray-700">
          <p>Hindi News वेबसाइट के संचालन, सुरक्षा, analytics और उपयोगकर्ता अनुभव को बेहतर बनाने के लिए आवश्यक तकनीकी जानकारी का उपयोग कर सकती है।</p>
          <p>यदि Google Analytics जैसी analytics service enabled है, तो इसका उपयोग traffic और site performance समझने के लिए किया जा सकता है।</p>
          <p>यदि Google AdSense enabled है, तो विज्ञापन और संबंधित technologies उपयोग हो सकती हैं। AdSense अपनी policies और cookies के अनुसार advertising information process कर सकता है।</p>
          <p>भविष्य में affiliate links का उपयोग किया जा सकता है। Affiliate relationship होने पर संबंधित disclosure दिया जाएगा।</p>
          <p>RSS/API या third-party sources से जुड़ी सामग्री के लिए संबंधित provider की terms और privacy policies भी लागू हो सकती हैं।</p>
          <p>Privacy से संबंधित सवालों के लिए हमारी <a className="font-bold text-red-600 hover:underline" href="/contact">Contact page</a> पर संपर्क करें।</p>
        </div>
      </article>
    </main>
  );
}
