import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
} as any);

async function main() {
  for (const slug of ["los-angeles", "chicago", "houston", "san-francisco"]) {
    const listings = await prisma.listing.findMany({
      where: { citySlug: slug, status: "approved" },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 12,
      select: {
        slug: true, name: true, tagline: true, address: true, phone: true,
        website: true, rating: true, reviewCount: true, categories: true,
        priceRange: true, established: true,
      },
    });
    console.log(`\n========== ${slug.toUpperCase()} (${listings.length}) ==========`);
    for (const l of listings) {
      console.log(`${l.name} (${l.rating}★ / ${l.reviewCount} reviews / est ${l.established})`);
      console.log(`  /${l.slug}  · ${l.address}`);
      console.log(`  tag: ${l.tagline}`);
      console.log(`  cats: ${l.categories} · price: ${l.priceRange}`);
    }
  }
  await prisma.$disconnect();
}
main().catch(console.error);
