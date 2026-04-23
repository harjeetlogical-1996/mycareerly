import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);
async function main() {
  const samples = await prisma.listing.findMany({
    where: { status: "approved" },
    select: { id: true, slug: true, name: true, city: true, state: true },
    take: 10,
    orderBy: { rating: "desc" },
  });
  console.log("CURRENT URLS (using ID):");
  samples.forEach(s => console.log(`  /listings/${s.id} → ${s.name}, ${s.city}`));
  console.log("\nDB SLUGS (already exist):");
  samples.forEach(s => console.log(`  /listings/${s.slug} → ${s.name}, ${s.city}`));
  console.log("\nIDEAL SEO URL:");
  samples.forEach(s => console.log(`  /listings/${s.city.toLowerCase().replace(/\s+/g,"-")}/${s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
