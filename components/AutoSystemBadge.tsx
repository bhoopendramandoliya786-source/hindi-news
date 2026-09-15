"use client";

import { useEffect, useState } from "react";

export default function AutoSystemBadge() {
  const [state, setState] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let active = true;
    fetch("/api/health", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("health")))
      .then(() => { if (active) setState("ok"); })
      .catch(() => { if (active) setState("down"); });
    return () => { active = false; };
  }, []);

  const text = state === "ok" ? "ऑटो सिस्टम चालू • Official sync monitor" : state === "down" ? "Sync/database अभी check हो रहा है" : "ऑटो सिस्टम check हो रहा है…";
  const classes = state === "ok" ? "bg-green-50 text-green-800 ring-green-100" : state === "down" ? "bg-amber-50 text-amber-800 ring-amber-100" : "bg-white/10 text-white ring-white/20";

  return <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-black ring-1 ${classes}`}>● {text}</div>;
}
