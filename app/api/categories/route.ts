import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Categories fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch categories."
      },
      { status: 500 }
    );
  }
}
