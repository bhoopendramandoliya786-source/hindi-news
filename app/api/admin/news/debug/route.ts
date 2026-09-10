import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "NEWS_API_KEY is missing"
    });
  }

  const url = new URL("https://newsapi.org/v2/top-headlines");

  url.searchParams.set("country", "in");
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url.toString(), {
    cache: "no-store"
  });

  const data = await response.json();

  return NextResponse.json({
    httpStatus: response.status,
    status: data.status,
    code: data.code ?? null,
    message: data.message ?? null,
    totalResults: data.totalResults ?? null,
    articleCount: Array.isArray(data.articles)
      ? data.articles.length
      : null
  });
}
