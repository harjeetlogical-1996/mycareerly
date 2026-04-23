import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const fakes = await prisma.listing.findMany({
    where: { verified: false },
    select: { name: true, city: true, citySlug: true },
  });
  console.log(`Still fake (not verified): ${fakes.length}`);
  fakes.forEach((f) => console.log(`  ${f.name} — ${f.city}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
