import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
} as any);

async function main() {
  // Real listings have a googlePlaceId starting with "ChIJ" (Google's place id format)
  const realCount = await prisma.listing.count({
    where: { googlePlaceId: { startsWith: "ChIJ" } },
  });
  const mockCount = await prisma.listing.count({
    where: { OR: [{ googlePlaceId: "" }, { googlePlaceId: { not: { startsWith: "ChIJ" } } }] },
  });
  const totalCount = await prisma.listing.count();

  console.log("=== Real vs Mock Listings ===");
  console.log(`Real (Google Places):  ${realCount}`);
  console.log(`Mock (synthetic seed): ${mockCount}`);
  console.log(`Total:                 ${totalCount}`);

  // Show 5 examples of mock listings (the original cities)
  const mockSamples = await prisma.listing.findMany({
    where: { OR: [{ googlePlaceId: "" }, { googlePlaceId: { not: { startsWith: "ChIJ" } } }] },
    take: 5,
    select: { name: true, city: true, phone: true, address: true, website: true },
  });
  console.log("\nSample MOCK listings (synthetic):");
  for (const m of mockSamples) {
    console.log(`  - ${m.name.padEnd(35)} | ${m.city.padEnd(20)} | ${m.phone}`);
    console.log(`    addr: ${m.address}`);
    console.log(`    web:  ${m.website}`);
  }

  // Show 5 examples of real listings (just imported)
  const realSamples = await prisma.listing.findMany({
    where: { googlePlaceId: { startsWith: "ChIJ" } },
    take: 5,
    select: { name: true, city: true, phone: true, address: true, website: true, reviewCount: true },
  });
  console.log("\nSample REAL listings (Google Places):");
  for (const r of realSamples) {
    console.log(`  - ${r.name.padEnd(35)} | ${r.city.padEnd(20)} | ${r.phone}`);
    console.log(`    addr: ${r.address}`);
    console.log(`    web:  ${r.website || "(none)"} | reviews: ${r.reviewCount}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
