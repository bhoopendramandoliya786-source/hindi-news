import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin setup is not configured."
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const secret =
      typeof body.secret === "string"
        ? body.secret
        : "";

    if (secret !== setupSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : null;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required."
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters."
        },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists."
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully.",
      user
    });
  } catch (error) {
    console.error("Admin creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create admin account."
      },
      { status: 500 }
    );
  }
        }
