"use client";

import { useEffect, useRef } from "react";

const SOCIAL = "https://pl31320435.profitableratecpmnetwork.com/63/09/11/6309117b1ba7627d04489fb1a7538119.js";
const NATIVE = "https://pl31320464.profitableratecpmnetwork.com/474fa8b015c1b8662327ffcb1eb1ed09/invoke.js";
const NATIVE_ID = "container-474fa8b015c1b8662327ffcb1eb1ed09";
const BANNER = "https://www.highrevenueformat.com/f3b2eb95c0a2efceea637ec62e180ba7/invoke.js";
const KEY = "f3b2eb95c0a2efceea637ec62e180ba7";

declare global {
  interface Window {
    atOptions?: { key: string; format: string; height: number; width: number; params: Record<string, unknown> };
  }
}

function appendScript(parent: HTMLElement, src: string, id: string, attrs: Record<string, string> = {}) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) return existing;
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  parent.appendChild(script);
  return script;
}

export function AdsterraSocialBar() {
  useEffect(() => {
    if (!document.getElementById("adsterra-social-bar-script")) {
      const script = document.createElement("script");
      script.id = "adsterra-social-bar-script";
      script.src = SOCIAL;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  return null;
}

/** Provider requires the exact native container id. Use one native slot per page. */
export function AdsterraNative({ slot = "content" }: { slot?: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const container = document.getElementById(NATIVE_ID);
      if (container) appendScript(container, NATIVE, `adsterra-native-script-${slot}`, { "data-cfasync": "false" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [slot]);

  return (
    <div className="my-6 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
      <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
      <div id={NATIVE_ID} className="min-h-[120px] w-full overflow-hidden" />
    </div>
  );
}

/** 300x250 banner. The provider script is appended inside the 300x250 slot. */
export function AdsterraBanner({ slot = "banner" }: { slot?: string }) {
  const adRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.atOptions = { key: KEY, format: "iframe", height: 250, width: 300, params: {} };
    const timer = window.setTimeout(() => {
      if (adRef.current) appendScript(adRef.current, BANNER, `adsterra-banner-script-${slot}`, { "data-cfasync": "false" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [slot]);

  return (
    <div className="my-6 flex min-h-[280px] w-full justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
      <div className="w-full max-w-[300px]">
        <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
        <div ref={adRef} className="min-h-[250px] w-[300px] max-w-full overflow-hidden" />
      </div>
    </div>
  );
}

export function AdsterraThreeSlots() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4" aria-label="विज्ञापन क्षेत्र">
      <AdsterraNative slot="top" />
      <AdsterraBanner slot="top" />
    </section>
  );
}

export default function AdsterraAds() {
  return null;
}
