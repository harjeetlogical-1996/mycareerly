import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  generateArticle,
  autoSelectCategoryAndAuthor,
  generateArticleImages,
} from "../app/lib/generateArticle";
import { addInternalLinks } from "../app/lib/internalLinker";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_COVER = "/images/articles/cover-2-spring-flowers.jpg";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

// 44 SEO-focused titles from user brief
const TITLES: { title: string; reference?: string }[] = [
  // 🌸 Birth Month + Symbolism
  { title: "Birth Month Flowers: Meanings & Symbolism for Every Month", reference: "Primary & secondary birth flower per month, their meanings and origins, gift-giving angle" },
  { title: "Rose Color Meanings: What Every Color Really Symbolizes", reference: "Red = love, white = purity, yellow = friendship, pink = admiration, lavender = love at first sight, orange, black" },
  { title: "What Is My Birth Flower? Complete Guide by Month", reference: "Interactive-style guide, month-by-month with primary and alternate flowers + meanings" },
  { title: "50 Most Popular Flowers in the US with Pictures and Names", reference: "Top 50 flowers Americans buy, brief description of each, regional variations" },
  { title: "How to Keep Cut Flowers Fresh Longer: 15 Florist-Tested Tricks", reference: "Penny in vase myth debunked, aspirin, vodka, flower food DIY, lukewarm water, trim angles" },
  { title: "The Language of Flowers: Victorian Flower Symbolism Guide", reference: "Floriography history, 30+ flowers and Victorian secret meanings, dictionary format" },

  // 💒 Wedding
  { title: "2026 Wedding Flower Trends: What's In and What's Out", reference: "Dried florals return, delphinium Flower of Year, sculptural arrangements, mono-floral, muted plum/dusty blue palettes" },
  { title: "Wedding Flowers by Season: Spring, Summer, Fall, Winter Guide", reference: "Best available flowers per season in the US, with climate notes and cost implications" },
  { title: "Wedding Bouquet Styles: Cascade vs Posy vs Nosegay", reference: "Compare all major bouquet styles with photos, ideal body types, dress styles, pros/cons" },
  { title: "How Much Do Wedding Flowers Cost in the US? Real Budget Breakdown", reference: "$500 to $20,000 ranges, per-category breakdown (bouquets, arch, centerpieces), cost-saving tips" },
  { title: "Best Wedding Flowers for Each Month: US Availability Chart", reference: "12 months, what's in season, what's imported and expensive that month, climate zones" },
  { title: "Silk vs Fresh vs Dried Wedding Flowers: Pros, Cons, Costs", reference: "Three-way comparison, cost differences, longevity, photography considerations, styling tips" },

  // 🎁 Occasion-Based
  { title: "Best Valentine's Day Flowers Beyond Red Roses", reference: "Alternatives to roses — tulips, peonies, orchids, anemones — each with meaning and pricing" },
  { title: "Mother's Day Flowers: What Each One Means", reference: "Popular Mother's Day flowers — carnations, peonies, hydrangeas, gerberas — meanings and why they fit" },
  { title: "Funeral Flower Etiquette: What to Send and What to Avoid", reference: "White lilies, chrysanthemums, religious sensitivities, sympathy arrangements, card wording, what NOT to send" },
  { title: "Get Well Soon Flowers: Best Blooms to Send a Sick Friend", reference: "Cheerful colors, low-pollen for hospitals, scent considerations, durability, hospital rules" },
  { title: "Anniversary Flowers by Year: Traditional US Chart", reference: "1st anniversary = carnation through 60th, traditional chart with meanings, gift combo ideas" },
  { title: "Easter Flowers and Their Christian Symbolism", reference: "Easter lily, white roses, tulips, daffodils — biblical references and Resurrection symbolism" },
  { title: "Thanksgiving Centerpiece Flowers: DIY Ideas", reference: "Fall palette, pumpkins + mums, sunflowers, wheat, burgundy + gold, step-by-step for beginners" },

  // 🏡 Gardening / How-To
  { title: "How to Grow Peonies: Complete US Gardener's Guide", reference: "USDA zones 3-8, planting depth, fall planting, ants myth, 3+ year wait, cultivar recommendations" },
  { title: "Best Cut Flower Garden Plants for Beginners", reference: "Zinnias, cosmos, sunflowers, snapdragons, dahlias — easy-to-grow US-wide options, bed planning" },
  { title: "Deer-Resistant Flowers for Your US Garden", reference: "Deer avoidance list — daffodils, lavender, foxglove, salvia, alliums. Plus what NEVER works" },
  { title: "Drought-Tolerant Flowers for California, Texas & Arizona", reference: "Lavender, yarrow, penstemon, agastache, blanket flower, Mexican sage — Southwest climates" },
  { title: "Hummingbird-Attracting Flowers for Your Backyard", reference: "Red tubular flowers, salvia, trumpet vine, bee balm, fuchsia — feeder placement tips" },
  { title: "Bee-Friendly Flowers: 20 Best for US Pollinator Gardens", reference: "Native US species, bloom succession, colony collapse context, avoid neonicotinoid treated plants" },

  // 🌸 State / Local
  { title: "State Flower of Every US State: History, Meaning & Where to See It", reference: "All 50 states, quick table + standout stories for 10-15 of the most interesting ones" },
  { title: "Native Wildflowers of Texas, California, and Florida", reference: "Bluebonnets, California poppies, flame azalea — state-by-state native identification guide" },
  { title: "Best Flower Festivals in the US to Visit in 2026", reference: "Tulip Time Michigan, Rose Parade, Cherry Blossom DC, California Poppy Reserve — dates, tips" },

  // ❓ People Also Ask
  { title: "What Is the Rarest Flower in the World?", reference: "Middlemist red, ghost orchid, kadupul flower, Jade vine — rarity stories" },
  { title: "What Flower Lives Only One Day? The Daylily Guide", reference: "Hemerocallis lifecycle, multiple blooms per plant, US cultivars, care tips" },
  { title: "Which Flowers Bloom at Night? Complete Guide", reference: "Moonflower, night-blooming jasmine, evening primrose, cereus cactus, queen of the night" },
  { title: "What Flower Symbolizes New Beginnings?", reference: "Daffodil, cherry blossom, iris, lotus, snowdrop — symbolism across cultures" },
  { title: "Are Hydrangeas Poisonous to Dogs? Pet Safety Guide", reference: "Yes mildly toxic due to cyanide compounds, symptoms, vet advice, safe alternatives" },
  { title: "What Flowers Are Safe for Cats? Complete Pet-Safe List", reference: "Roses, sunflowers, snapdragons safe — AVOID lilies (kidney failure), tulips, daffodils, hydrangeas" },
  { title: "Why Do My Roses Keep Dying? 10 Common Mistakes", reference: "Overwatering, poor drainage, wrong pruning, no air circulation, disease (blackspot, rust), pests" },

  // 🌿 2026 Trending
  { title: "Why Delphinium Is the 2026 Flower of the Year", reference: "Flower Shop Network declaration, symbolism (joy, levity, strong bonds), varieties, care, gifting occasions" },
  { title: "Dried Flower Trend 2026: How to Use Them in Modern Decor", reference: "Muted plum, dusty blue, rust with cream palettes, DIY drying methods, styling ideas for weddings and home" },
  { title: "Sculptural Bouquets: The Architectural Flower Trend of 2026", reference: "Flower arrangements as art pieces, asymmetric shapes, single focal blooms with structural greenery, avant-garde designers" },
  { title: "Mono-Floral Arrangements: Why Less Is More in 2026", reference: "Single species in mass, statement-making, peonies or dahlias or tulips in one color, minimalist aesthetic" },

  // 💡 Low-Competition Long-Tail
  { title: "Are Tulips Perennials or Annuals in the US?", reference: "Technically perennial but most US climates treat as annuals, replant vs species tulips, zone differences" },
  { title: "How to Revive Wilted Roses in 30 Minutes", reference: "Hot water shock, recut under water, remove lower leaves, aspirin/sugar, cool dark place" },
  { title: "Cheap Wedding Flowers That Look Expensive (Under $500)", reference: "Carnations (yes really), alstroemeria, mums, greenery-heavy, DIY tips, store-bought flowers, bulk wholesalers" },
  { title: "Pet-Safe Houseplants That Flower Year-Round", reference: "African violet, orchid (most), Christmas cactus, bromeliad, gerbera daisy — truly non-toxic list" },
  { title: "Flowers That Mean Strength and Resilience", reference: "Gladiolus, protea, edelweiss, snapdragon, zinnia — symbolism for tough times, get-well or encouragement gifts" },
];

