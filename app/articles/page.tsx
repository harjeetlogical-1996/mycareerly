import type { Metadata } from "next";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { ARTICLE_CATEGORIES } from "../data/articles";
import ArticlesClient from "./ArticlesClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Flower Guides & Expert Articles",
  description: "Browse 26+ expert articles on flower care, meanings, gifting, weddings, and seasonal picks. Written by professional florists and horticulturists.",
  keywords: "flower guides, flower care tips, flower meanings, wedding flowers, gifting flowers, seasonal flowers, flower articles",
  openGraph: {
    title: "Flower Guides & Expert Articles | MyCareerly",
    description: "26+ expert flower articles on care, gifting, weddings, meanings, and seasonal picks — written by professional florists.",
    url: `${SITE_URL}/articles`,
    type: "website",
    images: [{ url: "/images/articles/cover-2-spring-flowers.jpg", width: 1200, height: 630, alt: "Expert Flower Guides" }],
  },
  twitter: { card: "summary_large_image", title: "Expert Flower Guides | MyCareerly", description: "26+ expert articles on flower care, meanings, gifting, and more." },
  alternates: { canonical: `${SITE_URL}/articles` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Flower Guides & Expert Articles",
  description: "Expert articles on flower care, gifting, weddings, meanings, and seasonal picks.",
  url: `${SITE_URL}/articles`,
  publisher: { "@type": "Organization", name: "MyCareerly", url: SITE_URL },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/articles` },
    ],
  },
};

export default async function ArticlesPage() {
  const dbArticles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  const articles = dbArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    category: a.category,
    tags: JSON.parse(a.tags) as string[],
    authorName: a.authorName,
    readTime: a.readTime,
    publishedAt: a.publishedAt,
    featured: a.featured,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <ArticlesClient articles={articles} categories={ARTICLE_CATEGORIES} />
      <Footer />
    </>
  );
}
