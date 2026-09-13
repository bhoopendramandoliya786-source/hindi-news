import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveIndiaNews } from "@/lib/news-saver";
import { seedCategories } from "@/lib/category-seeder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    await seedCategories();
    const result = await saveIndiaNews();

    if (result.saved > 0 || result.updated > 0) {
      revalidatePath("/");
      revalidatePath("/trending");
      revalidatePath("/category/[slug]", "page");
      revalidatePath("/sitemap.xml");
      revalidatePath("/news-sitemap.xml");
    }

    return NextResponse.json({
      success: true,
      message: "Automatic news sync completed.",
      result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Automatic news sync failed:", error);
    return NextResponse.json(
      { success: false, message: "Automatic news sync failed." },
      { status: 500 }
    );
  }
}
