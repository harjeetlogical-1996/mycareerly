import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) } as any);
async function main() {
  const authors = await prisma.author.findMany({ where: { active: true }, select: { name: true, specialty: true, bio: true } });
  for (const a of authors) console.log(`${a.name} — ${a.specialty}\n  ${a.bio.slice(0,120)}\n`);
  await prisma.$disconnect();
}
main();
