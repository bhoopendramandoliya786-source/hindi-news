"use client";

import { useEffect, useState } from "react";

export default function AutoSystemBadge() {
  const [state, setState] = useState<"checking" | "ok" | "stale" | "down">("checking");
  const [published, setPublished] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error("health");
        if (active) {
          setPublished(typeof data.published === "number" ? data.published : null);
          setAge(typeof data.syncAgeMinutes === "number" ? data.syncAgeMinutes : null);
          setState(data.syncHealthy ? "ok" : "stale");
        }
      })
      .catch(() => { if (active) setState("down"); });
    return () => { active = false; };
  }, []);

  const text = state === "ok"
    ? `ऑटो सिस्टम चालू • official monitoring अपने तय schedule पर • ${age ?? 0} मिनट पहले${published !== null ? ` • ${published.toLocaleString("hi-IN")} updates` : ""}`
    : state === "stale"
      ? `ऑटो सिस्टम चालू • पिछला sync ${age ?? "?"} मिनट पहले • अगला sync अपने आप होगा`
      : state === "down"
        ? "Sync/database अभी check हो रहा है"
        : "ऑटो सिस्टम check हो रहा है…";
  const classes = state === "ok" ? "bg-green-50 text-green-800 ring-green-100" : state === "stale" ? "bg-amber-50 text-amber-800 ring-amber-100" : state === "down" ? "bg-amber-50 text-amber-800 ring-amber-100" : "bg-white/10 text-white ring-white/20";

  return <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-black ring-1 ${classes}`}>● {text}</div>;
}
