import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
} as any);

const NEW_KEY = "AIzaSyBGOm5NmEiIVdetSs5IEPx4V9j0JRnY4_E";

async function main() {
  // 1. Save new Gemini key
  await prisma.setting.upsert({
    where: { key: "gemini_api_key" },
    update: { value: NEW_KEY },
    create: { key: "gemini_api_key", value: NEW_KEY },
  });
  console.log("✅ Gemini key saved to DB");

  // 2. Verify by calling Gemini
  const testRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${NEW_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "say 'ok' in 1 word" }] }] }),
    }
  );
  const testJson = await testRes.json() as any;
  if (testJson.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log("✅ Gemini key works, response:", testJson.candidates[0].content.parts[0].text.slice(0, 30));
  } else {
    console.log("❌ Gemini key NOT working:", JSON.stringify(testJson).slice(0, 300));
  }

  // 3. Audit cities with missing/empty cover images
  const cities = await prisma.city.findMany({
    select: { name: true, slug: true, state: true, coverImage: true, heroImage: true },
  });
  const missingCover = cities.filter((c) => !c.coverImage || c.coverImage === "");
  const missingHero = cities.filter((c) => !c.heroImage || c.heroImage === "");
  console.log(`\n📊 Total cities: ${cities.length}`);
  console.log(`   Missing cover: ${missingCover.length}`);
  console.log(`   Missing hero:  ${missingHero.length}`);
  if (missingCover.length > 0) {
    console.log("\n  Cities with empty coverImage:");
    missingCover.forEach((c) => console.log(`   - ${c.name} (${c.slug})`));
  }
  if (missingHero.length > 0) {
    console.log("\n  Cities with empty heroImage:");
    missingHero.forEach((c) => console.log(`   - ${c.name} (${c.slug})`));
  }

  await prisma.$disconnect();
}
main().catch(console.error);
