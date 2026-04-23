import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { getPlaceId, getPlaceReviews, getPlacePhotos } from "../../lib/googlePlaces";
import ReviewForm from "./ReviewForm";
import {
  MapPin, Star, Phone, Globe, Clock, CheckCircle2, Mail,
  ArrowLeft, Truck, Leaf, Share2, Heart, ChevronRight,
} from "lucide-react";

const SITE_URL = "https://mycareerly.com";
const PRICE_LABELS: Record<string, string> = { budget: "Budget $", mid: "Mid-range $$", premium: "Premium $$$" };

/**
 * Look up a listing by slug first, then by ID (backward compat).
 * Returns the listing + a flag indicating if the URL needs to redirect to the slug.
 */
async function findListing(idOrSlug: string) {
  // Try slug first (preferred SEO URL)
  let shop = await prisma.listing.findUnique({ where: { slug: idOrSlug } });
  if (shop && shop.status === "approved") return { shop, needsRedirect: false };

  // Fallback to ID (old links)
  shop = await prisma.listing.findUnique({ where: { id: idOrSlug } });
  if (shop && shop.status === "approved") return { shop, needsRedirect: true };

  return { shop: null, needsRedirect: false };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { shop } = await findListing(id);
  if (!shop) return {};
  const images = JSON.parse(shop.images) as string[];
  const canonicalUrl = `${SITE_URL}/listings/${shop.slug}`;
  return {
    title: `${shop.name} — Florist in ${shop.city}, ${shop.state}`,
    description: shop.tagline || `${shop.name} is a verified local florist in ${shop.city}, ${shop.state}. Browse reviews, hours, and services.`,
    keywords: `${shop.name}, florist ${shop.city}, flower shop ${shop.city}, ${shop.city} ${shop.state} florists, ${shop.name} reviews`,
    openGraph: {
      title: `${shop.name} | Florist in ${shop.city}`,
      description: shop.tagline || `Verified local florist in ${shop.city}, ${shop.state}.`,
      url: canonicalUrl,
      type: "website",
      images: images[0] ? [{ url: images[0], width: 1200, height: 630, alt: shop.name }] : [],
    },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shop: raw, needsRedirect } = await findListing(id);
  if (!raw) notFound();

  // 301 redirect old ID-based URLs to new slug URLs (SEO-critical)
  if (needsRedirect) {
    const { redirect } = await import("next/navigation");
    redirect(`/listings/${raw.slug}`);
  }

  const shop = {
    ...raw,
    images: JSON.parse(raw.images) as string[],
    categories: JSON.parse(raw.categories) as string[],
    tags: JSON.parse(raw.tags) as string[],
    hours: JSON.parse(raw.hours) as { day: string; time: string; closed?: boolean }[],
    reviews: raw.reviewCount,
  };

  // Fetch real Google reviews + photos + user reviews in parallel
  const placeId = await getPlaceId(shop.name, shop.address, shop.city);
  const [googleReviews, googlePhotos, userReviews] = await Promise.all([
    placeId ? getPlaceReviews(placeId) : Promise.resolve([]),
    placeId ? getPlacePhotos(placeId) : Promise.resolve([]),
    prisma.review.findMany({
      where: { listingId: shop.id, status: "approved" },
      orderBy: [{ helpful: "desc" }, { createdAt: "desc" }],
      select: { id: true, authorName: true, rating: true, title: true, body: true, createdAt: true },
    }),
  ]);
  const displayImages = googlePhotos.length > 0 ? googlePhotos : shop.images;

  const relatedRaw = await prisma.listing.findMany({
    where: { status: "approved", id: { not: shop.id }, city: shop.city },
    take: 3,
  });
  const related = relatedRaw.map((l) => ({
    ...l,
    images: JSON.parse(l.images) as string[],
    reviews: l.reviewCount,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FlowerShop",
    "@id": `${SITE_URL}/listings/${shop.slug}`,
    name: shop.name,
    description: shop.description || shop.tagline,
    url: `${SITE_URL}/listings/${shop.slug}`,
    telephone: shop.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      addressLocality: shop.city,
      addressRegion: shop.state,
      addressCountry: "US",
    },
    aggregateRating: shop.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: shop.rating,
      reviewCount: shop.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    image: shop.images,
    priceRange: shop.priceRange === "budget" ? "$" : shop.priceRange === "premium" ? "$$$" : "$$",
    openingHoursSpecification: shop.hours
      .filter((h) => !h.closed)
      .map((h) => ({ "@type": "OpeningHoursSpecification", name: h.day, description: h.time })),
    ...(shop.website ? { sameAs: [shop.website] } : {}),
    ...(shop.deliveryAvailable ? { hasOfferCatalog: { "@type": "OfferCatalog", name: "Flower Delivery" } } : {}),
    ...(googleReviews.length > 0 || userReviews.length > 0 ? {
      review: [
        // Google reviews
        ...googleReviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.authorName },
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          reviewBody: r.text,
          datePublished: r.publishTime,
          publisher: { "@type": "Organization", name: "Google" },
        })),
        // User-submitted reviews on MyCareerly
        ...userReviews.slice(0, 10).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.authorName },
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          name: r.title || undefined,
          reviewBody: r.body,
          datePublished: r.createdAt.toISOString(),
          publisher: { "@type": "Organization", name: "MyCareerly" },
        })),
      ],
    } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Flower Shops", item: `${SITE_URL}/listings` },
      ...(shop.citySlug ? [{ "@type": "ListItem", position: 3, name: shop.city, item: `${SITE_URL}/cities/${shop.citySlug}` }] : []),
      { "@type": "ListItem", position: shop.citySlug ? 4 : 3, name: shop.name, item: `${SITE_URL}/listings/${shop.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/listings" className="hover:text-[#E8705A] transition-colors">Listings</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">{shop.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Back + actions */}
              <div className="flex items-center justify-between">
                <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                  <ArrowLeft size={14} /> All Listings
                </Link>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 border border-[#E8E4DF] bg-white rounded-xl flex items-center justify-center hover:bg-[#F9EBE8] hover:border-[#E8705A] transition-colors">
                    <Heart size={15} className="text-[#6B6B6B]" />
                  </button>
                  <button className="w-9 h-9 border border-[#E8E4DF] bg-white rounded-xl flex items-center justify-center hover:bg-[#F9EBE8] hover:border-[#E8705A] transition-colors">
                    <Share2 size={15} className="text-[#6B6B6B]" />
                  </button>
                </div>
              </div>

              {/* Photo gallery */}
              <div className="grid grid-cols-3 gap-2 rounded-3xl overflow-hidden h-72">
                <div className="col-span-2 relative overflow-hidden">
                  <Image src={displayImages[0]} alt={shop.name} fill sizes="(max-width: 1024px) 66vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-500" priority />
                </div>
                <div className="flex flex-col gap-2">
                  {displayImages.slice(1, 3).map((img, i) => (
                    <div key={i} className="relative flex-1 overflow-hidden">
                      <Image src={img} alt="" fill sizes="(max-width: 1024px) 33vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Name + badges */}
              <div>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${shop.open ? "bg-[#EDF5EE] text-[#7A9E7E]" : "bg-gray-100 text-gray-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.open ? "bg-[#7A9E7E]" : "bg-gray-400"}`} />
                        {shop.open ? "Open Now" : "Closed"}
                      </span>
                      {shop.verified && (
                        <span className="flex items-center gap-1 bg-[#EDF5EE] text-[#7A9E7E] px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      )}
                      {shop.featured && (
                        <span className="bg-[#F9EBE8] text-[#E8705A] px-2.5 py-1 rounded-full text-xs font-semibold">Featured</span>
                      )}
                      <span className="bg-[#FAFAF8] border border-[#E8E4DF] text-[#6B6B6B] px-2.5 py-1 rounded-full text-xs">
                        {PRICE_LABELS[shop.priceRange]}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">{shop.name}</h1>
                    <p className="text-[#6B6B6B] italic mt-1">{shop.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-[#E8E4DF] rounded-2xl px-4 py-3">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                    <div>
                      <p className="text-xl font-bold text-[#1A1A1A] leading-none">{shop.rating}</p>
                      <p className="text-xs text-[#6B6B6B]">{shop.reviews} reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick info strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: MapPin, label: shop.city, sub: shop.address },
                  { icon: Clock, label: shop.open ? "Open Now" : "Closed", sub: shop.hours[0]?.time },
                  { icon: Truck, label: shop.deliveryAvailable ? "Delivery" : "No Delivery", sub: shop.deliveryAvailable ? "Available" : "Walk-in only" },
                  { icon: Leaf, label: `Est. ${shop.established}`, sub: "Years of experience" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="bg-white border border-[#E8E4DF] rounded-2xl p-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#F9EBE8] rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#E8705A]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{label}</p>
                      <p className="text-[10px] text-[#6B6B6B] truncate">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">About the Shop</h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{shop.description}</p>
              </div>

              {/* Specialities & Tags */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Specialities</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {shop.categories.map((cat) => (
                    <span key={cat} className="bg-[#F9EBE8] text-[#E8705A] text-sm font-medium px-3 py-1.5 rounded-xl">{cat}</span>
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Services & Features</h3>
                <div className="flex flex-wrap gap-2">
                  {shop.tags.map((tag) => (
                    <span key={tag} className="bg-[#FAFAF8] border border-[#E8E4DF] text-[#6B6B6B] text-xs px-3 py-1.5 rounded-xl">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Business Hours</h2>
                <div className="space-y-2">
                  {shop.hours.map((h) => (
                    <div key={h.day} className="flex items-center justify-between py-2 border-b border-[#E8E4DF] last:border-0">
                      <span className="text-sm font-medium text-[#1A1A1A]">{h.day}</span>
                      <span className={`text-sm ${h.closed ? "text-[#E8705A]" : "text-[#6B6B6B]"}`}>
                        {h.closed ? "Closed" : h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A1A]">Customer Reviews</h2>
                    {googleReviews.length > 0 && (
                      <p className="text-xs text-[#6B6B6B] mt-0.5 flex items-center gap-1">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
                        Powered by Google
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-[#1A1A1A]">{shop.rating}</span>
                    <span className="text-[#6B6B6B] text-sm">({shop.reviews.toLocaleString()})</span>
                  </div>
                </div>

                {googleReviews.length > 0 ? (
                  <div className="space-y-4">
                    {googleReviews.map((r, i) => (
                      <div key={i} className="pb-4 border-b border-[#E8E4DF] last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {r.authorPhoto ? (
                              <Image src={r.authorPhoto} alt={r.authorName} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-[#F9EBE8] rounded-full flex items-center justify-center text-sm font-bold text-[#E8705A]">
                                {r.authorName[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[#1A1A1A]">{r.authorName}</p>
                              <p className="text-xs text-[#6B6B6B]">{r.relativeTime}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(Math.round(r.rating))].map((_, j) => (
                              <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        {r.text && <p className="text-sm text-[#6B6B6B] leading-relaxed">{r.text}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B] text-center py-6">No reviews available yet.</p>
                )}

                {placeId && (
                  <a
                    href={`https://search.google.com/local/reviews?placeid=${placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full border border-[#E8E4DF] rounded-xl py-2.5 text-sm font-medium text-[#6B6B6B] hover:bg-[#F9EBE8] hover:text-[#E8705A] transition-colors flex items-center justify-center gap-2"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5" />
                    View All Reviews on Google
                  </a>
                )}
              </div>

              {/* User-submitted MyCareerly reviews */}
              {userReviews.length > 0 && (
                <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#1A1A1A]">MyCareerly Reviews</h2>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{userReviews.length} verified review{userReviews.length !== 1 ? "s" : ""} from our community</p>
                    </div>
                    <span className="bg-[#F9EBE8] text-[#E8705A] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Community</span>
                  </div>

                  <div className="space-y-5">
                    {userReviews.map((r) => (
                      <div key={r.id} className="pb-5 border-b border-[#E8E4DF] last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#F9EBE8] rounded-full flex items-center justify-center text-sm font-bold text-[#E8705A]">
                              {r.authorName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A1A1A]">{r.authorName}</p>
                              <p className="text-xs text-[#9A9A9A]">{r.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={13} className={j < r.rating ? "text-amber-400 fill-amber-400" : "text-[#E8E4DF]"} />
                            ))}
                          </div>
                        </div>
                        {r.title && <p className="font-bold text-[#1A1A1A] text-sm mb-1.5">{r.title}</p>}
                        <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line">{r.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Write a review form */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Write a Review</h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Share your experience with {shop.name} to help others.
                  </p>
                </div>
                <ReviewForm listingId={shop.id} listingName={shop.name} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Contact card */}
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 sticky top-20">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Contact & Directions</h3>

                <div className="space-y-3 mb-5">
                  <a href={`tel:${shop.phone}`} className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl hover:bg-[#F9EBE8] transition-colors group">
                    <div className="w-8 h-8 bg-[#E8705A] rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B]">Phone</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#E8705A]">{shop.phone}</p>
                    </div>
                  </a>


                  {shop.website && (
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl hover:bg-[#F9EBE8] transition-colors group">
                      <div className="w-8 h-8 bg-[#E8705A] rounded-lg flex items-center justify-center shrink-0">
                        <Globe size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Website</p>
                        <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#E8705A]">Visit Website</p>
                      </div>
                    </a>
                  )}

                  {shop.showEmail && shop.email && (
                    <a href={`mailto:${shop.email}`} className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl hover:bg-[#F9EBE8] transition-colors group">
                      <div className="w-8 h-8 bg-[#E8705A] rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#6B6B6B]">Email</p>
                        <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#E8705A] truncate">{shop.email}</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Google Map embed */}
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 border border-[#E8E4DF]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(shop.name + ", " + shop.address + ", " + shop.city)}`}
                  />
                </div>

                <a href={`https://maps.google.com/?q=${encodeURIComponent(shop.name + ", " + shop.address + ", " + shop.city)}`} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold text-sm py-3 rounded-2xl text-center transition-colors">
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Related shops */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">More Shops in {shop.city}</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {related.map((s) => (
                  <Link key={s.id} href={`/listings/${s.id}`} className="group bg-white rounded-2xl overflow-hidden border border-[#E8E4DF] hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="relative h-36 overflow-hidden">
                      <Image src={s.images[0]} alt={s.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">{s.name}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{s.address}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold">{s.rating}</span>
                        <span className="text-xs text-[#6B6B6B]">· {s.reviews} reviews</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
