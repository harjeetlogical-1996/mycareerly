/**
 * Downloads unique, topic-matched Unsplash images for all 26 articles
 * Saves to /public/images/articles/
 */
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "images", "articles");
fs.mkdirSync(OUT_DIR, { recursive: true });

const IMAGES: { file: string; id: string; alt: string }[] = [
  // id 1 — rose care
  { file: "article-1-roses-fresh.jpg",         id: "1548094990-c16ca90f1f0d", alt: "Fresh red roses in a vase" },
  // id 2 — spring flowers
  { file: "article-2-spring-flowers.jpg",       id: "1490750967868-88df5691cc1b", alt: "Colourful spring bouquet" },
  // id 3 — DIY arrangement
  { file: "article-3-diy-arrangement.jpg",      id: "1416879595882-3373a0480b5b", alt: "DIY flower arrangement on table" },
  // id 4 — wedding decor
  { file: "article-4-wedding-flowers.jpg",      id: "1561181286-d3fee7d55364", alt: "White wedding bouquet with roses" },
  // id 5 — gifting guide
  { file: "article-5-gifting-bouquet.jpg",      id: "1455659817273-f96807779a8a", alt: "Flower bouquet gift wrapping" },
  // id 6 — grow roses
  { file: "article-6-grow-roses.jpg",           id: "1566700571312-9f5a70d09f3c", alt: "Rose bushes in a home garden" },
  // id 7 — popular flowers
  { file: "article-7-popular-flowers.jpg",      id: "1487530811176-3780de880c2d", alt: "Assorted popular flowers in bloom" },
  // id 8 — favourite flowers
  { file: "article-8-favorite-flowers.jpg",     id: "1526047932273-341f2a7631f9", alt: "Beautiful assorted flower arrangement" },
  // id 9 — common flowers
  { file: "article-9-common-flowers.jpg",       id: "1489250479614-e3ef2eb0a8b6", alt: "Common flower varieties in shop" },
  // id 10 — 20 flower names
  { file: "article-10-twenty-flower-names.jpg", id: "1508610048659-a06b669e3321", alt: "Variety of named flower species" },
  // id 11 — 20-petal flowers
  { file: "article-11-many-petals.jpg",         id: "1562690868-60bbe7293e94", alt: "Ranunculus flower with many layered petals" },
  // id 12 — 10 beginner flower names
  { file: "article-12-beginner-flowers.jpg",    id: "1444462374-01bc620a4fde", alt: "Beginner-friendly flower selection" },
  // id 13 — quick reference
  { file: "article-13-flower-reference.jpg",    id: "1477120128765-a0528148fed6", alt: "Flower guide reference with various blooms" },
  // id 14 — most beautiful
  { file: "article-14-beautiful-flowers.jpg",   id: "1589994965851-a8f479c573a9", alt: "World's most beautiful exotic flowers" },
  // id 15 — prettiest
  { file: "article-15-prettiest-flowers.jpg",   id: "1534528741775-53994a69daeb", alt: "Pretty pastel flowers portrait" },
  // id 16 — forget-me-not birth month
  { file: "article-16-forget-me-not.jpg",       id: "1533038590840-1cde6e668a0d", alt: "Forget-me-not blue wildflowers in bloom" },
  // id 17 — prettiest in world
  { file: "article-17-prettiest-world.jpg",     id: "1582794443-4a22-4f5c-8fb4-ac6b2e13f37b", alt: "Garden rose considered world's prettiest flower" },
  // id 18 — medicinal flowers
  { file: "article-18-medicinal-flowers.jpg",   id: "1471879832106-c7ab9e0cee23", alt: "Lavender field used in herbal medicine" },
  // id 19 — identify flowers
  { file: "article-19-identify-flowers.jpg",    id: "1508216310433-00564428cd2f", alt: "Person identifying wild flower species" },
  // id 20 — top 5 popular
  { file: "article-20-top5-flowers.jpg",        id: "1548586500-b0d207cd5bc0", alt: "Top selling flowers at a flower market" },
  // id 21 — beginner guide 10
  { file: "article-21-ten-flowers-guide.jpg",   id: "1601004890684-d8cbf643f5f2", alt: "Ten essential flowers for beginners" },
  // id 22 — 20 flower name
  { file: "article-22-twenty-names.jpg",        id: "1518895312237-a9e23508077d", alt: "Mixed flower varieties with 20 different names" },
  // id 23 — A-Z flowers
  { file: "article-23-az-flowers.jpg",          id: "1464082354659-85d2bf587c8d", alt: "Complete A to Z collection of flower varieties" },
  // id 24 — red rose
  { file: "article-24-red-rose.jpg",            id: "1580551936775-2ebebfcd4849", alt: "Deep red rose close-up with water droplets" },
  // id 25 — cherry blossom
  { file: "article-25-cherry-blossom.jpg",      id: "1522383253-d4c5a24e8042", alt: "Pink cherry blossom branches in full bloom" },
  // id 26 — bouquet emoji
  { file: "article-26-bouquet.jpg",             id: "1533616688419-2a5b98b7e7a3", alt: "Colourful hand-held flower bouquet" },
];

async function download(file: string, id: string): Promise<boolean> {
  const url = `https://images.unsplash.com/photo-${id}?w=1200&q=80&fm=jpg&fit=crop`;
  const dest = path.join(OUT_DIR, file);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (florencia-site-builder/1.0)" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`  ✗ ${file} — HTTP ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`  ✓ ${file} (${Math.round(buffer.length / 1024)} KB)`);
    return true;
  } catch (e: any) {
    console.log(`  ✗ ${file} — ${e.message}`);
    return false;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\n📸 Downloading ${IMAGES.length} article images to public/images/articles/\n`);
  let ok = 0, fail = 0;
  for (const img of IMAGES) {
    const success = await download(img.file, img.id);
    success ? ok++ : fail++;
    await sleep(300);
  }
  console.log(`\n✅ Done — ${ok} downloaded, ${fail} failed\n`);
}

main().catch(console.error);
