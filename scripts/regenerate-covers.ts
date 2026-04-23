import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";
import https from "https";

const GEMINI_KEY = "AIzaSyB5jteecTdcJuiWOXlj3uIm4wDHS6i6gEo";
const IMAGE_MODEL_CHAIN = [
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
];

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const TARGETS = [
  "keep your roses fresh",
  "grow roses at home",
  "prettiest flowers according to florists",
  "most beautiful flowers in the world",
];

// Custom cover prompts — cinematic, hero-style, relevant to each article
const COVER_PROMPTS: Record<string, string> = {
  "keep your roses fresh":
    "Cinematic hero shot of a stunning bouquet of vibrant red roses in a pristine clear glass vase on a white marble countertop, soft natural window light, water droplets on petals suggesting freshness, shallow depth of field, magazine editorial style, 16:9 landscape composition",
  "grow roses at home":
    "Cinematic wide shot of a lush home rose garden in full bloom — pink, red, and white David Austin roses climbing a rustic trellis, gardener's gloved hand gently cradling one perfect rose, golden hour sunlight streaming through, cottage garden aesthetic, high-end horticultural photography, 16:9 landscape",
  "prettiest flowers according to florists":
    "Cinematic overhead flat-lay composition of 8 different stunning flower varieties — peonies, ranunculus, garden roses, anemones, dahlias, orchids, hydrangeas, lilies — arranged on a soft pastel background, editorial luxury florist styling, magazine quality, 16:9 landscape",
  "most beautiful flowers in the world":
    "Cinematic composition showcasing the world's most beautiful exotic flowers — a central white lotus rising from still water, surrounded by blue poppies, bird of paradise, orchids, and proteas, dramatic soft lighting, dreamlike atmosphere, fine art floral photography, 16:9 landscape hero image",
};

async function callImageModel(model: string, prompt: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const parts = json.candidates?.[0]?.content?.parts ?? [];
            for (const p of parts) {
              const b64 = p.inlineData?.data ?? p.inline_data?.data;
              if (b64) return resolve(Buffer.from(b64, "base64"));
            }
            resolve(null);
          } catch { resolve(null); }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.write(body);
    req.end();
  });
}

async function generateCover(prompt: string): Promise<Buffer | null> {
  for (const model of IMAGE_MODEL_CHAIN) {
    const bytes = await callImageModel(model, prompt);
    if (bytes) return bytes;
  }
  return null;
}

async function main() {
  const all = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, title: true, content: true, coverImage: true },
  });

  const matched = all.filter((a) =>
    TARGETS.some((t) => a.title.toLowerCase().includes(t.toLowerCase()))
  );

  console.log(`🎯 Generating dedicated hero covers for ${matched.length} articles\n`);

  const outputDir = path.join(process.cwd(), "public", "images", "articles");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (let i = 0; i < matched.length; i++) {
    const a = matched[i];
    const promptKey = TARGETS.find((t) => a.title.toLowerCase().includes(t.toLowerCase()))!;
    const prompt = COVER_PROMPTS[promptKey];

    console.log(`\n[${i + 1}/${matched.length}] ${a.title}`);
    console.log(`   Prompt: ${prompt.slice(0, 90)}...`);

    const bytes = await generateCover(prompt);
    if (!bytes) {
      console.log(`   ✗ Generation failed`);
      continue;
    }

    const filename = `${a.slug}-hero-cover.jpg`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, bytes);
    const coverUrl = `/images/articles/${filename}`;

    await prisma.article.update({
      where: { id: a.id },
      data: { coverImage: coverUrl },
    });

    console.log(`   ✓ Cover saved: ${filename} (${(bytes.length / 1024).toFixed(0)}KB)`);

    // small delay between articles
    if (i < matched.length - 1) await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n✅ Done — all 4 articles have new dedicated hero covers`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
