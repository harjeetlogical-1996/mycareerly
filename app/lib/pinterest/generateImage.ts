import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "../prisma";
import { getGeminiApiKey } from "../gemini";
import { gcsEnabled, uploadBuffer } from "../storage/gcs";

const IMAGE_MODEL = "gemini-2.5-flash-image";
const TEXT_MODEL = "gemini-2.5-flash";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

// Gemini API key now resolved via the shared helper in app/lib/gemini.ts —
// so updating the key in /admin/pinterest/settings or the GEMINI_API_KEY env
// immediately applies to both blog generation and Pinterest image generation.
const getApiKey = getGeminiApiKey;

const HOOK_ANGLES = [
  { name: "Curiosity question", example: "Why Every Florist Swears By This?" },
  { name: "Listicle / number", example: "7 Roses That Last Twice As Long" },
  { name: "Power-words + urgency", example: "The Only Rose Guide You'll Ever Need" },
  { name: "How-to promise", example: "Make Roses Last 2 Weeks — Guaranteed" },
  { name: "Surprising claim / shock", example: "This Flower Blooms for Only 24 Hours" },
  { name: "Personal / emotional", example: "I Tried This Hack — My Bouquet Lasted 3 Weeks" },
];

/**
 * Generate multiple clickable Pinterest hooks in a single call (cheaper + faster than N separate calls).
 * Returns an array of distinct headlines, each from a different angle.
 */
export async function generatePinterestHooks(
  article: { title: string; category: string; excerpt: string; tags: string[] },
  count: number = 6
): Promise<string[]> {
  const apiKey = await getApiKey();
  const n = Math.min(Math.max(count, 3), 8);
  const angles = HOOK_ANGLES.slice(0, n);

  const prompt = `You are a top Pinterest copywriter for a US flower-shop directory.
Write ${n} DIFFERENT clickable Pinterest pin headlines (text overlays) for this article.

Article title: ${article.title}
Category: ${article.category}
Excerpt: ${article.excerpt.slice(0, 400)}
Tags: ${article.tags.slice(0, 8).join(", ")}

Each headline should use a different angle:
${angles.map((a, i) => `${i + 1}. ${a.name} — e.g., "${a.example}"`).join("\n")}

Rules for every headline:
- 4 to 9 words (max ~60 characters)
- Pinterest-style: curiosity-driven, actionable, uses power words
- Title Case or Sentence case — NOT all caps, NOT all lowercase
- Can include ONE relevant emoji at start or end (optional, keep natural — not every headline needs one)
- No quotes in the output, no hashtags, no "click here", no URLs
- Specific to THIS article's topic — not generic flower advice
- Each headline must be distinct from the others in phrasing and angle

Output ONLY a JSON array of ${n} strings, nothing else. No markdown fences, no explanation.
Example format: ["First headline here", "Second headline here", "Third headline here"]`;

  const res = await fetch(ENDPOINT(TEXT_MODEL) + `?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" },
          minItems: n,
          maxItems: n,
        },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini hooks error ${res.status}: ${text.slice(0, 300)}`);
  }
  const json: any = await res.json();
  const finishReason: string = json?.candidates?.[0]?.finishReason ?? "";
  const raw: string = json?.candidates?.[0]?.content?.parts?.find((p: any) => typeof p?.text === "string")?.text ?? "";
  if (!raw) {
    const why = finishReason ? ` (finishReason: ${finishReason})` : "";
    throw new Error(`Gemini returned empty hooks${why}`);
  }

  const hooks = parseHooksFromGemini(raw, n);
  if (process.env.NODE_ENV !== "production") {
    console.log("[pinterest hooks] raw:", raw.slice(0, 500));
    console.log("[pinterest hooks] parsed:", hooks);
    if (finishReason) console.log("[pinterest hooks] finishReason:", finishReason);
  }
  if (hooks.length === 0) {
    throw new Error(`No valid hooks parsed. Raw response: ${raw.slice(0, 400)}`);
  }
  return hooks;
}

/**
 * Robust parser for Gemini hook output.
 * Handles: clean JSON array, JSON wrapped in fences, JSON object with any key, newline-delimited text,
 * truncated JSON (maxTokens), and numbered list formats.
 */
