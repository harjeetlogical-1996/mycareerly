import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")    // strip diacritics
    .replace(/&/g, " and ")
    .replace(/['']/g, "")               // strip apostrophes
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`🔗 Regenerating SEO slugs for ${listings.length} listings...\n`);

  const usedSlugs = new Set<string>();
  let updated = 0;
  let unchanged = 0;

  for (const listing of listings) {
    // Build SEO slug: {shop-name}-{city}
    const namePart = slugify(listing.name);
    const cityPart = slugify(listing.city);

    let baseSlug = namePart && cityPart ? `${namePart}-${cityPart}` : (namePart || cityPart || `listing-${listing.id.slice(0, 8)}`);

    // Trim to keep length sane
    if (baseSlug.length > 80) baseSlug = baseSlug.slice(0, 80).replace(/-[^-]*$/, "");

    // Ensure uniqueness
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);

    if (slug === listing.slug) {
      unchanged++;
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { slug },
    });
    updated++;

    if (updated <= 8 || updated % 100 === 0) {
      console.log(`  ✓ ${listing.name.slice(0, 38).padEnd(38)} → ${slug}`);
    }
  }

  console.log(`\n✅ Done`);
  console.log(`   ${updated} listings got new SEO slugs`);
  console.log(`   ${unchanged} already had correct slugs`);
  console.log(`   ${listings.length} total processed`);
  console.log(`\n💡 Next: update route lookup to support slugs + redirect old IDs`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
