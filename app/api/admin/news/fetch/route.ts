import { NextResponse } from "next/server";
import { saveIndiaNews } from "@/lib/news-saver";
import { seedCategories } from "@/lib/category-seeder";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await seedCategories();

    const result = await saveIndiaNews();

    return NextResponse.json({
      success: true,
      message: "News fetched successfully.",
      result
    });
  } catch (error) {
    console.error("News fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch news."
      },
      {
        status: 500
      }
    );
  }
}
