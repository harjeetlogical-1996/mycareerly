import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { US_STATES } from "../data/us-states";
import { MapPin, ChevronRight, Flower2 } from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Flower Shops by State — All 50 US States + DC",
  description: "Browse verified flower shops in all 50 US states plus DC. Find trusted local florists in California, Texas, New York, Florida, and every state.",
  keywords: "flower shops by state, florists in USA, state flower directory, local florists all states",
  openGraph: {
    title: "Flower Shops by State | MyCareerly",
    description: "Verified florists across all 50 US states + DC. Find the best flower shops in your state.",
    url: `${SITE_URL}/florists`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/florists` },
};

export default async function FloristsStatesPage() {
  const counts = await prisma.listing.groupBy({
    by: ["state"],
    where: { status: "approved" },
    _count: { _all: true },
  });

  const countMap: Record<string, number> = {};
  counts.forEach((c) => { if (c.state) countMap[c.state] = c._count._all; });

  const totalListings = Object.values(countMap).reduce((a, b) => a + b, 0);
  const statesWithShops = Object.keys(countMap).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Flower Shops by State",
    description: "Directory of verified flower shops organized by US state.",
    url: `${SITE_URL}/florists`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Florists", item: `${SITE_URL}/listings` },
        { "@type": "ListItem", position: 3, name: "By State", item: `${SITE_URL}/florists` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: US_STATES.length,
      itemListElement: US_STATES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Flower Shops in ${s.name}`,
        url: `${SITE_URL}/florists/${s.slug}`,
      })),
    },
  };

  // Sort states: those with listings first (by count desc), then alphabetical
  const sortedStates = [...US_STATES].sort((a, b) => {
    const ca = countMap[a.code] ?? 0;
    const cb = countMap[b.code] ?? 0;
    if (ca === cb) return a.name.localeCompare(b.name);
    return cb - ca;
  });

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
            <span className="text-[#1A1A1A] font-medium">By State</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-5 md:px-8 bg-gradient-to-b from-[#F9EBE8] to-white text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <Flower2 size={11} /> 50 States + DC
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3">
              Flower Shops by State
            </h1>
            <p className="text-lg text-[#4A4A4A] leading-relaxed">
              {totalListings}+ verified florists across {statesWithShops} US states. Find the best local flower shops in your state or explore florists nationwide.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedStates.map((s) => {
              const count = countMap[s.code] ?? 0;
              return (
                <Link
                  key={s.slug}
                  href={`/florists/${s.slug}`}
                  className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E8705A] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors leading-snug">{s.name}</p>
                      <p className="text-xs text-[#9A9A9A] mt-0.5">{s.nickname}</p>
                      <p className="text-xs text-[#E8705A] font-semibold mt-2">
                        {count > 0 ? `${count} shop${count !== 1 ? "s" : ""}` : "Coming soon"}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[#9A9A9A] group-hover:text-[#E8705A] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 bg-white border border-[#E8E4DF] rounded-3xl p-8 text-center">
            <MapPin size={28} className="text-[#E8705A] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Own a flower shop?</h2>
            <p className="text-sm text-[#6B6B6B] mb-5 max-w-md mx-auto">
              Get listed on MyCareerly for free. Join {totalListings}+ florists already on our directory.
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors"
            >
              List Your Shop (Free)
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
