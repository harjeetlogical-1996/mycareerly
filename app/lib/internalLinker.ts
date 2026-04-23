import { prisma } from "./prisma";

type ArticleLite = {
  id: string;
  slug: string;
  title: string;
  tags: string;     // JSON string
  category: string;
};

/**
 * Score how related article B is to article A.
 * Higher = more similar (same tags > same category > shared title words).
 */
function scoreRelation(a: ArticleLite, b: ArticleLite): number {
  if (a.id === b.id) return -1;
  const aTags = new Set((safeJson(a.tags) as string[]).map((t) => t.toLowerCase()));
  const bTags = new Set((safeJson(b.tags) as string[]).map((t) => t.toLowerCase()));
  let score = 0;
  for (const t of aTags) if (bTags.has(t)) score += 3;
  if (a.category === b.category) score += 2;
  const aWords = new Set(a.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const bWords = new Set(b.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  for (const w of aWords) if (bWords.has(w)) score += 1;
  return score;
}

function safeJson(raw: string): any {
  try { return JSON.parse(raw); } catch { return []; }
}

/**
 * Return candidate anchor phrases for linking TO an article — in priority order.
 * Good anchors are: specific tags, meaningful title fragments.
 */
function getAnchorPhrases(article: ArticleLite): string[] {
  const tags = (safeJson(article.tags) as string[]).filter((t) => typeof t === "string" && t.length > 2);
  const titleWords = article.title.replace(/[:\-–—]/g, "").split(/\s+/);

  // 2-3 word phrases from title (no stopwords)
  const STOPWORDS = new Set([
    "the","and","your","with","that","from","this","what","when","how","why",
    "for","you","are","can","have","will","our","best","top","great","amazing",
    "a","to","of","in","on","is","an","it","or","as","by","at","be","we","i",
  ]);
  const contentWords = titleWords.filter((w) => {
    const lw = w.toLowerCase().replace(/[^a-z]/g, "");
    return lw.length > 3 && !STOPWORDS.has(lw);
  });

  const twoGrams: string[] = [];
  for (let i = 0; i < contentWords.length - 1; i++) {
    twoGrams.push(`${contentWords[i]} ${contentWords[i + 1]}`);
  }
  const threeGrams: string[] = [];
  for (let i = 0; i < contentWords.length - 2; i++) {
    threeGrams.push(`${contentWords[i]} ${contentWords[i + 1]} ${contentWords[i + 2]}`);
  }

  // Single strong words (e.g. "roses", "wedding", "peonies")
  const singles = contentWords.filter((w) => w.length > 4);

  // Priority: tags > 2-grams > 3-grams > singles
  const out: string[] = [];
  for (const t of tags) out.push(t);
  for (const g of twoGrams) out.push(g);
  for (const g of threeGrams) out.push(g);
  for (const s of singles) out.push(s);

  // Dedupe, keep order
  const seen = new Set<string>();
  return out.filter((p) => {
    const k = p.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Pick the top N most related articles to the given article.
 */
function pickRelated(article: ArticleLite, all: ArticleLite[], count: number): ArticleLite[] {
  return all
    .filter((a) => a.id !== article.id)
    .map((a) => ({ a, score: scoreRelation(article, a) }))
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map((s) => s.a);
}

/**
 * Try to find a case-insensitive occurrence of `phrase` in `paragraph`
 * that is NOT inside an existing markdown link or markdown image.
 * Returns [startIdx, endIdx] or null.
 */
function findUnlinkedOccurrence(paragraph: string, phrase: string): [number, number] | null {
  const lower = paragraph.toLowerCase();
  const plow = phrase.toLowerCase();
  let searchFrom = 0;

  while (true) {
    const idx = lower.indexOf(plow, searchFrom);
    if (idx === -1) return null;
    const end = idx + phrase.length;

    // Must be word-boundary
    const before = idx === 0 ? " " : paragraph[idx - 1];
    const after = end >= paragraph.length ? " " : paragraph[end];
    const isBoundary = /[^a-zA-Z0-9]/.test(before) && /[^a-zA-Z0-9]/.test(after);

    if (isBoundary) {
      // Check it's not inside an existing markdown link [...](...)
      // or image ![...](...)
      const beforeText = paragraph.slice(0, idx);
      const openBrackets = (beforeText.match(/\[/g) ?? []).length;
      const closeBrackets = (beforeText.match(/\]/g) ?? []).length;
      const insideBracket = openBrackets > closeBrackets;
      if (!insideBracket) {
        // Also check we're not inside ](...) — a URL target
        const lastCloseBracket = beforeText.lastIndexOf("]");
        const lastOpenParen = beforeText.lastIndexOf("(");
        const lastCloseParen = beforeText.lastIndexOf(")");
        const insideUrl = lastCloseBracket > -1 &&
          lastOpenParen > lastCloseBracket &&
          lastCloseParen < lastOpenParen;
        if (!insideUrl) {
          return [idx, end];
        }
      }
    }
    searchFrom = idx + 1;
  }
}

/**
 * Insert up to `maxLinks` internal links into the article content.
 * Inserts links on phrases from related articles, skipping intro/headings/images.
 * Returns updated content.
 */
export async function addInternalLinks(
  opts: {
    articleId?: string;      // for existing articles (skip self-match)
    title: string;
    tags: string;            // JSON string
    category: string;
    content: string;
    maxLinks?: number;
  }
): Promise<{ content: string; inserted: number; linkedTo: string[] }> {
  const maxLinks = opts.maxLinks ?? 2;

  const candidates = await prisma.article.findMany({
    where: {
      status: "published",
      ...(opts.articleId ? { id: { not: opts.articleId } } : {}),
    },
    select: { id: true, slug: true, title: true, tags: true, category: true },
    take: 300,
  });

  if (candidates.length === 0) {
    return { content: opts.content, inserted: 0, linkedTo: [] };
  }

  const self: ArticleLite = {
    id: opts.articleId ?? "",
    slug: "",
    title: opts.title,
    tags: opts.tags,
    category: opts.category,
  };

  // Pick 6 candidates, try to insert up to maxLinks
  const related = pickRelated(self, candidates, 8);
  if (related.length === 0) {
    return { content: opts.content, inserted: 0, linkedTo: [] };
  }

  const lines = opts.content.split("\n");
  let inserted = 0;
  const linkedTo: string[] = [];
  const alreadyLinkedSlugs = new Set<string>();

  // Detect "intro" range — skip first 2 real paragraph lines and any image/heading
  let realParaCount = 0;
  const INTRO_SKIP = 2;

  for (const candidate of related) {
    if (inserted >= maxLinks) break;
    if (alreadyLinkedSlugs.has(candidate.slug)) continue;

    const phrases = getAnchorPhrases(candidate);

    let placed = false;
    for (const phrase of phrases) {
      if (placed || inserted >= maxLinks) break;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty, headings, lists, images, blockquotes, code
        if (!trimmed) continue;
        if (/^#{1,6}\s/.test(trimmed)) continue;
        if (/^[-*]\s/.test(trimmed)) continue;
        if (/^\d+\.\s/.test(trimmed)) continue;
        if (/^!\[/.test(trimmed)) continue;
        if (/^>\s/.test(trimmed)) continue;
        if (/^```/.test(trimmed)) continue;

        realParaCount++;
        if (realParaCount <= INTRO_SKIP) continue;

        // Don't put two links in the same paragraph
        const existingLinkCount = (line.match(/\]\(/g) ?? []).length;
        if (existingLinkCount >= 2) continue;

        const match = findUnlinkedOccurrence(line, phrase);
        if (!match) continue;

        const [start, end] = match;
        const actual = line.slice(start, end);
        const newLine =
          line.slice(0, start) +
          `[${actual}](/${candidate.slug})` +
          line.slice(end);

        lines[i] = newLine;
        inserted++;
        linkedTo.push(candidate.slug);
        alreadyLinkedSlugs.add(candidate.slug);
        placed = true;
        break;
      }
      // reset counter for next phrase scan (same candidate)
      if (!placed) realParaCount = 0;
    }
    // reset for next candidate
    realParaCount = 0;
  }

  return { content: lines.join("\n"), inserted, linkedTo };
}
