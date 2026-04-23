import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { MapPin, ChevronRight, Star, Building2 } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Find Flower Shops by City — 51 US Cities",
  description: "Browse verified local flower shops across 51 major US cities. Find the best florists in New York, Los Angeles, Chicago, Houston, Miami, San Francisco, and more.",
  keywords: "flower shops by city, florists USA, flower delivery by city, local florists directory, find florist near me",
  openGraph: {
    title: "Find Flower Shops by City | MyCareerly",
    description: "Verified local florists across 51 major US cities. Find the best flower shop in your city.",
    url: `${SITE_URL}/cities`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/cities` },
};

const FALLBACK = "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80&auto=format&fit=crop";

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });

  const allListings = await prisma.listing.findMany({
    where: { status: "approved" },
    select: { citySlug: true, rating: true },
  });

  const countMap: Record<string, { count: number; avgRating: number }> = {};
  for (const l of allListings) {
    if (!l.citySlug) continue;
    if (!countMap[l.citySlug]) countMap[l.citySlug] = { count: 0, avgRating: 0 };
    countMap[l.citySlug].count += 1;
    countMap[l.citySlug].avgRating += l.rating;
  }
  for (const key of Object.keys(countMap)) {
    countMap[key].avgRating = countMap[key].avgRating / countMap[key].count;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Flower Shops by City",
    description: "Browse verified local florists across 51 major US cities.",
    url: `${SITE_URL}/cities`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cities.length,
      itemListElement: cities.slice(0, 20).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Flower Shops in ${c.name}, ${c.state}`,
        url: `${SITE_URL}/cities/${c.slug}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Hero */}
        <section className="relative bg-[#1A1A1A] overflow-hidden py-20 px-5 text-center">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1487530811015-780780169993?w=1400&q=80&auto=format&fit=crop"
              alt="Flower shops across the United States"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-white/20">
              <MapPin size={11} /> United States
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Flower Shops by City
            </h1>
            <p className="text-white/70 text-base max-w-lg mx-auto">
              Discover handpicked, verified florists in {cities.length} cities across the United States.
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">Cities</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Browse by City</h2>
              <p className="text-sm text-[#6B6B6B] mt-1">{cities.length} cities · {allListings.length}+ verified florists</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const meta = countMap[city.slug] ?? { count: 0, avgRating: 0 };
              const image = city.coverImage || FALLBACK;
              const altText = `Flower shops in ${city.name}, ${city.stateFull || city.state} — local florists directory`;

              return (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  aria-label={`View flower shops in ${city.name}, ${city.state}`}
                  className="group relative bg-white border border-[#E8E4DF] rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-[#F4F3F0]">
                    <Image
                      src={image}
                      alt={altText}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs font-bold px-2.5 py-1 rounded-full">
                      {city.state}
                    </div>
                    {city.featured && (
                      <div className="absolute top-3 left-3 bg-[#E8705A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        ★ Featured
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                      <h3 className="text-xl font-bold text-white">{city.name}</h3>
                      <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{city.shortDesc}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-[#4A4A4A]">
                        <Building2 size={11} className="text-[#E8705A]" />
                        <span className="font-semibold">{meta.count}</span>
                        <span className="text-[#6B6B6B]">shops</span>
                      </div>
                      {meta.avgRating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#4A4A4A]">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{meta.avgRating.toFixed(1)}</span>
                          <span className="text-[#6B6B6B]">avg</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#E8705A] group-hover:translate-x-0.5 transition-transform">
                      Explore →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
