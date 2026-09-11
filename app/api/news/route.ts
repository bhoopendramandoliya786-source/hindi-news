import { NextResponse } from "next/server";
import { fetchAllHindiNews } from "@/lib/news-fetcher";

export async function GET() {
  try {
    const articles = await fetchAllHindiNews();
    return NextResponse.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error("News fetch API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
