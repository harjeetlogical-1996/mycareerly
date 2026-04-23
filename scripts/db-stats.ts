import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }) } as any);
async function main() {
  const [articles, listings, cities, authors, categories, states, reviews, scheduled] = await Promise.all([
    p.article.count({ where: { status: "published" } }),
    p.listing.count({ where: { status: "approved" } }),
    p.city.count({ where: { active: true } }),
    p.author.count({ where: { active: true } }),
    p.category.count({ where: { active: true } }),
    Promise.resolve(51),
    p.review.count({ where: { status: "approved" } }),
    p.scheduledArticle.count({ where: { status: "pending" } }),
  ]);
  console.log(`  Articles (published): ${articles}`);
  console.log(`  Listings (approved):  ${listings}`);
  console.log(`  Cities (active):      ${cities}`);
  console.log(`  States:               ${states}`);
  console.log(`  Authors:              ${authors}`);
  console.log(`  Categories:           ${categories}`);
  console.log(`  Reviews (approved):   ${reviews}`);
  console.log(`  Articles (scheduled): ${scheduled}`);
  await p.$disconnect();
}
main().catch(console.error);
