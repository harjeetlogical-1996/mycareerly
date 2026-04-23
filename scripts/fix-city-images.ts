import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import https from "https";
import { createHash } from "crypto";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

// 32 verified flower/florist Unsplash photos
const POOL = [
  "1558618666-fcd25c85cd64","1501004318641-b39e6451bec6","1459411621453-7b03977f4bfc",
  "1562690868-60bbe7293e94","1518709766631-a6a7f45921c3","1441986300917-64674bd600d8",
  "1416879595882-3373a0480b5b","1519378058457-4c29a0a2efac","1453946610176-6be21147c400",
  "1533038590840-1cde6e668a91","1468327768560-75b778cbb551","1426604966848-d7adac402bff",
  "1449824913935-59a10b8d2000","1453847668862-487637052f8a","1509937528035-ad76254b0356",
  "1473968512647-3e447244af8f","1513279922550-250c2129b13a","1509233725247-49e657c54213",
  "1462143338528-eca9936a4d09","1508610048659-a06b669e3321","1563241527-3004b7be0ffd",
  "1612336307429-8a898d10e223","1519722417352-7d6959729417","1553062407-98eeb64c6a62",
  "1556228453-efd6c1ff04f6","1508784411316-02b8cd4d3a3a","1518562180175-34a163b1a9a6",
  "1606216794074-735e91aa2c92","1519741497674-611481863552","1526662092594-e98c1e356d6a",
  "1491438590914-bc09fcaaf77a","1519225421980-715cb0215aed",
];

const url = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

function check(u: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(u.replace(/w=\d+/, "w=200"), (res) => { resolve(res.statusCode === 200); res.resume(); })
      .on("error", () => resolve(false));
  });
}

function pickForSlug(slug: string): string {
  const h = createHash("sha256").update(slug).digest();
  return POOL[h[0] % POOL.length];
}

async function main() {
  const cities = await prisma.city.findMany();
  console.log(`Fixing images for ${cities.length} cities...`);
  let fixed = 0;
  for (const c of cities) {
    const currentOk = c.coverImage ? await check(c.coverImage) : false;
    if (!currentOk) {
      const photoId = pickForSlug(c.slug);
      await prisma.city.update({
        where: { id: c.id },
        data: {
          coverImage: url(photoId, 800),
          heroImage: url(photoId, 1600),
        },
      });
      fixed++;
    }
  }
  console.log(`✅ Fixed ${fixed} cities with broken images`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
