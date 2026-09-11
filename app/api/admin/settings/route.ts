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

export async function GET() {
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

    const settings = await db.siteSettings.upsert({
      where: {
        id: "default"
      },
      update: {},
      create: {
        id: "default"
      }
    });

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("Settings load failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Settings load करने में समस्या हुई।"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const stringField = (value: unknown) =>
      typeof value === "string" && value.trim()
        ? value.trim()
        : null;

    const breakingEnabled =
      typeof body.breakingEnabled === "boolean"
        ? body.breakingEnabled
        : true;

    const settings = await db.siteSettings.upsert({
      where: {
        id: "default"
      },
      update: {
        siteName:
          typeof body.siteName === "string" &&
          body.siteName.trim()
            ? body.siteName.trim()
            : "Hindi News",

        siteDescription: stringField(
          body.siteDescription
        ),

        logoUrl: stringField(body.logoUrl),

        contactEmail: stringField(
          body.contactEmail
        ),

        contactPhone: stringField(
          body.contactPhone
        ),

        address: stringField(body.address),

        websiteUrl: stringField(
          body.websiteUrl
        ),

        facebookUrl: stringField(
          body.facebookUrl
        ),

        instagramUrl: stringField(
          body.instagramUrl
        ),

        youtubeUrl: stringField(
          body.youtubeUrl
        ),

        breakingEnabled
      },
      create: {
        id: "default",

        siteName:
          typeof body.siteName === "string" &&
          body.siteName.trim()
            ? body.siteName.trim()
            : "Hindi News",

        siteDescription: stringField(
          body.siteDescription
        ),

        logoUrl: stringField(body.logoUrl),

        contactEmail: stringField(
          body.contactEmail
        ),

        contactPhone: stringField(
          body.contactPhone
        ),

        address: stringField(body.address),

        websiteUrl: stringField(
          body.websiteUrl
        ),

        facebookUrl: stringField(
          body.facebookUrl
        ),

        instagramUrl: stringField(
          body.instagramUrl
        ),

        youtubeUrl: stringField(
          body.youtubeUrl
        ),

        breakingEnabled
      }
    });

    return NextResponse.json({
      success: true,
      message: "Settings successfully saved.",
      settings
    });
  } catch (error) {
    console.error("Settings save failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Settings save करने में समस्या हुई।"
      },
      { status: 500 }
    );
  }
}
