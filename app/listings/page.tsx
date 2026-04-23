import type { Metadata } from "next";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { CITIES, CATEGORIES } from "../data/listings";
import ListingsClient from "./ListingsClient";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Find Local Flower Shops Near You",
  description: "Browse 200+ verified local florists across 50+ US cities. Find the best flower shops by city, read reviews, check hours, and discover same-day delivery options.",
  keywords: "local flower shops, florists near me, flower delivery, best florists USA, find a florist, flower shop directory",
  openGraph: {
    title: "Find Local Flower Shops | MyCareerly Directory",
    description: "200+ verified local florists across 50+ US cities. Find the best flower shop near you.",
    url: `${SITE_URL}/listings`,
    type: "website",
    images: [{ url: "/images/articles/cover-7-popular-flowers.jpg", width: 1200, height: 630, alt: "Local Flower Shops Directory" }],
  },
  twitter: { card: "summary_large_image", title: "Find Local Flower Shops | MyCareerly", description: "200+ verified florists across 50+ US cities." },
  alternates: { canonical: `${SITE_URL}/listings` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  name: "Local Flower Shops Directory",
  description: "Verified local flower shops across major US cities.",
  url: `${SITE_URL}/listings`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Find Florists", item: `${SITE_URL}/listings` },
    ],
  },
};

export default async function ListingsPage() {
  const dbListings = await prisma.listing.findMany({
    where: { status: "approved" },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { sortOrder: "desc" },
      { rating: "desc" },
      { createdAt: "desc" },
    ],
  });

  const listings = dbListings.map((l) => ({
    id: l.id,
    slug: l.slug,
    name: l.name,
    tagline: l.tagline,
    address: l.address,
    city: l.city,
    phone: l.phone,
    rating: l.rating,
    reviewCount: l.reviewCount,
    images: JSON.parse(l.images) as string[],
    categories: JSON.parse(l.categories) as string[],
    tags: JSON.parse(l.tags) as string[],
    hours: JSON.parse(l.hours) as { day: string; time: string; closed?: boolean }[],
    open: l.open,
    verified: l.verified,
    featured: l.featured,
    priceRange: l.priceRange,
    deliveryAvailable: l.deliveryAvailable,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <ListingsClient listings={listings} cities={CITIES} categories={CATEGORIES} />
      <Footer />
    </>
  );
}
