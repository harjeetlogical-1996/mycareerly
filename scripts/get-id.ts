import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);
async function main() {
  const l = await prisma.listing.findFirst({ where: { status: "approved" }, select: { id: true, name: true } });
  console.log(l?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
