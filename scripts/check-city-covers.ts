import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
} as any);

async function main() {
  const cities = await prisma.city.findMany({
    orderBy: [{ order: "asc" }],
    select: { name: true, state: true, slug: true, coverImage: true, heroImage: true, order: true },
  });

  console.log("Total cities:", cities.length);

  // Group by cover URL pattern
  const groups: Record<string, number> = {};
  for (const c of cities) {
    const cover = c.coverImage || "(empty)";
    let bucket = "other";
    if (cover === "(empty)") bucket = "(empty)";
    else if (cover.includes("unsplash")) bucket = "unsplash";
    else if (cover.includes("places.googleapis")) bucket = "google_places";
    else if (cover.startsWith("/")) bucket = "local /images";
    else bucket = cover.slice(0, 60);
    groups[bucket] = (groups[bucket] || 0) + 1;
  }
  console.log("\nCover image source breakdown:");
  for (const [k, v] of Object.entries(groups)) console.log(`  ${k.padEnd(40)} ${v}`);

  // Show first 10 new cities (order >= 100, where I inserted them) to inspect their covers
  const newCities = cities.filter((c) => c.order >= 100).slice(0, 10);
  console.log("\nFirst 10 NEW tier-2 cities (their covers):");
  for (const c of newCities) {
    console.log(`  ${c.name.padEnd(20)} ${c.state.padEnd(4)} cover: ${c.coverImage.slice(0, 80)}`);
  }

  // Show first 5 ORIGINAL cities (order < 100)
  const oldCities = cities.filter((c) => c.order < 100).slice(0, 5);
  console.log("\nFirst 5 ORIGINAL cities (their covers):");
  for (const c of oldCities) {
    console.log(`  ${c.name.padEnd(20)} ${c.state.padEnd(4)} cover: ${c.coverImage.slice(0, 80)}`);
  }

  await prisma.$disconnect();
}
main().catch(console.error);
