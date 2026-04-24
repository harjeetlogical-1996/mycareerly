import https from "https";
import fs from "fs";
import path from "path";
import { getGeminiApiKey } from "./gemini";

// Fallback chain: try primary → fallback → last resort
// Primary = Gemini 3.1 Flash Lite (fast, cheap, latest generation)
const MODEL_CHAIN = [
  "gemini-3.1-flash-lite-preview",  // Latest 3.1 — primary
  "gemini-2.5-flash-lite",           // Stable fallback (proven)
  "gemini-2.5-flash",                // Heavier fallback
  "gemini-flash-latest",             // Last resort (Google-managed alias)
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransientError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("high demand") ||
    m.includes("overloaded") ||
    m.includes("rate limit") ||
    m.includes("quota") ||
    m.includes("unavailable") ||
    m.includes("resource_exhausted") ||
    m.includes("503") ||
    m.includes("429") ||
    m.includes("500")
  );
}

async function callModel(model: string, prompt: string, maxTokens: number, apiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
    });
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return resolve(text);
            const errMsg = json.error?.message || `HTTP ${res.statusCode}: no text`;
            reject(new Error(errMsg));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function callGemini(prompt: string, maxTokens = 16384): Promise<string> {
  let lastError: Error | null = null;
  const apiKey = await getGeminiApiKey();

  for (let modelIdx = 0; modelIdx < MODEL_CHAIN.length; modelIdx++) {
    const model = MODEL_CHAIN[modelIdx];

    // Try each model up to 3 times with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callModel(model, prompt, maxTokens, apiKey);
      } catch (e: any) {
        lastError = e;
        const msg = e?.message ?? "";

        // Non-transient error: bail immediately
        if (!isTransientError(msg)) {
          throw e;
        }

        // Transient: back off then retry same model (or switch after 3 fails)
        if (attempt < 2) {
          await sleep(1000 * Math.pow(2, attempt)); // 1s, 2s, 4s
        }
      }
    }
    // Move to next fallback model after 3 failed attempts
  }

  throw lastError ?? new Error("All models exhausted");
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from AI");
    return JSON.parse(match[0]);
  }
}

export type GeneratedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  faqs: { q: string; a: string }[];
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  return `${Math.max(3, Math.ceil(words / 200))} min read`;
}

// ── TOPIC IDEAS: AI generates relevant article titles ──────────────────────
export async function generateTopicIdeas(
  focus: string,
  count: number,
  existingTitles: string[] = []
): Promise<string[]> {
  const existing = existingTitles.length > 0
    ? `\n\n## Already published (DO NOT repeat these or their variations):\n${existingTitles.slice(0, 50).map((t) => `- ${t}`).join("\n")}`
    : "";

  const prompt = `You are a content strategist for MyCareerly.com — a US flower shop directory and florist resource (like Yelp/Google for florists). The blog covers flower care, gifting, weddings, seasonal guides, meanings, DIY, expert tips, and stories.

## Focus
${focus || "Mix of topics covering flower care, seasonal guides, wedding florals, gifting ideas, and flower meanings"}

## Task
Generate exactly ${count} UNIQUE, SEO-friendly article titles that:
- Target real US search intent (people Googling for flower help)
- Are specific (include flower types, occasions, numbers, or seasons where relevant)
- Use proven headline patterns (How to, X Best, Complete Guide, Why, When, etc.)
- Would genuinely help a US reader
- Are varied — don't repeat same topic or structure twice
- Are NEW — avoid duplicating any in the "already published" list
${existing}

## Output
Return ONLY a JSON array of exactly ${count} title strings (no numbering, no commentary, no code fences):

["Title 1", "Title 2", "Title 3", ...]`;

  const raw = await callGemini(prompt, 2048);
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try {
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr)) throw new Error("not array");
    return arr.map((x) => String(x).trim()).filter(Boolean).slice(0, count);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Invalid response from AI");
    return JSON.parse(match[0]).map((x: any) => String(x).trim()).filter(Boolean).slice(0, count);
  }
}

// ── STEP 1: Auto-pick category + author from lists ──────────────────────────
type AuthorInfo = { name: string; specialty: string; bio: string };

