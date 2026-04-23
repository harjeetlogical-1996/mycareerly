import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { US_STATES, findStateBySlug } from "../../data/us-states";
import { MapPin, ChevronRight, Star, Building2, Flower2, CheckCircle2, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";
const FALLBACK = "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80&auto=format&fit=crop";

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateData = findStateBySlug(state);
  if (!stateData) return { title: "Not Found" };

  const count = await prisma.listing.count({
    where: { state: stateData.code, status: "approved" },
  });

  return {
    title: `Flower Shops in ${stateData.name} — ${count}+ Verified Florists`,
    description: `Find the best flower shops in ${stateData.name}. Browse ${count}+ verified local florists, read reviews, check hours, and order fresh flowers across the ${stateData.nickname}.`,
    keywords: `flower shops ${stateData.name}, florists ${stateData.name}, ${stateData.name} flower delivery, flower shop near me ${stateData.name}, ${stateData.name} florist directory, best florist ${stateData.name}`,
    openGraph: {
      title: `Flower Shops in ${stateData.name} | MyCareerly`,
      description: `${count}+ verified florists across ${stateData.name}. Find the best flower shops in every major city.`,
      url: `${SITE_URL}/florists/${stateData.slug}`,
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}/florists/${stateData.slug}` },
    other: {
      "geo.region": `US-${stateData.code}`,
      "geo.placename": stateData.name,
    },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateData = findStateBySlug(state);
  if (!stateData) notFound();

  const listings = await prisma.listing.findMany({
    where: { state: stateData.code, status: "approved" },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { sortOrder: "desc" },
      { rating: "desc" },
    ],
    take: 60,
  });

  // Get distinct cities in this state with listing counts
  const cityGroups = await prisma.listing.groupBy({
    by: ["city", "citySlug"],
    where: { state: stateData.code, status: "approved" },
    _count: { _all: true },
    _avg: { rating: true },
    orderBy: { _count: { id: "desc" } },
  });

  const totalListings = listings.length;
  const cityCount = cityGroups.length;
  const avgRating = listings.length > 0
    ? (listings.reduce((s, l) => s + l.rating, 0) / listings.length).toFixed(1)
    : "–";
  const withDelivery = listings.filter((l) => l.deliveryAvailable).length;

  const allListings = listings.map((l) => ({
    ...l,
    images: JSON.parse(l.images) as string[],
    categories: JSON.parse(l.categories) as string[],
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Flower Shops in ${stateData.name}`,
    description: `Verified local florists across ${stateData.name} — ${totalListings}+ shops in ${cityCount} cities.`,
    url: `${SITE_URL}/florists/${stateData.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Florists", item: `${SITE_URL}/listings` },
        { "@type": "ListItem", position: 3, name: stateData.name, item: `${SITE_URL}/florists/${stateData.slug}` },
      ],
    },
    about: {
      "@type": "State",
      name: stateData.name,
      address: { "@type": "PostalAddress", addressRegion: stateData.code, addressCountry: "US" },
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalListings,
      itemListElement: allListings.slice(0, 10).map((shop, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "FlowerShop",
          "@id": `${SITE_URL}/listings/${shop.slug}`,
          name: shop.name,
          image: shop.images[0],
          address: {
            "@type": "PostalAddress",
            streetAddress: shop.address,
            addressLocality: shop.city,
            addressRegion: stateData.code,
            addressCountry: "US",
          },
          aggregateRating: shop.reviewCount > 0
            ? { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviewCount }
            : undefined,
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
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/listings" className="hover:text-[#E8705A] transition-colors">Florists</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">{stateData.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative py-16 px-5 md:px-8 bg-gradient-to-b from-[#F9EBE8] to-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8705A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <MapPin size={11} /> {stateData.nickname}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-3 leading-tight tracking-tight">
              Flower Shops in <span className="text-[#E8705A]">{stateData.name}</span>
            </h1>
            <p className="text-lg text-[#4A4A4A] max-w-3xl leading-relaxed">
              {totalListings > 0 ? (
                <>Discover <strong>{totalListings}+ verified florists</strong> across {stateData.name}'s best cities. From {cityGroups.slice(0, 3).map((c) => c.city).join(", ")}{cityGroups.length > 3 ? ` and ${cityGroups.length - 3} more cities` : ""}, find the perfect local flower shop for weddings, gifts, and everyday joy.</>
              ) : (
                <>We're building our directory of verified florists in {stateData.name}. Know a great local flower shop? <Link href="/listings/create" className="text-[#E8705A] font-semibold hover:underline">Submit a listing</Link> to help others find them.</>
              )}
            </p>
          </div>
        </section>

        {/* Stats row */}
        {totalListings > 0 && (
          <section className="bg-white border-y border-[#E8E4DF] py-5 px-5 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Verified Florists", value: `${totalListings}+`, icon: Building2 },
                { label: "Cities Covered", value: `${cityCount}`, icon: MapPin },
                { label: "Avg Rating", value: avgRating, icon: Star },
                { label: "Offer Delivery", value: `${withDelivery}`, icon: Truck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon size={14} className="text-[#E8705A]" />
                    <span className="text-xs text-[#6B6B6B] font-medium uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">

          {/* State flower info */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-10">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 bg-[#F9EBE8] rounded-2xl flex items-center justify-center shrink-0">
                <Flower2 size={22} className="text-[#E8705A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">State Flower</p>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{stateData.stateFlower}</h2>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{stateData.flowerDesc}</p>
              </div>
            </div>
          </section>

          {/* Cities in this state */}
          {cityGroups.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">Florists by City in {stateData.name}</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cityGroups.map((c) => (
                  <Link
                    key={c.citySlug}
                    href={`/cities/${c.citySlug}`}
                    className="bg-white border border-[#E8E4DF] rounded-2xl p-4 hover:border-[#E8705A] hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">{c.city}</p>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">
                          {c._count._all} shop{c._count._all !== 1 ? "s" : ""}
                          {c._avg.rating ? ` · ${c._avg.rating.toFixed(1)}★ avg` : ""}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-[#9A9A9A] group-hover:text-[#E8705A] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top listings */}
          {allListings.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Top Florists in {stateData.name}</h2>
                <Link href="/listings" className="text-sm font-semibold text-[#E8705A] hover:underline">
                  View all listings →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allListings.slice(0, 12).map((shop) => {
                  const img = shop.images[0] || FALLBACK;
                  return (
                    <Link
                      key={shop.id}
                      href={`/listings/${shop.slug}`}
                      className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <div className="relative h-44 bg-[#F4F3F0] overflow-hidden">
                        <Image
                          src={img}
                          alt={`${shop.name} — flower shop in ${shop.city}, ${stateData.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        {shop.sponsored && (
                          <span className="absolute top-2 left-2 bg-[#E8705A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Sponsored
                          </span>
                        )}
                        {!shop.sponsored && shop.featured && (
                          <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ★ Featured
                          </span>
                        )}
                        {shop.verified && (
                          <span className="absolute top-2 right-2 bg-white/90 text-[#7A9E7E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={9} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#1A1A1A] mb-0.5 line-clamp-1">{shop.name}</h3>
                        <p className="text-xs text-[#6B6B6B] flex items-center gap-1 mb-2">
                          <MapPin size={10} />
                          {shop.city}, {stateData.code}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="font-bold text-[#1A1A1A]">{shop.rating}</span>
                            <span className="text-[#9A9A9A]">({shop.reviewCount})</span>
                          </div>
                          {shop.deliveryAvailable && (
                            <span className="text-[#7A9E7E] font-semibold text-[11px] inline-flex items-center gap-1">
                              <Truck size={10} /> Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {totalListings === 0 && (
            <section className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-3xl p-8 md:p-12 text-center mb-10">
              <Flower2 size={40} className="text-[#E8705A] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Help us grow {stateData.name}'s directory</h2>
              <p className="text-sm text-[#4A4A4A] max-w-lg mx-auto mb-6 leading-relaxed">
                We're expanding to {stateData.name}. If you own a flower shop here — or know a great one — be the first to get listed.
              </p>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors"
              >
                List Your Shop (Free)
              </Link>
            </section>
          )}

          {/* Other states */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Flower Shops in Other States</h2>
            <p className="text-sm text-[#6B6B6B] mb-5">Explore verified florists across all 50 US states + DC.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {US_STATES.filter((s) => s.slug !== stateData.slug).slice(0, 20).map((s) => (
                <Link
                  key={s.slug}
                  href={`/florists/${s.slug}`}
                  className="text-xs px-3 py-2 rounded-lg border border-[#E8E4DF] bg-white text-[#4A4A4A] hover:border-[#E8705A] hover:text-[#E8705A] transition-colors text-center"
                >
                  {s.name}
                </Link>
              ))}
            </div>
            <Link
              href="/florists"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-[#E8705A] hover:underline"
            >
              See all 50 states <ChevronRight size={13} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
