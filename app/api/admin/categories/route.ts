import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: session.value
    },
    select: {
      id: true,
      role: true
    }
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

function makeSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") ||
    `category-${Date.now()}`
  );
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required."
        },
        { status: 400 }
      );
    }

    const slug = makeSlug(name);

    const existing = await db.category.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive"
            }
          },
          {
            slug
          }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "यह category पहले से मौजूद है।"
        },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null
      }
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      category
    });
  } catch (error) {
    console.error("Category creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Category create करने में समस्या हुई।"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required."
        },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: {
        id
      },
      include: {
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found."
        },
        { status: 404 }
      );
    }

    if (category._count.news > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "इस category में news मौजूद हैं। पहले उन news को दूसरी category में move करें।"
        },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: {
        id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully."
    });
  } catch (error) {
    console.error("Category deletion failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Category delete करने में समस्या हुई।"
      },
      { status: 500 }
    );
  }
          }
