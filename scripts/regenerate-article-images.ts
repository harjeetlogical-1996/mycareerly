import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { generateArticleImages } from "../app/lib/generateArticle";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Patterns for the original 3 fallback images (now renamed but visually duplicate)
const FALLBACK_SUFFIXES = [
  "-spring-flowers.jpg",
  "-gifting-bouquet.jpg",
  "-popular-flowers.jpg",
];

function isFallbackUrl(url: string): boolean {
  return FALLBACK_SUFFIXES.some((s) => url.endsWith(s));
}

async function main() {
  const all = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, title: true, content: true, coverImage: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Articles where body or cover uses fallback-derived images
  const needsFix = all.filter((a) => {
    const bodyMatches = Array.from(a.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g));
    const hasDuplicateBody = bodyMatches.some((m) => isFallbackUrl(m[1]));
    const hasDuplicateCover = isFallbackUrl(a.coverImage);
    return hasDuplicateBody || hasDuplicateCover;
  });

  console.log(`🔄 Found ${needsFix.length}/${all.length} articles with duplicate fallback images\n`);

  let succeeded = 0;
  let failed = 0;
  let totalImagesGenerated = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const a = needsFix[i];
    const progress = `[${(i + 1).toString().padStart(2)}/${needsFix.length}]`;

    // Replace each fallback-derived image URL with a unique GEN_IMG placeholder
    // This preserves the alt text so Imagen generates a topically-relevant image
    let placeholderCount = 0;
    const newContent = a.content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, url) => {
        if (isFallbackUrl(url)) {
          placeholderCount++;
          return `![${alt}](GEN_IMG_${placeholderCount})`;
        }
        return match;
      }
    );

    if (placeholderCount === 0 && !isFallbackUrl(a.coverImage)) {
      console.log(`${progress} ${a.title.slice(0, 50)} — no placeholders to fix`);
      continue;
    }

    try {
      const result = await generateArticleImages(a.slug, newContent);

      await prisma.article.update({
        where: { id: a.id },
        data: {
          content: result.updatedContent,
          coverImage: result.coverImage || a.coverImage,
        },
      });

      totalImagesGenerated += result.totalGenerated;
      const statusIcon = result.totalGenerated > 0 ? "✓" : "⚠";
      console.log(
        `${progress} ${statusIcon} ${a.title.slice(0, 48)} — ${result.totalGenerated}/${result.totalRequested} fresh`
      );
      if (result.totalGenerated > 0) succeeded++;
      else failed++;
    } catch (e: any) {
      console.log(`${progress} ✗ ${a.title.slice(0, 48)} — ${e.message?.slice(0, 50)}`);
      failed++;
    }

    // Rate limit to avoid hammering Imagen
    if (i < needsFix.length - 1) await sleep(1500);
  }

  console.log(`\n✅ Done`);
  console.log(`   ${succeeded} articles with fresh unique images`);
  console.log(`   ${failed} still had issues`);
  console.log(`   ${totalImagesGenerated} total unique images generated`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
