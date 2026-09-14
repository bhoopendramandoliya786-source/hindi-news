import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncCentralOfficialNews } from "@/lib/central-news-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7), "utf8");
  const expected = Buffer.from(secret, "utf8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    const result = await syncCentralOfficialNews();
    if (result.saved > 0) {
      revalidatePath("/");
      revalidatePath("/latest");
      revalidatePath("/category/[slug]", "page");
      revalidatePath("/student-work/[slug]", "page");
      revalidatePath("/sitemap.xml");
      revalidatePath("/news-sitemap.xml");
    }
    return NextResponse.json({ success: true, message: "Central official update sync completed.", result, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Central official sync failed:", error);
    return NextResponse.json({ success: false, message: "Central official sync failed." }, { status: 500 });
  }
}
