import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { generateArticleImages } from "../app/lib/generateArticle";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Find articles with missing cover OR placeholder URLs in content
  const all = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, coverImage: true, content: true },
  });

  const needsFix = all.filter(
    (a) =>
      !a.coverImage ||
      a.coverImage === "" ||
      a.content.includes("placeholder.jpg") ||
      a.content.includes("PLACEHOLDER_") ||
      a.content.includes("GEN_IMG_")
  );

  console.log(`Found ${needsFix.length} articles needing image backfill`);

  for (const a of needsFix) {
    console.log(`\n📄 ${a.title}`);
    try {
      const result = await generateArticleImages(a.slug, a.content);
      console.log(`   Generated ${result.totalGenerated}/${result.totalRequested} images`);

      await prisma.article.update({
        where: { id: a.id },
        data: {
          content: result.updatedContent,
          coverImage: result.coverImage || "/images/articles/cover-2-spring-flowers.jpg",
        },
      });
      console.log(`   ✓ Updated DB`);
    } catch (e: any) {
      console.error(`   ✗ Failed: ${e.message}`);
    }
  }

  console.log(`\n✅ Done`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
