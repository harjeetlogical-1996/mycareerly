import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import https from "https";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function check(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => { resolve(res.statusCode === 200); res.resume(); })
      .on("error", () => resolve(false));
  });
}

async function main() {
  const cities = await prisma.city.findMany({ select: { slug: true, name: true, coverImage: true } });
  console.log(`Checking ${cities.length} city images...`);
  const broken: { slug: string; name: string; photoId: string }[] = [];
  for (const c of cities) {
    if (!c.coverImage) continue;
    const testUrl = c.coverImage.replace(/w=\d+/, "w=200");
    const ok = await check(testUrl);
    if (!ok) broken.push({ slug: c.slug, name: c.name, photoId: c.coverImage.match(/photo-([^?]+)/)?.[1] ?? "unknown" });
  }
  console.log(`\nBroken: ${broken.length}`);
  broken.forEach((b) => console.log(`   ${b.slug} (${b.name}) -> ${b.photoId}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