function parseHooksFromGemini(raw: string, expected: number): string[] {
  const cleaned = raw
    .trim()
    // Strip fence blocks
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Try strict JSON first
  const tryJson = (s: string): string[] | null => {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String);
      // Object form: { "hooks": [...] } or any first array value
      if (parsed && typeof parsed === "object") {
        for (const v of Object.values(parsed)) {
          if (Array.isArray(v)) return (v as unknown[]).map(String);
        }
      }
    } catch {}
    return null;
  };

  let arr = tryJson(cleaned);

  // If strict parse failed, try to repair truncated JSON: extract quoted strings from within [ ... ]
  if (!arr) {
    const bracketMatch = cleaned.match(/\[([\s\S]*)$/);
    const body = bracketMatch ? bracketMatch[1] : cleaned;
    // Grab every "..." string literal (handle escaped quotes)
    const stringMatches = body.match(/"((?:[^"\\]|\\.)*)"/g);
    if (stringMatches && stringMatches.length > 0) {
      arr = stringMatches.map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return s.replace(/^"|"$/g, "");
        }
      });
    }
  }

  // Last-resort: split by newlines, strip list markers
  if (!arr || arr.length === 0) {
    arr = cleaned
      .split(/\n+/)
      .map((s) => s.replace(/^[\s\-\d\.\)\(\*"']+|["',]+$/g, "").trim())
      .filter((s) => s.length > 3);
  }

  return (arr || [])
    .map((s) => String(s).trim().replace(/^["']|["']$/g, "").replace(/\s+/g, " "))
    .filter((s) => s.length >= 4 && s.length <= 120)
    .slice(0, expected);
}

/**
 * Legacy single-hook generator. Kept for backward compat — uses multi-hook under the hood.
 */
export async function generatePinterestHook(article: { title: string; category: string; excerpt: string; tags: string[] }, variantIndex: number = 0): Promise<string> {
  const hooks = await generatePinterestHooks(article, 6);
  return hooks[variantIndex % hooks.length];
}

function buildImagePrompt(opts: { article: { title: string; category: string }; variantIndex: number; overlayHook?: string }) {
  const styles = [
    "bright natural light, soft pastel background, magazine editorial",
    "overhead flat-lay on linen, warm golden hour light, minimal props",
    "close-up macro of petals, dewdrops, shallow depth of field",
    "lifestyle scene with hands arranging, cozy home interior, soft focus background",
    "monochrome pastel backdrop, single hero bouquet centered, studio lighting",
  ];
  const style = styles[opts.variantIndex % styles.length];

  if (opts.overlayHook) {
    return `Design a viral-worthy, scroll-stopping Pinterest pin graphic (vertical 2:3 aspect ratio, 1000x1500 px).
Subject: ${opts.article.title}
Theme: ${opts.article.category} — flowers, florist, floral design
Background style: ${style}; clean, airy, Pinterest-aesthetic composition with beautiful floral photography

*** CRITICAL — render this EXACT headline text as a bold, beautiful, attention-grabbing text overlay ***

Headline text (spell EXACTLY as given, do not paraphrase or modify any word or punctuation):
${opts.overlayHook}

Typography & overlay design requirements (this is MOST important — follow every point):
1. Headline placement: Center-weighted, positioned in the top half or slightly above-center of the image where it reads first
2. Typography: Use a modern, high-contrast Pinterest-style font combination — a bold heavy display serif (like Playfair Display Black, Abril Fatface) or a confident chunky sans-serif (like Poppins Black, Montserrat ExtraBold), large enough that it dominates the composition
3. Layout: Break the headline across 2-4 lines for visual rhythm. Emphasize power words by making them LARGER or using a contrasting color/accent
4. Readability layer: Add a tasteful backdrop behind the text so it is instantly readable — options: a soft semi-transparent colored block, a smooth gradient band, a rough painterly brush stroke rectangle, or a delicate frame/divider. Pick whichever fits the aesthetic
5. Color palette: Use warm editorial flower-niche palette — dusty rose, terracotta, deep burgundy, sage green, cream white, soft blush. Text should be crisp white, deep navy, or dark rosewood for maximum contrast against the backdrop
6. Decorative accents (subtle): tiny floral illustrations, a thin underline flourish, small decorative dots, or a hand-drawn arrow can accent ONE power word — but keep it minimal and classy, not cluttered
7. Small label (optional, bottom or top corner): a tiny "FLOWER CARE" / "GUIDE" / "TIPS" tag in small caps can be added if natural for the article category

*** ABSOLUTE RULES ***
- Spell every word of the headline EXACTLY. No missing letters, no extra letters, no auto-correct changes. No lorem-ipsum. No gibberish.
- NO other text anywhere in the image: no website URL, no logo, no watermark, no author name, no stray decorative letters
- NO hashtags, no "click here", no "read more"
- The image must feel premium and on-brand for an upscale US flower-shop directory, not AI-generated stock

Output only the completed pin image. Photorealistic background photography combined with beautifully-typeset overlay text.`;
  }

  return `Create a vertical 2:3 aspect-ratio Pinterest pin image (1000x1500 px).
Subject: ${opts.article.title}
Theme: ${opts.article.category} — flowers, florist, floral design
Style: ${style}; clean, airy, beautiful composition
Leave clean negative space in the top third suitable for a bold headline overlay.
Do NOT render any text, letters, logos, or watermarks in the image itself.
Photorealistic, high-detail, Pinterest-optimized for flower niche audience.`;
}

/**
 * Generates one Pinterest-optimized image via Nano Banana (Gemini 2.5 Flash Image).
 *
 * When `withOverlay` is true, first calls Gemini to generate a clickable Pinterest hook
 * headline based on the article, then asks Nano Banana to render that exact text as an overlay.
 *
 * Saves to /public/pinterest/{articleId}/{hash}.png and inserts a PinterestImage row.
 */
export async function generatePinterestImage(
  articleId: string,
  variantIndex: number = 0,
  options: { withOverlay?: boolean; customHook?: string } = {}
): Promise<{ id: string; url: string; prompt: string; overlayHook: string | null }> {
  const apiKey = await getApiKey();
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error(`Article ${articleId} not found`);

  const tags = (() => { try { return JSON.parse(article.tags) as string[]; } catch { return []; } })();

  let overlayHook: string | null = null;
  if (options.withOverlay) {
    overlayHook = options.customHook?.trim() || await generatePinterestHook(
      { title: article.title, category: article.category, excerpt: article.excerpt, tags },
      variantIndex
    );
  }

  const imagePrompt = buildImagePrompt({
    article: { title: article.title, category: article.category },
    variantIndex,
    overlayHook: overlayHook ?? undefined,
  });

  const res = await fetch(ENDPOINT(IMAGE_MODEL) + `?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nano Banana error ${res.status}: ${text.slice(0, 500)}`);
  }

  const json: any = await res.json();
  const parts: any[] =
    json?.candidates?.[0]?.content?.parts ??
    json?.candidates?.[0]?.content ??
    [];
  const imgPart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
  const b64 = imgPart?.inlineData?.data || imgPart?.inline_data?.data;
  if (!b64) throw new Error("Nano Banana returned no image data");
  const mime: string = imgPart?.inlineData?.mimeType || imgPart?.inline_data?.mime_type || "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";

  const buffer = Buffer.from(b64, "base64");
  const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 10);
  const suffix = overlayHook ? "txt" : "clean";
  const filename = `${slugify(article.title)}-${suffix}-${hash}.${ext}`;
  const objectPath = `pinterest/${articleId}/${filename}`;

  let publicUrl: string;
  if (gcsEnabled()) {
    publicUrl = await uploadBuffer(objectPath, buffer, { contentType: mime });
  } else {
    const folder = path.join(process.cwd(), "public", "pinterest", articleId);
    await fs.mkdir(folder, { recursive: true });
    const absPath = path.join(folder, filename);
    await fs.writeFile(absPath, buffer);
    publicUrl = `/${objectPath}`;
  }
  const promptSummary = overlayHook
    ? `overlay:"${overlayHook}" | ${imagePrompt.slice(0, 400)}`
    : imagePrompt;
  const row = await prisma.pinterestImage.create({
    data: {
      articleId,
      url: publicUrl,
      source: overlayHook ? "ai-overlay" : "ai",
      prompt: promptSummary,
      width: 1000,
      height: 1500,
    },
  });

  return { id: row.id, url: row.url, prompt: promptSummary, overlayHook };
}
