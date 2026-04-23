import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { MapPin, Star, ChevronRight, Filter, CheckCircle2, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";
const FALLBACK = "https://images.unsplash.com/photo-1487530811015-780780169993?w=1400&q=80&auto=format&fit=crop";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) return { title: "City not found" };

  const count = await prisma.listing.count({ where: { citySlug, status: "approved" } });

  const metaDesc = (city.metaDescription || `Find ${city.name}'s best flower shops. ${count}+ verified florists with reviews, delivery, wedding specialists.`).slice(0, 158);

  return {
    title: city.metaTitle || `Flower Shops in ${city.name}, ${city.stateFull || city.state}`,
    description: metaDesc,
    keywords: city.keywords,
    openGraph: {
      title: `Best Flower Shops in ${city.name} | MyCareerly`,
      description: `${count}+ verified local florists in ${city.name}, ${city.stateFull || city.state}. Find fresh flowers for any occasion.`,
      url: `${SITE_URL}/cities/${citySlug}`,
      type: "website",
      images: city.heroImage ? [{ url: city.heroImage, width: 1600, height: 900, alt: `Flower shops in ${city.name}` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Flower Shops in ${city.name}, ${city.state}`,
      description: `${count}+ verified local florists in ${city.name}.`,
      images: city.heroImage ? [city.heroImage] : [],
    },
    alternates: { canonical: `${SITE_URL}/cities/${citySlug}` },
    other: {
      "geo.region": `US-${city.state}`,
      "geo.placename": city.name,
    },
  };
}

const PRICE_LABELS: Record<string, string> = { budget: "Budget-Friendly", mid: "Mid-Range", premium: "Premium" };
const PRICE_COLORS: Record<string, string> = { budget: "#7A9E7E", mid: "#E8705A", premium: "#8B5CF6" };

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;

  const city = await prisma.city.findUnique({ where: { slug: citySlug, active: true } });
  if (!city) notFound();

  const rawListings = await prisma.listing.findMany({
    where: { citySlug, status: "approved" },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { sortOrder: "desc" },
      { rating: "desc" },
    ],
  });

  const listings = rawListings.map((l) => ({
    ...l,
    images: JSON.parse(l.images) as string[],
    categories: JSON.parse(l.categories) as string[],
    tags: JSON.parse(l.tags) as string[],
    hours: JSON.parse(l.hours) as { day: string; time: string; closed?: boolean }[],
  }));

  const heroImage = city.heroImage || FALLBACK;
  const allCategories = Array.from(new Set(listings.flatMap((l) => l.categories)));
  const featuredListings = listings.filter((l) => l.featured);
  const totalListings = listings.length;
  const avgRating = listings.length
    ? (listings.reduce((s, l) => s + l.rating, 0) / listings.length).toFixed(1)
    : "–";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/cities/${citySlug}`,
    name: `Flower Shops in ${city.name}`,
    description: city.description,
    url: `${SITE_URL}/cities/${citySlug}`,
    image: city.heroImage,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities` },
        { "@type": "ListItem", position: 3, name: city.name, item: `${SITE_URL}/cities/${citySlug}` },
      ],
    },
    about: {
      "@type": "Place",
      name: `${city.name}, ${city.stateFull || city.state}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: "US",
      },
    },
    mainEntity: {
      "@type": "ItemList",
      name: `Top Flower Shops in ${city.name}`,
      numberOfItems: totalListings,
      itemListElement: listings.slice(0, 10).map((shop, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "FlowerShop",
          "@id": `${SITE_URL}/listings/${shop.slug}`,
          name: shop.name,
          image: shop.images[0],
          address: { "@type": "PostalAddress", streetAddress: shop.address, addressLocality: city.name, addressRegion: city.state, addressCountry: "US" },
          aggregateRating: shop.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviewCount } : undefined,
          priceRange: shop.priceRange === "budget" ? "$" : shop.priceRange === "premium" ? "$$$" : "$$",
        },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/cities" className="hover:text-[#E8705A] transition-colors">Cities</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">{city.name}, {city.state}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
          <Image
            src={heroImage}
            alt={`Best flower shops in ${city.name}, ${city.stateFull || city.state} — local florist directory hero image`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-10 max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-3 border border-white/20">
              <MapPin size={11} />
              {city.stateFull || city.state} · United States
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
              Flower Shops in {city.name}
            </h1>
            <p className="text-white/80 text-base max-w-xl">
              {city.shortDesc || `Discover the best local florists in ${city.name} — handpicked, verified, and ready to bring beauty to your door.`}
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                { label: `${totalListings} Shops`, icon: "🏪" },
                { label: `${avgRating} Avg Rating`, icon: "⭐" },
                { label: "Same-Day Delivery", icon: "🚚" },
              ].map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-1.5 text-white text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

          {/* SEO description */}
          {city.description && (
            <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-10">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">About Flower Shops in {city.name}</h2>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">{city.description}</p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Shops", value: String(totalListings), sub: "verified listings" },
              { label: "Average Rating", value: avgRating, sub: "across all shops" },
              { label: "With Delivery", value: String(listings.filter((l) => l.deliveryAvailable).length), sub: "offer delivery" },
              { label: "Featured Shops", value: String(featuredListings.length), sub: "editor's picks" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white border border-[#E8E4DF] rounded-2xl p-5 text-center">
                <p className="text-2xl font-bold text-[#E8705A]">{value}</p>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{label}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Featured picks */}
          {featuredListings.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Editor's Picks in {city.name}</h2>
                <span className="text-xs text-[#6B6B6B] bg-[#F9EBE8] px-3 py-1 rounded-full font-medium text-[#E8705A]">
                  Featured
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredListings.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} cityName={city.name} featured />
                ))}
              </div>
            </section>
          )}

          {/* All listings */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#1A1A1A]">All Florists in {city.name}</h2>
              <span className="text-sm text-[#6B6B6B]">{totalListings} shops</span>
            </div>

            {allCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                <span className="text-xs font-medium text-[#6B6B6B] flex items-center gap-1 mr-1">
                  <Filter size={11} /> Filter:
                </span>
                {allCategories.slice(0, 8).map((cat) => (
                  <span key={cat} className="text-xs px-3 py-1.5 rounded-full border border-[#E8E4DF] text-[#4A4A4A] bg-white cursor-pointer hover:border-[#E8705A] hover:text-[#E8705A] transition-colors">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((shop) => (
                <ShopCard key={shop.id} shop={shop} cityName={city.name} />
              ))}
            </div>

            {listings.length === 0 && (
              <div className="text-center py-20 text-[#6B6B6B]">
                <p className="text-4xl mb-3">🌸</p>
                <p className="font-semibold text-[#1A1A1A]">No listings yet</p>
                <p className="text-sm mt-1">We're adding more shops soon!</p>
              </div>
            )}
          </section>

          {/* Explore more cities */}
          <section className="mt-16 bg-white border border-[#E8E4DF] rounded-3xl p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">Explore More Cities</h2>
            <p className="text-sm text-[#6B6B6B] mb-5">Find the best florists across the United States</p>
            <Link href="/cities" className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              View All Cities <ChevronRight size={14} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

type Shop = {
  id: string; slug: string; name: string; tagline: string; address: string;
  city: string; state: string; rating: number; reviewCount: number;
  images: string[]; categories: string[]; tags: string[];
  open: boolean; verified: boolean; featured: boolean;
  priceRange: string; deliveryAvailable: boolean; established: string;
};

function ShopCard({ shop, cityName, featured = false }: { shop: Shop; cityName: string; featured?: boolean }) {
  const image = shop.images[0] ?? "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80&auto=format&fit=crop";
  const priceColor = PRICE_COLORS[shop.priceRange] ?? "#E8705A";
  const priceLabel = PRICE_LABELS[shop.priceRange] ?? "Mid-Range";
  const altText = `${shop.name} — flower shop in ${cityName}`;

  return (
    <Link
      href={`/listings/${shop.slug}`}
      aria-label={`View ${shop.name} in ${cityName}`}
      className="group bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-[#F4F3F0]">
        <Image
          src={image}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {featured && (
          <div className="absolute top-3 left-3 bg-[#E8705A] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ★ Featured
          </div>
        )}
        {shop.verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#7A9E7E] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={9} /> Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star size={10} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-[#1A1A1A]">{shop.rating}</span>
          <span className="text-[10px] text-[#6B6B6B]">({shop.reviewCount.toLocaleString()})</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors leading-snug">{shop.name}</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
            style={{ background: priceColor + "18", color: priceColor }}>
            {priceLabel}
          </span>
        </div>
        <p className="text-xs text-[#6B6B6B] mb-2 leading-relaxed line-clamp-2">{shop.tagline}</p>

        <div className="flex items-center gap-1 text-[11px] text-[#6B6B6B] mb-3">
          <MapPin size={10} className="shrink-0" />
          <span className="line-clamp-1">{shop.address}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {shop.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F9EBE8] text-[#E8705A] font-medium">
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE8]">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${shop.open ? "bg-green-500" : "bg-red-400"}`} />
            <span className="text-[11px] text-[#6B6B6B]">{shop.open ? "Open Now" : "Closed"}</span>
          </div>
          {shop.deliveryAvailable && (
            <div className="flex items-center gap-1 text-[11px] text-[#7A9E7E] font-medium">
              <Truck size={10} /> Delivery
            </div>
          )}
          <span className="text-[11px] font-semibold text-[#E8705A] group-hover:gap-2 transition-all">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