export async function autoSelectCategoryAndAuthor(
  title: string,
  categories: string[],
  authors: AuthorInfo[]
): Promise<{ category: string; author: string }> {
  if (categories.length === 0) return { category: "Care Guide", author: authors[0]?.name ?? "MyCareerly Editorial" };
  if (authors.length === 0) authors = [{ name: "MyCareerly Editorial", specialty: "", bio: "" }];

  const prompt = `You are an editor at MyCareerly.com (US flower shop directory).

Article title: "${title}"

## Available Categories
${categories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

## Available Authors
${authors.map((a, i) => `${i + 1}. ${a.name}${a.specialty ? ` — ${a.specialty}` : ""}${a.bio ? ` (${a.bio.slice(0, 120)})` : ""}`).join("\n")}

## Task
Pick the SINGLE BEST category and the SINGLE BEST author for this article. The author should match the article's topic based on their specialty/bio.

Return ONLY this JSON (no code fences, no commentary):
{"category": "exact category name from list", "author": "exact author name from list"}`;

  try {
    const raw = await callGemini(prompt, 256);
    const parsed = parseJson<{ category: string; author: string }>(raw);
    const category = categories.includes(parsed.category) ? parsed.category : categories[0];
    const author = authors.find((a) => a.name === parsed.author)?.name ?? authors[0].name;
    return { category, author };
  } catch {
    return { category: categories[0], author: authors[0].name };
  }
}

// ── STEP 2: Full article generation (SEO/AEO/GEO-optimized, smart image count) ──
const ARTICLE_PROMPT = (title: string, reference: string, category: string) => `You are an expert content writer for MyCareerly.com — a US flower shop directory and florist resource. Write a comprehensive, SEO/AEO/GEO-optimized article.

## Article Specifications
**Title**: ${title}
**Category**: ${category}
**Reference / Topic Hints**: ${reference || "Interpret the title naturally for a US audience"}
**Target length**: MINIMUM 1300 words. No upper limit — go longer if the topic deserves it. For listicles like "Top 10 X", use ~150-200 words per item (so 10 items = 2000+ words). Better too long than too short.

## Image Count Rule (CRITICAL — read carefully)

Determine the NUMBER of inline images based on the article's content structure:

- **Listicle / "Top N" / "X varieties/types"**: Generate EXACTLY N images (one per item). Example: "Top 10 Rose Varieties" → 10 images, one per rose variety, immediately under that flower's H2/H3 heading.
- **Step-by-step how-to / tutorial**: Generate 1 image for EACH major step that's visually demonstrable (skip steps that are purely conceptual). Typically 3-6 images.
- **Guide / comparison / general article**: Generate 3-5 images at natural visual break points.
- **Opinion / conceptual / abstract**: 2-3 hero images.

Infer N from the title. If title says "7 Best", generate 7 item-images + 1 intro/cover image. If "10 Amazing", generate 10 + 1. Always include 1 hero/cover image at the very top (before intro paragraphs).

## Required JSON Output

Return ONLY a JSON object with this structure (no code fences, no commentary):

{
  "title": "The exact or slightly refined title (under 65 chars for SEO)",
  "metaTitle": "SEO meta title, under 60 chars, with primary keyword + brand",
  "metaDescription": "SEO meta description, 140-155 chars, with primary keyword and compelling hook",
  "keywords": "comma, separated, keywords, 6-10 items",
  "excerpt": "Compelling 2-sentence summary, 150-180 chars, hooks reader and previews takeaway",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "faqs": [
    {"q": "Natural question a reader would ask", "a": "Direct 1-3 sentence answer (for FAQ schema)"},
    {"q": "Second question", "a": "Answer"},
    {"q": "Third question", "a": "Answer"},
    {"q": "Fourth question", "a": "Answer"}
  ],
  "content": "Full article in markdown with inline image placeholders — see rules below"
}

## Content Rules

**Opening**: Place the cover/hero image as the VERY FIRST line (before intro): \`![Detailed scene description for cover](PLACEHOLDER_1)\`. Then 2 flowing paragraphs that hook the reader. NO heading for the intro. Include primary keyword naturally in first paragraph.

**Section structure**: Each main item/step/section gets a ## H2 heading. For listicles, use "## 1. Flower Name" or "## Rose Variety Name" style. For how-tos, "## Step N — Action". Use natural phrasing, never "Section 1".

**Inline images — CRITICAL FORMAT (you MUST follow this exactly)**:

Each image MUST use this EXACT markdown pattern with a unique sequential token. Do NOT use placeholder.jpg or any real URL.

Format: \`![rich photography-style alt text](GEN_IMG_1)\`

Sequential tokens: \`GEN_IMG_1\`, \`GEN_IMG_2\`, \`GEN_IMG_3\`, ... (NEVER reuse a number, NEVER skip, NEVER use anything else as the URL).

- The alt text MUST be a rich, detailed, photography-style description that will be used as an image-generation prompt. Include: specific subject (flower/scene), colors, setting (vase/garden/studio/outdoor/indoor), lighting (golden hour, soft window light, cinematic, studio), mood, and style keywords (close-up, flat lay, editorial).
- Example GOOD: \`![Close-up of fully-bloomed coral Charm peony with soft morning light, pastel background, shallow depth of field, editorial photography](GEN_IMG_1)\`
- Example BAD: \`![flower](placeholder.jpg)\` — will be rejected
- Example BAD: \`![rose](/images/articles/rose.jpg)\` — will be rejected

Place each item-image DIRECTLY under its corresponding item H2 (for listicles) or step H2 (for how-tos). For general articles, place at natural visual break points. Always put the first image (cover) as the very first line of content before the intro paragraphs.

**Bold key phrases**: Use **bold** for 2-4 critical concepts per section.

**Bullet lists**: Use - for lists when listing items, tips, or signs.

**AEO ready**: Answer common reader questions directly in H2s. Use "How", "Why", "What", "When" phrasings.

**GEO ready**: Reference specific US cities, USDA zones, regional conventions. Use °F for temperatures.

**Expert depth**: Specific numbers (temperatures, timings, measurements). Insider tips.

**Voice (CRITICAL — must read human, not AI-generated)**:
- Write like a real florist telling their friend over coffee, not a generic blog
- Vary sentence length heavily — mix punchy 4-word lines with flowing 30-word ones
- Use contractions naturally (don't, won't, they're, that's)
- Include personal asides: "honestly", "here's the trick", "in my experience", "most people skip this"
- Use specific details that only someone who knows the industry would mention
- Avoid AI tells: no "delve into", "tapestry", "navigate the world of", "embark on", "unlock the secrets"
- Avoid filler phrases ("in this article we will discuss", "it is important to note", "one must consider")
- Occasional sentence fragments for emphasis. Like this.
- Use everyday language, not corporate speak
- If writing in 2nd person, speak TO the reader directly ("you'll notice", "your roses", "imagine")

**Ending**: Short "The Bottom Line" wrap-up paragraph (2-3 sentences). No "Conclusion" heading.

## Output
Return ONLY the JSON. Start directly with { and end with }. No code fences. No extra text.`;