async function generateOne(title: string, reference: string) {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const { category, author } = await autoSelectCategoryAndAuthor(
    title,
    categories.map((c) => c.name),
    authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
  );

  const gen = await generateArticle(title, reference, category);
  const slug = await uniqueSlug(gen.slug || toSlug(gen.title));
  const imgs = await generateArticleImages(slug, gen.content);

  const a = await prisma.author.findFirst({ where: { name: author, active: true } });
  const bio = a?.bio ?? "";
  const email = a?.email ?? "";

  const linked = await addInternalLinks({
    title: gen.title,
    tags: JSON.stringify(gen.tags),
    category,
    content: imgs.updatedContent,
    maxLinks: 2,
  });

  const coverImage = imgs.coverImage || DEFAULT_COVER;

  await prisma.article.create({
    data: {
      slug,
      title: gen.title,
      excerpt: gen.excerpt,
      content: linked.content,
      coverImage,
      category,
      tags: JSON.stringify(gen.tags),
      authorName: author,
      authorBio: bio,
      authorEmail: email,
      status: "published",
      featured: false,
      readTime: gen.readTime,
      publishedAt: new Date().toISOString().split("T")[0],
      metaTitle: gen.metaTitle,
      metaDescription: gen.metaDescription,
      keywords: gen.keywords,
      faqs: JSON.stringify(gen.faqs),
    },
  });

  return {
    slug,
    title: gen.title,
    category,
    author,
    wordCount: gen.content.split(/\s+/).length,
    imagesGenerated: imgs.totalGenerated,
    imagesRequested: imgs.totalRequested,
    internalLinks: linked.inserted,
  };
}

