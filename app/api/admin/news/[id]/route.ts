import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) return null;
  const user = await db.user.findUnique({ where: { id: session.value }, select: { id: true, role: true } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    const { id } = await context.params;
    const existingNews = await db.news.findUnique({ where: { id } });
    if (!existingNews) return NextResponse.json({ success: false, message: "News not found." }, { status: 404 });
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : existingNews.title;
    const description = typeof body.description === "string" ? body.description.trim() : existingNews.description;
    const content = typeof body.content === "string" ? body.content.trim() : existingNews.content;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : existingNews.imageUrl;
    const sourceName = typeof body.sourceName === "string" ? body.sourceName.trim() : existingNews.sourceName;
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : existingNews.sourceUrl;
    const authorName = typeof body.authorName === "string" ? body.authorName.trim() : existingNews.authorName;
    const sponsorName = typeof body.sponsorName === "string" ? body.sponsorName.trim() : existingNews.sponsorName;
    const sponsorUrl = typeof body.sponsorUrl === "string" ? body.sponsorUrl.trim() : existingNews.sponsorUrl;
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : existingNews.categoryId;
    const language = body.language === "EN" || body.language === "HI" ? body.language : existingNews.language;
    const status = body.status === "PUBLISHED" || body.status === "DRAFT" || body.status === "ARCHIVED" ? body.status : existingNews.status;
    const isFeatured = typeof body.isFeatured === "boolean" ? body.isFeatured : existingNews.isFeatured;
    const isBreaking = typeof body.isBreaking === "boolean" ? body.isBreaking : existingNews.isBreaking;
    const isOriginal = typeof body.isOriginal === "boolean" ? body.isOriginal : existingNews.isOriginal;
    const isSponsored = typeof body.isSponsored === "boolean" ? body.isSponsored : existingNews.isSponsored;

    if (!title) return NextResponse.json({ success: false, message: "Title is required." }, { status: 400 });
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ success: false, message: "Category not found." }, { status: 400 });

    const news = await db.news.update({
      where: { id },
      data: {
        title,
        description: description || null,
        content: content || null,
        imageUrl: imageUrl || null,
        sourceName: sourceName || null,
        sourceUrl: sourceUrl || null,
        authorName: authorName || null,
        sponsorName: sponsorName || null,
        sponsorUrl: sponsorUrl || null,
        categoryId,
        language,
        status,
        isFeatured,
        isBreaking,
        isOriginal,
        isSponsored,
        publishedAt: status === "PUBLISHED" ? existingNews.publishedAt || new Date() : null,
      },
      include: { category: true },
    });
    return NextResponse.json({ success: true, message: "News updated successfully.", news });
  } catch (error) {
    console.error("News update failed:", error);
    return NextResponse.json({ success: false, message: "News update करने में समस्या हुई।" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    const { id } = await context.params;
    const existingNews = await db.news.findUnique({ where: { id } });
    if (!existingNews) return NextResponse.json({ success: false, message: "News not found." }, { status: 404 });
    await db.news.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "News deleted successfully." });
  } catch (error) {
    console.error("News deletion failed:", error);
    return NextResponse.json({ success: false, message: "News delete करने में समस्या हुई।" }, { status: 500 });
  }
}
