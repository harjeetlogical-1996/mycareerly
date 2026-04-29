import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
} as any);

async function main() {
  const nyc = await prisma.listing.findMany({
    where: {
      OR: [
        { citySlug: "new-york" },
        { city: "New York" },
      ],
      status: "approved",
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 12,
    select: {
      slug: true,
      name: true,
      tagline: true,
      address: true,
      phone: true,
      website: true,
      rating: true,
      reviewCount: true,
      categories: true,
      tags: true,
      priceRange: true,
      established: true,
    },
  });
  console.log(`Found ${nyc.length} NYC listings:\n`);
  for (const l of nyc) {
    console.log(`${l.name}`);
    console.log(`  slug: ${l.slug}`);
    console.log(`  tagline: ${l.tagline}`);
    console.log(`  address: ${l.address}`);
    console.log(`  phone: ${l.phone}, ${l.rating}★ (${l.reviewCount} reviews)`);
    console.log(`  website: ${l.website}`);
    console.log(`  cats: ${l.categories}`);
    console.log(`  est: ${l.established}, price: ${l.priceRange}`);
    console.log("");
  }
  await prisma.$disconnect();
}
main().catch(console.error);
