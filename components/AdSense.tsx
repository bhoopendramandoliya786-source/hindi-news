"use client";

import Script from "next/script";
import { useEffect } from "react";

export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}

export default function AdSlot({
  slot,
  className = "",
}: {
  slot?: string;
  className?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const autoAds = process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS === "true";

  useEffect(() => {
    if (!clientId || !slot) return;
    try {
      // @ts-expect-error AdSense adds this global at runtime.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense can fail silently when an ad blocker is active.
    }
  }, [clientId, slot]);

  if (!clientId || !autoAds && !slot) return null;
  if (!slot) return <div className={`min-h-2 ${className}`} aria-hidden="true" />;

  return (
    <div className={`my-6 overflow-hidden rounded-xl ${className}`}>
      <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
      <ins className="adsbygoogle block" style={{ display: "block", minHeight: 90 }} data-ad-client={clientId} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
