import { NextResponse } from "next/server";
import { fetchIndiaNews } from "@/lib/news-fetcher";

export async function GET() {
  try {
    const articles = await fetchIndiaNews();

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error("News API error:", error);

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
