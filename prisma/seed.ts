import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { articles } from "../app/data/articles";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.article.deleteMany();
  // Note: listings are managed by seed-us.ts — do not wipe them here

  for (const a of articles) {
    await prisma.article.create({
      data: {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.coverImage,
        category: a.category,
        tags: JSON.stringify(a.tags),
        authorName: a.author.name,
        authorBio: a.author.bio,
        authorEmail: "",
        status: "published",
        featured: a.featured,
        readTime: a.readTime,
        publishedAt: a.publishedAt,
      },
    });
  }
  console.log(`✅ Seeded ${articles.length} articles`);
  console.log("🎉 Articles seeded. Run 'npx tsx prisma/seed-us.ts' to seed listings.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
