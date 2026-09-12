import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const [published, categories] = await Promise.all([
      db.news.count({ where: { status: "PUBLISHED" } }),
      db.category.count(),
    ]);
    return NextResponse.json({ ok: true, database: "connected", published, categories, latencyMs: Date.now() - started, time: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ ok: false, database: "error", latencyMs: Date.now() - started, time: new Date().toISOString() }, { status: 503 });
  }
}
