import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { generateArticleImages } from "../app/lib/generateArticle";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Title substrings to match (case-insensitive)
const TARGETS = [
  "keep your roses fresh",
  "grow roses at home",
  "prettiest flowers according to florists",
  "most beautiful flowers in the world",
];

async function main() {
  const all = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, title: true, content: true, coverImage: true },
  });

  const matched = all.filter((a) =>
    TARGETS.some((t) => a.title.toLowerCase().includes(t.toLowerCase()))
  );

  console.log(`🎯 Matched ${matched.length} articles:\n`);
  matched.forEach((a) => console.log(`   · ${a.title}`));
  console.log();

  let totalGenerated = 0;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < matched.length; i++) {
    const a = matched[i];
    const progress = `[${i + 1}/${matched.length}]`;

    // Replace ALL inline images + cover with GEN_IMG placeholders to force full regen
    let placeholderCount = 0;
    const newContent = a.content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_m, alt) => {
        placeholderCount++;
        // Enrich the alt text with article context so Imagen gets better prompts
        const enrichedAlt = alt.includes(a.title.split(":")[0].slice(0, 30))
          ? alt
          : `${alt} (relevant to: ${a.title.slice(0, 50)})`;
        return `![${enrichedAlt}](GEN_IMG_${placeholderCount})`;
      }
    );

    console.log(`\n${progress} ${a.title}`);
    console.log(`   Replacing ${placeholderCount} images with fresh Nano Banana Pro generations...`);

    try {
      const result = await generateArticleImages(a.slug, newContent);

      await prisma.article.update({
        where: { id: a.id },
        data: {
          content: result.updatedContent,
          coverImage: result.coverImage || a.coverImage,
        },
      });

      console.log(`   ✓ ${result.totalGenerated}/${result.totalRequested} fresh images`);
      totalGenerated += result.totalGenerated;
      if (result.totalGenerated > 0) succeeded++;
      else failed++;
    } catch (e: any) {
      console.log(`   ✗ ${e.message?.slice(0, 80)}`);
      failed++;
    }

    if (i < matched.length - 1) await sleep(2000);
  }

  console.log(`\n✅ Done`);
  console.log(`   ${succeeded}/${matched.length} articles regenerated`);
  console.log(`   ${totalGenerated} total unique images`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