async function main() {
  // Filter out titles already published (in case of resume)
  const existingTitles = new Set(
    (await prisma.article.findMany({ select: { title: true } })).map((a) => a.title.toLowerCase())
  );
  const todo = TITLES.filter((t) => !existingTitles.has(t.title.toLowerCase()));

  console.log(`📝 Publishing ${todo.length} SEO articles (${TITLES.length - todo.length} already exist)\n`);

  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < todo.length; i++) {
    const { title, reference } = todo[i];
    const progress = `[${(i + 1).toString().padStart(2)}/${todo.length}]`;
    process.stdout.write(`${progress} ${title.slice(0, 60)}... `);

    try {
      const res = await generateOne(title, reference ?? "");
      console.log(
        `✓ ${res.wordCount}w | imgs ${res.imagesGenerated}/${res.imagesRequested} | links ${res.internalLinks} | /${res.slug}`
      );
      succeeded++;
    } catch (e: any) {
      const msg = e.message?.slice(0, 100) ?? "unknown";
      console.log(`✗ ${msg}`);
      errors.push(`${title}: ${msg}`);
      failed++;
    }

    // Small delay between articles to avoid rate spikes
    if (i < todo.length - 1) await sleep(2000);
  }

  console.log(`\n✅ Complete`);
  console.log(`   ${succeeded}/${todo.length} published`);
  if (failed > 0) {
    console.log(`   ${failed} failed:`);
    errors.slice(0, 10).forEach((e) => console.log(`     · ${e}`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
