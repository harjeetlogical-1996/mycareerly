import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const all = await prisma.article.findMany({
    where: { status: "published" },
    select: { slug: true, title: true, coverImage: true, content: true },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  for (const a of all) {
    // Extract all image URLs from content
    const imgs = Array.from(a.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((m) => m[1]);
    const unique = [...new Set(imgs)];
    console.log(`${a.slug.slice(0, 45)}`);
    console.log(`  cover: ${a.coverImage}`);
    console.log(`  body: ${unique.length} unique (of ${imgs.length} total)`);
    unique.slice(0, 3).forEach(u => console.log(`    ${u}`));
    console.log();
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
