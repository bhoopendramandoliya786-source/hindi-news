"use client";
import Script from "next/script";

const SOCIAL="https://pl31320435.profitableratecpmnetwork.com/63/09/11/6309117b1ba7627d04489fb1a7538119.js";
const NATIVE="https://pl31320464.profitableratecpmnetwork.com/474fa8b015c1b8662327ffcb1eb1ed09/invoke.js";
const NATIVE_ID="container-474fa8b015c1b8662327ffcb1eb1ed09";
const BANNER="https://www.highrevenueformat.com/f3b2eb95c0a2efceea637ec62e180ba7/invoke.js";
const KEY="f3b2eb95c0a2efceea637ec62e180ba7";

/**
 * Kept as an explicit opt-in export. It is intentionally not mounted sitewide:
 * forced pop/redirect style inventory can hurt navigation and publisher policy
 * safety when Google ads are also present.
 */
export function AdsterraSocialBar(){
  return <Script src={SOCIAL} strategy="afterInteractive"/>;
}

export function AdsterraNative(){
  return <div className="my-7 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
    <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
    <div className="min-h-[120px] w-full overflow-hidden">
      <Script src={NATIVE} strategy="afterInteractive" data-cfasync="false"/>
      <div id={NATIVE_ID} className="min-h-[120px] w-full overflow-hidden"/>
    </div>
  </div>;
}

export function AdsterraBanner(){
  return <div className="my-7 flex min-h-[280px] w-full justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm" aria-label="विज्ञापन">
    <div className="w-full max-w-[300px]">
      <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
      <div className="min-h-[250px] w-[300px] max-w-full overflow-hidden">
        <Script id={`banner-${KEY}`} strategy="afterInteractive">{`window.atOptions={key:"${KEY}",format:"iframe",height:250,width:300,params:{}};`}</Script>
        <Script src={BANNER} strategy="afterInteractive"/>
      </div>
    </div>
  </div>;
}

export default function AdsterraAds(){
  return null;
}
