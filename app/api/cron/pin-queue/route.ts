import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../lib/settings";
import { postPin } from "../../../lib/pinterest/publish";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET || process.env.JWT_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const autoFlag = (await getSetting(SETTING_KEYS.PINTEREST_AUTO_POST_ENABLED)) === "true";
  if (!autoFlag) {
    return NextResponse.json({ ok: true, skipped: "auto_post_disabled", ranAt: new Date().toISOString() });
  }

  const maxPerRunRaw = await getSetting(SETTING_KEYS.PINTEREST_MAX_PINS_PER_DAY);
  const maxPerRun = Math.max(1, Math.min(100, parseInt(maxPerRunRaw || "20", 10) || 20));

  const now = new Date();
  const rows = await prisma.pinterestPin.findMany({
    where: {
      status: { in: ["queued", "scheduled", "failed"] },
      attempts: { lt: MAX_ATTEMPTS },
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    take: maxPerRun,
  });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const r of rows) {
    const out = await postPin(r.id);
    results.push({ id: r.id, ...out });
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
    ranAt: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
