import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const cats = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, color: true },
  });
  return NextResponse.json(cats);
}
