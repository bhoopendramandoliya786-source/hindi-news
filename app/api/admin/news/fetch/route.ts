import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { saveIndiaNews } from "@/lib/news-saver";
import { seedCategories } from "@/lib/category-seeder";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) return false;

  const user = await db.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await seedCategories();
    const result = await saveIndiaNews();

    return NextResponse.json({
      success: true,
      message: "News fetched and saved successfully.",
      result,
    });
  } catch (error) {
    console.error("News fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch news.",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
