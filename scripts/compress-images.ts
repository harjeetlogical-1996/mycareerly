/**
 * One-off: compress every JPG in public/images/articles to ~150-200 KB
 * using sharp. Preserves filename, replaces in-place with backup.
 *
 * Usage: npx tsx scripts/compress-images.ts
 *
 * Effect: site images shrink from ~606 MB to ~60-90 MB total.
 * Mobile LCP should drop from 15s to <3s.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "images", "articles");
const BACKUP_DIR = path.join(process.cwd(), "public", "images", "articles-originals");
const MAX_WIDTH = 1600; // Enough for 2x retina displays, article cards are ~800px wide
const QUALITY = 80; // JPEG quality — 80 is visually lossless for photos

async function main() {
  if (!fs.existsSync(DIR)) {
    console.error(`Directory not found: ${DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
  console.log(`Found ${files.length} images to process`);

  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const srcPath = path.join(DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    const beforeSize = fs.statSync(srcPath).size;

    // Skip if already quite small (< 220 KB) — process everything bigger
    if (beforeSize < 220 * 1024) {
      skipped++;
      continue;
    }

    try {
      // Read file into memory first, THEN pass buffer to sharp (avoids Windows file lock issues)
      const input = fs.readFileSync(srcPath);
      const buffer = await sharp(input)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();

      // Only replace if smaller (don't make it bigger)
      if (buffer.length < beforeSize) {
        // Backup original (skip if already backed up)
        if (!fs.existsSync(backupPath)) fs.copyFileSync(srcPath, backupPath);
        // Overwrite
        fs.writeFileSync(srcPath, buffer);
        totalBefore += beforeSize;
        totalAfter += buffer.length;
        processed++;
        const savedPct = Math.round((1 - buffer.length / beforeSize) * 100);
        process.stdout.write(`\r[${processed}/${files.length}] ${file.slice(0, 40).padEnd(40)} ${(beforeSize / 1024).toFixed(0)}kb → ${(buffer.length / 1024).toFixed(0)}kb (-${savedPct}%)`);
      } else {
        skipped++;
      }
    } catch (e: any) {
      console.error(`\nFailed: ${file}: ${e.message}`);
    }
  }

  console.log(`\n\n✅ Processed: ${processed} | Skipped: ${skipped}`);
  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`After:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB (${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
  console.log(`\nBackups saved to: ${BACKUP_DIR}`);
  console.log(`If anything looks bad, restore with:  cp ${BACKUP_DIR}/* ${DIR}/`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
