/**
 * Fix article internal links: bare /<listing-slug> → /listings/<listing-slug>.
 *
 * The articles were authored with shortened paths assuming the listing route was
 * /<slug>, but the actual route is /listings/<slug>. We rewrite every occurrence
 * of `](/X)` where X matches a real listing slug in the DB.
 *
 * Idempotent — already-correct /listings/... links are untouched.
 */
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  } as any);

  // Load all listing slugs into a Set for O(1) lookup
  const listings = await prisma.listing.findMany({ select: { slug: true } });
  const slugSet = new Set(listings.map((l: any) => l.slug));
  console.log(`Loaded ${slugSet.size} listing slugs.`);

  // Only the 5 city articles
  const SLUGS = [
    "best-flower-shops-new-york-city-2026-florist-guide",
    "where-to-buy-wedding-flowers-in-los-angeles-florists-picks",
    "same-day-flower-delivery-chicago-complete-guide",
    "best-flowers-in-season-texas-houston-florist-guide",
    "san-francisco-flower-markets-where-locals-shop",
  ];

  for (const articleSlug of SLUGS) {
    const a = await prisma.article.findUnique({ where: { slug: articleSlug } });
    if (!a) {
      console.log(`  ✗ Not found: ${articleSlug}`);
      continue;
    }

    let content = a.content as string;
    let fixed = 0;

    // ](/X)  →  ](/listings/X)   if X is a real listing slug
    content = content.replace(/\]\(\/([a-z0-9-]+)\)/g, (m, slug) => {
      if (slugSet.has(slug)) {
        fixed++;
        return `](/listings/${slug})`;
      }
      return m;
    });

    if (fixed > 0) {
      await prisma.article.update({ where: { slug: articleSlug }, data: { content } });
      console.log(`  ✓ ${articleSlug}: fixed ${fixed} listing link(s)`);
    } else {
      console.log(`  · ${articleSlug}: nothing to fix`);
    }
  }

  await prisma.$disconnect();
}
main().catch(console.error);
