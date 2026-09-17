import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const [published, categories, settings] = await Promise.all([
      db.news.count({ where: { status: "PUBLISHED" } }),
      db.category.count(),
      db.siteSettings.findUnique({ where: { id: "default" }, select: { lastSyncAt: true } }),
    ]);
    const lastSyncAt = settings?.lastSyncAt || null;
    const syncAgeMinutes = lastSyncAt ? Math.max(0, Math.round((Date.now() - new Date(lastSyncAt).getTime()) / 60000)) : null;
    return NextResponse.json({
      ok: true,
      database: "connected",
      published,
      categories,
      lastSyncAt,
      syncAgeMinutes,
      syncHealthy: syncAgeMinutes !== null && syncAgeMinutes <= 780,
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ ok: false, database: "error", latencyMs: Date.now() - started, time: new Date().toISOString() }, { status: 503 });
  }
}
