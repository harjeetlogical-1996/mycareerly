import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const cities = await prisma.city.findMany();
  console.log(`Fixing meta descriptions for ${cities.length} cities...`);
  let fixed = 0;
  for (const c of cities) {
    const listingCount = await prisma.listing.count({ where: { citySlug: c.slug, status: "approved" } });
    // Keep under 155 chars for safety (Google shows ~150-158)
    const newMeta = `Find ${c.name}'s best flower shops. ${listingCount} verified florists with reviews, same-day delivery, wedding specialists in ${c.stateFull || c.state}.`.slice(0, 155);
    if (c.metaDescription !== newMeta) {
      await prisma.city.update({ where: { id: c.id }, data: { metaDescription: newMeta } });
      fixed++;
    }
  }
  console.log(`✅ Updated ${fixed} city meta descriptions`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
