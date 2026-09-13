"use client";
import Script from "next/script";

const SOCIAL="https://pl31320435.profitableratecpmnetwork.com/63/09/11/6309117b1ba7627d04489fb1a7538119.js";
const NATIVE="https://pl31320464.profitableratecpmnetwork.com/474fa8b015c1b8662327ffcb1eb1ed09/invoke.js";
const NATIVE_ID="container-474fa8b015c1b8662327ffcb1eb1ed09";
const BANNER="https://www.highrevenueformat.com/f3b2eb95c0a2efceea637ec62e180ba7/invoke.js";
const KEY="f3b2eb95c0a2efceea637ec62e180ba7";

export function AdsterraSocialBar(){
  return <Script src={SOCIAL} strategy="afterInteractive"/>;
}

export function AdsterraNative(){
  return <div className="my-6 overflow-hidden rounded-xl bg-white" aria-label="विज्ञापन">
    <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
    <Script src={NATIVE} strategy="afterInteractive" data-cfasync="false"/>
    <div id={NATIVE_ID} className="min-h-[100px] w-full overflow-hidden"/>
  </div>;
}

export function AdsterraBanner(){
  return <div className="my-6 flex justify-center overflow-hidden rounded-xl bg-white" aria-label="विज्ञापन">
    <div className="w-full max-w-[300px]">
      <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">विज्ञापन</div>
      <Script id={`banner-${KEY}`} strategy="afterInteractive">{`window.atOptions={key:"${KEY}",format:"iframe",height:250,width:300,params:{}};`}</Script>
      <Script src={BANNER} strategy="afterInteractive"/>
    </div>
  </div>;
}

// Keep the lightweight Social Bar sitewide. Display/native units are placed
// in page content so advertising never pushes the first useful content below the fold.
export default function AdsterraAds(){
  return <AdsterraSocialBar/>;
}
