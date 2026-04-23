import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const latest = await prisma.article.findFirst({
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, coverImage: true, content: true, createdAt: true },
  });
  if (!latest) { console.log("No articles"); return; }

  console.log(`📄 ${latest.title}`);
  console.log(`   slug: ${latest.slug}`);
  console.log(`   created: ${latest.createdAt}`);
  console.log(`   coverImage: "${latest.coverImage}"`);
  console.log(`   content length: ${latest.content.length} chars, ~${latest.content.split(/\s+/).length} words`);
  console.log();
  console.log("=== Image markdown in content ===");
  const matches = Array.from(latest.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
  console.log(`Found ${matches.length} image references:`);
  matches.forEach((m, i) => {
    console.log(`  ${i + 1}. alt="${m[1].slice(0, 60)}..." url="${m[2]}"`);
  });
  console.log();
  console.log("=== First 500 chars of content ===");
  console.log(latest.content.slice(0, 500));
}

main().catch(console.error).finally(() => prisma.$disconnect());
