import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const categories = [
  { name: "Care Guide",  slug: "care-guide",  color: "#7A9E7E", order: 1, description: "Expert tips on how to care for, water, and extend the life of your flowers." },
  { name: "Seasonal",    slug: "seasonal",     color: "#E8705A", order: 2, description: "Seasonal flower guides: what's blooming, what to buy, and when." },
  { name: "Gifting",     slug: "gifting",      color: "#C95540", order: 3, description: "Flower gifting guides for every occasion: birthdays, anniversaries, and more." },
  { name: "Wedding",     slug: "wedding",      color: "#C95540", order: 4, description: "Everything you need to know about wedding flowers and bridal floristry." },
  { name: "DIY",         slug: "diy",          color: "#7A9E7E", order: 5, description: "Step-by-step DIY flower arrangement tutorials for beginners and pros." },
  { name: "Expert Tips", slug: "expert-tips",  color: "#7A9E7E", order: 6, description: "Professional insights and expert knowledge from seasoned florists." },
  { name: "Stories",     slug: "stories",      color: "#E8705A", order: 7, description: "Flower stories, history, culture, and the meaning behind blooms." },
];

async function main() {
  console.log("🌱 Seeding categories...");
  for (const cat of categories) {
    await (prisma as any).category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color, order: cat.order, description: cat.description },
      create: { ...cat, active: true },
    });
    console.log(`  ✓ ${cat.name}`);
  }
  console.log("🎉 Categories seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
