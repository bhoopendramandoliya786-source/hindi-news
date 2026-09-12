import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

// Lightweight per-instance protection against repeated credential guessing.
// Vercel can run multiple instances, so this is deliberately only a first layer;
// the admin endpoint still requires the database-backed account check.
type Attempt = { count: number; resetAt: number; blockedUntil: number };
const attempts = new Map<string, Attempt>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;
const BLOCK_MS = 15 * 60 * 1000;

function getClientKey(request: Request, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${forwarded || realIp || "unknown"}:${email}`;
}

function registerFailure(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS, blockedUntil: 0 });
    return;
  }
  current.count += 1;
  if (current.count >= MAX_FAILURES) current.blockedUntil = now + BLOCK_MS;
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password || email.length > 254 || password.length > 256) {
      return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    }

    const key = getClientKey(request, email);
    const current = attempts.get(key);
    if (current?.blockedUntil && current.blockedUntil > Date.now()) {
      return NextResponse.json({ success: false, message: "बहुत अधिक असफल प्रयास हुए हैं। कुछ देर बाद फिर कोशिश करें।" }, { status: 429, headers: { "Retry-After": String(Math.ceil((current.blockedUntil - Date.now()) / 1000)) } });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      registerFailure(key);
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      registerFailure(key);
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    clearAttempts(key);
    const response = NextResponse.json({ success: true, message: "Login successful." });
    response.cookies.set("admin_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ success: false, message: "Unable to login." }, { status: 500 });
  }
}
