import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { addInternalLinks } from "../app/lib/internalLinker";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`🔗 Adding internal links to ${articles.length} articles...`);

  let totalInserted = 0;
  let articlesUpdated = 0;

  for (const a of articles) {
    const res = await addInternalLinks({
      articleId: a.id,
      title: a.title,
      tags: a.tags,
      category: a.category,
      content: a.content,
      maxLinks: 2,
    });

    if (res.inserted > 0) {
      await prisma.article.update({
        where: { id: a.id },
        data: { content: res.content },
      });
      totalInserted += res.inserted;
      articlesUpdated++;
      console.log(`  ✓ ${a.title.slice(0, 50)} — added ${res.inserted} link(s): ${res.linkedTo.join(", ")}`);
    } else {
      console.log(`  · ${a.title.slice(0, 50)} — no match`);
    }
  }

  console.log(`\n✅ Done`);
  console.log(`   ${articlesUpdated}/${articles.length} articles updated`);
  console.log(`   ${totalInserted} total links inserted`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
