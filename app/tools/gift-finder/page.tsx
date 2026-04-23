import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import GiftFinderClient from "./GiftFinderClient";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Flower Gift Finder — Find the Perfect Bouquet in 30 Seconds",
  description: "Free 3-step quiz: tell us who, what occasion, and your budget. Get personalized flower recommendations + nearby florists + care tips. No signup needed.",
  keywords: "flower gift finder, what flowers to send, gift flowers quiz, flower recommendation tool, perfect flowers for mom, flowers for partner",
  openGraph: {
    title: "Flower Gift Finder | MyCareerly",
    description: "Get personalized flower recommendations in 3 quick taps. Free interactive tool.",
    url: `${SITE_URL}/tools/gift-finder`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools/gift-finder` },
};

export default async function GiftFinderPage() {
  // Fetch top featured/sponsored florists with delivery — used as recommendation matches
  const nearbyShops = await prisma.listing.findMany({
    where: {
      status: "approved",
      deliveryAvailable: true,
    },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { rating: "desc" },
    ],
    take: 6,
    select: {
      id: true, name: true, city: true, state: true, rating: true,
      reviewCount: true, images: true, tagline: true, sponsored: true, featured: true,
    },
  });

  const shops = nearbyShops.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    state: s.state,
    rating: s.rating,
    reviewCount: s.reviewCount,
    image: (JSON.parse(s.images) as string[])[0] ?? "",
    tagline: s.tagline,
    sponsored: s.sponsored,
    featured: s.featured,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Flower Gift Finder",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free 3-step interactive quiz that recommends 3 perfect flower gifts based on recipient, occasion, and budget — plus nearby florists and care tips.",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "127", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "HowTo",
        name: "How to Find the Perfect Flower Gift",
        description: "A 3-step interactive method to choose flowers tailored to recipient, occasion, and budget.",
        totalTime: "PT30S",
        step: [
          { "@type": "HowToStep", position: 1, name: "Pick the recipient", text: "Choose who you're gifting flowers to: mom, partner, friend, colleague, or anyone." },
          { "@type": "HowToStep", position: 2, name: "Pick the occasion", text: "Select the occasion: birthday, anniversary, thank-you, sympathy, congratulations, get-well, or just because." },
          { "@type": "HowToStep", position: 3, name: "Set your budget", text: "Choose budget range: $25-50, $50-100, or $100+." },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: "Gift Finder", item: `${SITE_URL}/tools/gift-finder` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <Suspense fallback={<div className="py-20 text-center text-[#6B6B6B]">Loading…</div>}>
          <GiftFinderClient shops={shops} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
