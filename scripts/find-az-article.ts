import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const article = await prisma.article.findFirst({
    where: { slug: { contains: "a-to-z" } },
    select: { id: true, slug: true, title: true, content: true },
  });
  if (!article) { console.log("Not found"); return; }
  console.log(`${article.title}`);
  console.log(`slug: ${article.slug}`);
  console.log(`content preview: ${article.content.slice(0, 500)}...`);
  console.log(`---END OF PREVIEW---`);
  console.log(`content tail: ${article.content.slice(-500)}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
