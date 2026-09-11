import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = await db.news.findMany({
      where: {
        status: "PUBLISHED"
      },
      orderBy: [
        {
          isBreaking: "desc"
        },
        {
          publishedAt: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      take: 30,
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      news
    });
  } catch (error) {
    console.error("Latest news fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch latest news."
      },
      {
        status: 500
      }
    );
  }
}
