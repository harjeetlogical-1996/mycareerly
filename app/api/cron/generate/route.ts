import { NextRequest, NextResponse } from "next/server";
import { runDueScheduled } from "../../../actions/articleGen";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Basic protection — require a secret header or query param
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET || process.env.JWT_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDueScheduled();
  return NextResponse.json({
    ok: true,
    ...result,
    ranAt: new Date().toISOString(),
  });
}

// Also accept POST for Vercel Cron
export async function POST(req: NextRequest) {
  return GET(req);
}
