import { MapPin, Star, Clock, ArrowRight, Store, CheckCircle2 } from "lucide-react";
import { prisma } from "../lib/prisma";

// Deterministic time-seeded shuffle — rotates every 3 hours
function hourlyShuffle<T>(arr: T[]): T[] {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
  const copy = [...arr];
  let s = seed;
  const rand = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default async function Listings() {
  // Fetch a larger pool of featured + sponsored + high-rated listings so shuffle has variety
  const pool = await prisma.listing.findMany({
    where: {
      status: "approved",
      OR: [{ featured: true }, { sponsored: true }],
    },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { rating: "desc" },
    ],
    take: 30,
  });

  // Sponsored listings always stay on top (pinned) — only shuffle featured
  const sponsored = pool.filter((l) => l.sponsored);
  const featuredOnly = pool.filter((l) => l.featured && !l.sponsored);

  // Rotate the featured pool every 3 hours
  const shuffled = hourlyShuffle(featuredOnly);
  const raw = [...sponsored, ...shuffled].slice(0, 4);

  const shops = raw.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    address: s.address,
    city: s.city,
    rating: s.rating,
    reviews: s.reviewCount,
    image: (JSON.parse(s.images) as string[])[0] ?? "",
    tags: (JSON.parse(s.tags) as string[]).slice(0, 3),
    open: s.open,
    hours: (JSON.parse(s.hours) as { day: string; time: string }[])[0]?.time ?? "",
    verified: s.verified,
  }));

  return (
    <section id="listings" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F9EBE8] rounded-full px-3 py-1 mb-3">
              <Store size={13} className="text-[#E8705A]" />
              <span className="text-xs font-600 text-[#E8705A] uppercase tracking-wider">
                Flower Shop Directory
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-700 tracking-tight text-[#1A1A1A]">
              Trusted Shops <span className="text-[#E8705A]">Near You</span>
            </h2>
            <p className="text-[#6B6B6B] mt-2 max-w-sm">
              Verified local flower shops with real reviews from our community.
            </p>
          </div>
          <a
            href="/listings"
            className="hidden md:inline-flex items-center gap-2 text-sm font-500 text-[#E8705A] hover:gap-3 transition-all"
          >
            All Listings <ArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {shops.map((shop) => (
            <a
              key={shop.id}
              href={`/listings/${shop.slug}`}
              className="group card-lift bg-[#FAFAF8] rounded-3xl overflow-hidden border border-[#E8E4DF] cursor-pointer"
            >
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden">
                {shop.image ? (
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F9EBE8] flex items-center justify-center">
                    <Store size={32} className="text-[#E8705A]/40" />
                  </div>
                )}
                {/* Open/Closed badge */}
                <div
                  className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-600 ${
                    shop.open ? "bg-[#EDF5EE] text-[#7A9E7E]" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      shop.open ? "bg-[#7A9E7E]" : "bg-gray-400"
                    }`}
                  />
                  {shop.open ? "Open Now" : "Closed"}
                </div>
                {shop.verified && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-[#7A9E7E] fill-[#EDF5EE]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-600 text-[#1A1A1A] text-sm mb-1 group-hover:text-[#E8705A] transition-colors">
                  {shop.name}
                </h3>

                <div className="flex items-center gap-1 text-[#6B6B6B] text-xs mb-3">
                  <MapPin size={11} />
                  <span className="line-clamp-1">{shop.address}, {shop.city}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-600 text-[#1A1A1A]">{shop.rating}</span>
                  <span className="text-xs text-[#6B6B6B]">({shop.reviews.toLocaleString()} reviews)</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {shop.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#F9EBE8] text-[#E8705A] text-[10px] font-500 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hours */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DF]">
                  <div className="flex items-center gap-1 text-[#6B6B6B] text-xs">
                    <Clock size={11} />
                    <span>{shop.hours}</span>
                  </div>
                  <span className="text-xs font-600 text-[#E8705A]">View →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* List your shop CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#FAFAF8] to-[#F9EBE8] border border-[#E8E4DF] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-700 text-[#1A1A1A] mb-1">Own a flower shop?</h3>
            <p className="text-[#6B6B6B] text-sm">
              List your shop for free and reach thousands of flower lovers in your city.
            </p>
          </div>
          <a
            href="/listings/create"
            className="shrink-0 inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white font-600 px-6 py-3 rounded-2xl transition-colors group"
          >
            List Your Shop
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
