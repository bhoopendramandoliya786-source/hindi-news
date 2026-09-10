import { NextResponse } from "next/server";
import { saveIndiaNews } from "@/lib/news-saver";
import { seedCategories } from "@/lib/category-seeder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedCategories();

    const result = await saveIndiaNews();

    return NextResponse.json({
      success: true,
      message: "News fetched and saved successfully.",
      result
    });
  } catch (error) {
    console.error("News fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch news.",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined
      },
      {
        status: 500
      }
    );
  }
}
