import type { MetadataRoute } from "next";
import { prisma } from "./lib/prisma";
import { LETTERS } from "./data/flowers-by-letter";
import { US_STATES } from "./data/us-states";

const SITE_URL = "https://mycareerly.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: SITE_URL,                      lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/articles`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/listings`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/cities`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/about`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`,             lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/contact`,         lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/listings/create`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/articles/write`,  lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/tools`,                 lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tools/gift-finder`,     lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/tools/birth-flower`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tools/vase-life`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tools/wedding-budget`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tools/flower-meaning`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Articles
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Article categories
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/articles/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // Authors
  const authors = await prisma.author.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const authorUrls: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${SITE_URL}/authors/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Listings (florist shops) — use slug for SEO-friendly URLs
  const listings = await prisma.listing.findMany({
    where: { status: "approved" },
    select: { slug: true, updatedAt: true },
  });
  const listingUrls: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/listings/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // City pages — derive from distinct citySlug values
  const cityRows = await prisma.listing.findMany({
    where: { status: "approved", citySlug: { not: "" } },
    select: { citySlug: true },
    distinct: ["citySlug"],
  });
  const cityUrls: MetadataRoute.Sitemap = cityRows.map((c) => ({
    url: `${SITE_URL}/cities/${c.citySlug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // A-Z letter pages for flower directory
  const letterUrls: MetadataRoute.Sitemap = LETTERS.map((letter) => ({
    url: `${SITE_URL}/flowers/${letter}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // State pages — all 50 states + DC
  const stateUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/florists`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...US_STATES.map((s) => ({
      url: `${SITE_URL}/florists/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];

  return [...statics, ...articleUrls, ...categoryUrls, ...authorUrls, ...listingUrls, ...cityUrls, ...letterUrls, ...stateUrls];
}