export async function generateArticle(
  title: string,
  reference: string,
  category: string
): Promise<GeneratedArticle> {
  const raw = await callGemini(ARTICLE_PROMPT(title, reference, category), 16384);
  const parsed = parseJson<any>(raw);

  if (!parsed.title || !parsed.content) {
    throw new Error("Generated article missing required fields");
  }

  return {
    title: parsed.title,
    slug: toSlug(parsed.title),
    excerpt: parsed.excerpt || "",
    content: parsed.content,
    category,
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
    readTime: estimateReadTime(parsed.content),
    metaTitle: (parsed.metaTitle || parsed.title).slice(0, 65),
    metaDescription: (parsed.metaDescription || parsed.excerpt || "").slice(0, 158),
    keywords: parsed.keywords || "",
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs.filter((f: any) => f.q && f.a).slice(0, 6) : [],
  };
}

// ── STEP 3: Generate inline images via Nano Banana Pro ─────────────────────
// Parses markdown for image placeholders, generates each via
// Gemini 3 Pro Image (Nano Banana Pro), saves to disk, returns updated content.

// Fallback chain — stable models first, then preview (preview often gated to specific accounts)
const IMAGE_MODEL_CHAIN = [
  "gemini-2.5-flash-image",           // Nano Banana — widely available, stable primary
  "gemini-2.5-flash-image-preview",   // Preview flavor if ever present
  "gemini-3-pro-image-preview",       // Nano Banana Pro (may be gated per-account)
  "imagen-4.0-generate-001",          // Imagen (last resort, separate quota)
];

