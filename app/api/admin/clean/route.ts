import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. सभी पुरानी खबरें डिलीट करें
    const deleted = await (db as any).news.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `डेटाबेस पूरी तरह साफ़ हो गया! कुल ${deleted.count} पुरानी खबरें हटा दी गईं।`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
