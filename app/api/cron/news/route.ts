import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveIndiaNews } from "@/lib/news-saver";
import { seedCategories } from "@/lib/category-seeder";
import { monitorCentralOfficialSources } from "@/lib/central-official-monitor";

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

function revalidateStudentPages() {
  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/search");
  revalidatePath("/trending");
  revalidatePath("/track");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/student-work/[key]", "page");
  revalidatePath("/news/[id]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/news-sitemap.xml");
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    await seedCategories();
    const result = await saveIndiaNews();
    const central = await monitorCentralOfficialSources();
    if (result.saved > 0 || result.updated > 0 || central.saved > 0 || central.updated > 0) revalidateStudentPages();
    return NextResponse.json({ success: true, message: "Student information sync completed.", result, central, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Student information sync failed:", error);
    return NextResponse.json({ success: false, message: "Student information sync failed." }, { status: 500 });
  }
}