async function callImageModel(model: string, prompt: string, apiKey: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const isImagen = model.startsWith("imagen");
    const path = `/v1beta/models/${model}:${isImagen ? "predict" : "generateContent"}?key=${apiKey}`;
    const body = JSON.stringify(
      isImagen
        ? { instances: [{ prompt }], parameters: { sampleCount: 1 } }
        : {
            // Gemini 2.5+/3.x image models require explicit IMAGE response modality
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] },
          }
    );
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            // Imagen format
            const imagenB64 = json.predictions?.[0]?.bytesBase64Encoded;
            if (imagenB64) return resolve(Buffer.from(imagenB64, "base64"));
            // Gemini image format (inlineData in parts)
            const parts = json.candidates?.[0]?.content?.parts ?? [];
            for (const p of parts) {
              const b64 = p.inlineData?.data ?? p.inline_data?.data;
              if (b64) return resolve(Buffer.from(b64, "base64"));
            }
            // Log failure reason so we can debug in Cloud Run logs
            if (json.error) {
              console.warn(`[generateImage] ${model} error:`, json.error.message || JSON.stringify(json.error).slice(0, 200));
            } else if (json.promptFeedback?.blockReason) {
              console.warn(`[generateImage] ${model} blocked:`, json.promptFeedback.blockReason);
            } else {
              console.warn(`[generateImage] ${model} returned no image. Response:`, JSON.stringify(json).slice(0, 300));
            }
            resolve(null);
          } catch (e: any) {
            console.warn(`[generateImage] ${model} parse error:`, e?.message);
            resolve(null);
          }
        });
      }
    );
    req.on("error", (e) => {
      console.warn(`[generateImage] ${model} network error:`, e.message);
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

async function generateImageBytes(prompt: string): Promise<Buffer | null> {
  const apiKey = await getGeminiApiKey();
  for (const model of IMAGE_MODEL_CHAIN) {
    const bytes = await callImageModel(model, prompt, apiKey);
    if (bytes) return bytes;
  }
  return null;
}

export type ImageGenerationResult = {
  updatedContent: string;
  coverImage: string;
  totalRequested: number;
  totalGenerated: number;
};

/**
 * Parses article markdown for ANY image references that need generation.
 * Catches: GEN_IMG_N (preferred), PLACEHOLDER_N (legacy), placeholder.jpg (AI stub).
 * Generates each via Imagen, saves to /public/images/articles/{slug}-{n}.jpg,
 * replaces placeholder URLs with real paths. Returns updated content + cover.
 */
export async function generateArticleImages(
  slug: string,
  content: string
): Promise<ImageGenerationResult> {
  // Match any image reference whose URL looks like a placeholder (not a real served URL)
  //   ![alt](GEN_IMG_1)           ← preferred
  //   ![alt](PLACEHOLDER_1)       ← legacy
  //   ![alt](placeholder.jpg)     ← AI stub
  //   ![alt](/images/articles/placeholder.jpg) ← AI stub with path
  const regex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const allMatches = Array.from(content.matchAll(regex));

  const isPlaceholder = (url: string) =>
    /^GEN_IMG_\d+$/i.test(url) ||
    /^PLACEHOLDER_\d+$/i.test(url) ||
    /placeholder\.(jpg|jpeg|png|webp)$/i.test(url) ||
    url.includes("/placeholder");

  const matches = allMatches.filter((m) => isPlaceholder(m[2].trim()));

  if (matches.length === 0) {
    return { updatedContent: content, coverImage: "", totalRequested: 0, totalGenerated: 0 };
  }

  const outputDir = path.join(process.cwd(), "public", "images", "articles");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Enhance each prompt for photographic quality
  const imagePrompts = matches.map((m) => {
    const alt = m[1].trim();
    return `${alt}. Professional photography, high quality, natural lighting, editorial style, clean composition, vibrant yet natural colors, shallow depth of field, bright and crisp.`;
  });

  // Generate all images in parallel
  const results = await Promise.all(
    imagePrompts.map(async (prompt, i) => {
      const bytes = await generateImageBytes(prompt);
      if (!bytes) return null;
      const filename = `${slug}-${i + 1}.jpg`;
      const filepath = path.join(outputDir, filename);
      try {
        fs.writeFileSync(filepath, bytes);
        return `/images/articles/${filename}`;
      } catch {
        return null;
      }
    })
  );

  // Replace each placeholder with the real URL (or fallback)
  const FALLBACKS = [
    "/images/articles/cover-2-spring-flowers.jpg",
    "/images/articles/cover-5-gifting-bouquet.jpg",
    "/images/articles/cover-7-popular-flowers.jpg",
  ];

  let updated = content;
  matches.forEach((m, idx) => {
    const alt = m[1];
    const originalUrl = m[2];
    const realUrl = results[idx] ?? FALLBACKS[idx % FALLBACKS.length];
    const escapedAlt = alt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    updated = updated.replace(
      new RegExp(`!\\[${escapedAlt}\\]\\(${escapedUrl}\\)`),
      `![${alt}](${realUrl})`
    );
  });

  const coverImage =
    results.find((r) => r !== null) ??
    FALLBACKS[0];
  const totalGenerated = results.filter((r) => r !== null).length;

  return {
    updatedContent: updated,
    coverImage,
    totalRequested: matches.length,
    totalGenerated,
  };
}
