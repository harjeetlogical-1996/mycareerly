import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { FLOWERS_BY_LETTER } from "../../data/flowers-by-letter";
import { US_STATES } from "../../data/us-states";

export const dynamic = "force-dynamic";

type SearchHit = {
  type: "article" | "listing" | "flower" | "city" | "state";
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  meta?: string;
};

const LIMIT_PER_TYPE = 5;
const MAX_LIMIT_PER_TYPE = 20;

// Simple scoring — exact match > starts-with > contains
function score(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 50;
  if (t.includes(` ${q}`)) return 25;
  if (t.includes(q)) return 10;
  return 0;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") ?? "all";
  const limit = Math.min(MAX_LIMIT_PER_TYPE, parseInt(url.searchParams.get("limit") ?? String(LIMIT_PER_TYPE), 10));

  if (!q || q.length < 2) {
    return NextResponse.json({ query: q, articles: [], listings: [], flowers: [], cities: [], states: [], total: 0 });
  }

  // ── Articles ──────────────────────────────────────────────────────────────
  const articlesP: Promise<SearchHit[]> = (type === "all" || type === "articles")
    ? prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { keywords: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { slug: true, title: true, excerpt: true, coverImage: true, category: true, readTime: true },
      }).then((rows) => rows.map((a) => ({
        type: "article" as const,
        title: a.title,
        excerpt: a.excerpt,
        url: `/${a.slug}`,
        image: a.coverImage,
        meta: `${a.category} · ${a.readTime}`,
      })))
    : Promise.resolve([]);

  // ── Listings ──────────────────────────────────────────────────────────────
  const listingsP: Promise<SearchHit[]> = (type === "all" || type === "listings")
    ? prisma.listing.findMany({
        where: {
          status: "approved",
          OR: [
            { name: { contains: q } },
            { city: { contains: q } },
            { tagline: { contains: q } },
            { description: { contains: q } },
            { categories: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        orderBy: [{ sponsored: "desc" }, { featured: "desc" }, { rating: "desc" }],
        take: limit,
        select: { slug: true, name: true, tagline: true, city: true, state: true, images: true, rating: true, reviewCount: true },
      }).then((rows) => rows.map((l) => ({
        type: "listing" as const,
        title: l.name,
        excerpt: l.tagline,
        url: `/listings/${l.slug}`,
        image: (JSON.parse(l.images) as string[])[0],
        meta: `${l.city}, ${l.state} · ${l.rating}★ (${l.reviewCount})`,
      })))
    : Promise.resolve([]);

  // ── Cities ────────────────────────────────────────────────────────────────
  const citiesP: Promise<SearchHit[]> = (type === "all" || type === "cities")
    ? prisma.city.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: q } },
            { stateFull: { contains: q } },
            { shortDesc: { contains: q } },
          ],
        },
        take: limit,
        select: { slug: true, name: true, state: true, stateFull: true, shortDesc: true, coverImage: true },
      }).then((rows) => rows.map((c) => ({
        type: "city" as const,
        title: `Flower Shops in ${c.name}`,
        excerpt: c.shortDesc,
        url: `/cities/${c.slug}`,
        image: c.coverImage,
        meta: `${c.name}, ${c.stateFull}`,
      })))
    : Promise.resolve([]);

  // ── Flowers A-Z (in-memory from static data) ──────────────────────────────
  const flowers: SearchHit[] = (type === "all" || type === "flowers")
    ? (() => {
        const matches: { hit: SearchHit; score: number }[] = [];
        for (const letter of Object.keys(FLOWERS_BY_LETTER)) {
          for (const f of FLOWERS_BY_LETTER[letter]) {
            const nameScore = score(f.name, q);
            const descScore = f.desc ? (score(f.desc, q) / 2) : 0;
            const s = nameScore + descScore;
            if (s > 0) {
              matches.push({
                hit: {
                  type: "flower" as const,
                  title: f.name,
                  excerpt: f.desc,
                  url: `/flowers/${letter}#${f.name.toLowerCase().replace(/\s+/g, "-")}`,
                  meta: `Flowers starting with ${letter.toUpperCase()}`,
                },
                score: s,
              });
            }
          }
        }
        return matches.sort((a, b) => b.score - a.score).slice(0, limit).map((m) => m.hit);
      })()
    : [];

  // ── States ────────────────────────────────────────────────────────────────
  const states: SearchHit[] = (type === "all" || type === "states")
    ? US_STATES
        .map((s) => ({ s, score: score(s.name, q) || score(s.nickname, q) / 2 || score(s.stateFlower, q) / 3 }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => ({
          type: "state" as const,
          title: `Flower Shops in ${x.s.name}`,
          excerpt: `${x.s.nickname} · State flower: ${x.s.stateFlower}`,
          url: `/florists/${x.s.slug}`,
          meta: x.s.code,
        }))
    : [];

  const [articles, listings, cities] = await Promise.all([articlesP, listingsP, citiesP]);

  const total = articles.length + listings.length + flowers.length + cities.length + states.length;

  return NextResponse.json(
    { query: q, articles, listings, flowers, cities, states, total },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=120" } }
  );
}
