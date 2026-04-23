import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const IMG_DIR = path.join(process.cwd(), "public", "images", "articles");

/**
 * Extract all image URLs from content markdown.
 * Returns array of { fullMatch, alt, src }
 */
function extractImages(content: string) {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches: { fullMatch: string; alt: string; src: string }[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    matches.push({ fullMatch: m[0], alt: m[1], src: m[2] });
  }
  return matches;
}

/**
 * Check if a filename is in old "article-N-*" or "cover-N-*" format.
 */
function isOldFormat(filename: string): boolean {
  return /^(article|cover)-\d+[-_]/.test(filename);
}

/**
 * Build a new SEO-friendly filename for an image in this article.
 * Uses article slug + suffix (if old name had one) + index
 */
function newFilename(articleSlug: string, oldFilename: string, index: number): string {
  // Try to extract a meaningful suffix from old filename (e.g., "roses-fresh" from "article-1-roses-fresh.jpg")
  const baseOld = oldFilename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const suffixMatch = baseOld.match(/^(article|cover)-\d+[-_](.+)$/);
  const suffix = suffixMatch ? suffixMatch[2].trim() : "";

  const ext = (oldFilename.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] ?? ".jpg").toLowerCase();

  // If article has many images, use index; if single, just slug
  return suffix
    ? `${articleSlug}-${suffix}${ext}`
    : `${articleSlug}-${index + 1}${ext}`;
}

async function main() {
  console.log("🖼️  Image SEO Rename Migration\n");

  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, content: true, coverImage: true },
  });

  let totalImagesFound = 0;
  let totalRenamed = 0;
  let totalSkipped = 0;
  let articlesUpdated = 0;

  for (const article of articles) {
    const images = extractImages(article.content);
    const oldImages = images.filter((img) => {
      const filename = path.basename(img.src);
      return img.src.startsWith("/images/articles/") && isOldFormat(filename);
    });

    const oldCover = article.coverImage?.startsWith("/images/articles/") && isOldFormat(path.basename(article.coverImage))
      ? article.coverImage
      : null;

    if (oldImages.length === 0 && !oldCover) continue;

    totalImagesFound += oldImages.length + (oldCover ? 1 : 0);

    let newContent = article.content;
    let newCover = article.coverImage;
    let renamedThisArticle = 0;

    // Rename body images
    for (let i = 0; i < oldImages.length; i++) {
      const img = oldImages[i];
      const oldFilename = path.basename(img.src);
      const oldPath = path.join(IMG_DIR, oldFilename);
      const newName = newFilename(article.slug, oldFilename, i);
      const newPath = path.join(IMG_DIR, newName);

      if (!fs.existsSync(oldPath)) {
        totalSkipped++;
        continue;
      }

      // Copy (don't delete — safer, lets other articles using same image still work)
      if (!fs.existsSync(newPath)) {
        try {
          fs.copyFileSync(oldPath, newPath);
        } catch {
          totalSkipped++;
          continue;
        }
      }

      const newUrl = `/images/articles/${newName}`;
      // Replace this specific image markdown in content (use exact match via full match)
      const escapedFull = img.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      newContent = newContent.replace(new RegExp(escapedFull), `![${img.alt}](${newUrl})`);
      renamedThisArticle++;
      totalRenamed++;
    }

    // Rename cover image
    if (oldCover) {
      const oldFilename = path.basename(oldCover);
      const oldPath = path.join(IMG_DIR, oldFilename);
      const newName = newFilename(article.slug, oldFilename, 0).replace(/-\d+\.jpg$/, "-cover.jpg");
      const newPath = path.join(IMG_DIR, newName);

      if (fs.existsSync(oldPath)) {
        if (!fs.existsSync(newPath)) {
          try {
            fs.copyFileSync(oldPath, newPath);
          } catch {}
        }
        newCover = `/images/articles/${newName}`;
        totalRenamed++;
      }
    }

    if (renamedThisArticle > 0 || newCover !== article.coverImage) {
      await prisma.article.update({
        where: { id: article.id },
        data: { content: newContent, coverImage: newCover },
      });
      articlesUpdated++;
      console.log(`  ✓ ${article.title.slice(0, 55)} — renamed ${renamedThisArticle + (newCover !== article.coverImage ? 1 : 0)}`);
    }
  }

  console.log(`\n✅ Done`);
  console.log(`   ${totalImagesFound} old-format images found`);
  console.log(`   ${totalRenamed} renamed with SEO-friendly slugs`);
  console.log(`   ${totalSkipped} skipped (missing file)`);
  console.log(`   ${articlesUpdated} articles updated in DB`);
  console.log(`\n💡 Old files preserved (not deleted) — safe to delete manually once verified.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
