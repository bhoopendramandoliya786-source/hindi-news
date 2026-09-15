"use client";
import Script from "next/script";
import { useId } from "react";

const SOCIAL="https://pl31320435.profitableratecpmnetwork.com/63/09/11/6309117b1ba7627d04489fb1a7538119.js";
const NATIVE="https://pl31320464.profitableratecpmnetwork.com/474fa8b015c1b8662327ffcb1eb1ed09/invoke.js";
const NATIVE_ID="container-474fa8b015c1b8662327ffcb1eb1ed09";
const BANNER="https://www.highrevenueformat.com/f3b2eb95c0a2efceea637ec62e180ba7/invoke.js";
const KEY="f3b2eb95c0a2efceea637ec62e180ba7";

/** Sitewide social inventory. Kept separate so the other two units stay predictable. */
export function AdsterraSocialBar(){
  return <Script id="adsterra-social-bar" src={SOCIAL} strategy="afterInteractive" />;
}

/** Native unit. A unique DOM id prevents collisions when more than one page slot is rendered. */
export function AdsterraNative({ slot = "content" }: { slot?: string }){
  const reactId = useId().replace(/:/g, "");
  const containerId = `${NATIVE_ID}-${slot}-${reactId}`;
  return <div className="my-6 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
    <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
    <div className="min-h-[120px] w-full overflow-hidden">
      <Script id={`native-script-${slot}-${reactId}`} src={NATIVE} strategy="afterInteractive" data-cfasync="false" />
      <div id={containerId} className="min-h-[120px] w-full overflow-hidden" />
    </div>
  </div>;
}

/** 300x250 banner. Each rendered slot gets its own script id. */
export function AdsterraBanner({ slot = "banner" }: { slot?: string }){
  const reactId = useId().replace(/:/g, "");
  return <div className="my-6 flex min-h-[280px] w-full justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
    <div className="w-full max-w-[300px]">
      <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
      <div className="min-h-[250px] w-[300px] max-w-full overflow-hidden">
        <Script id={`banner-options-${slot}-${reactId}`} strategy="afterInteractive">{`window.atOptions={key:"${KEY}",format:"iframe",height:250,width:300,params:{}};`}</Script>
        <Script id={`banner-script-${slot}-${reactId}`} src={BANNER} strategy="afterInteractive" />
      </div>
    </div>
  </div>;
}

/** Explicit combined placement: native + 300x250, while SocialBar remains sitewide. */
export function AdsterraThreeSlots(){
  return <section className="mx-auto w-full max-w-7xl px-4" aria-label="विज्ञापन क्षेत्र">
    <AdsterraNative slot="top" />
    <AdsterraBanner slot="top" />
  </section>;
}

export default function AdsterraAds(){ return null; }
