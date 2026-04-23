import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { prisma } from "../lib/prisma";

const TAG_COLOR: Record<string, { color: string; bg: string }> = {
  "Care Guide":  { color: "#7A9E7E", bg: "#EDF5EE" },
  "Seasonal":    { color: "#E8705A", bg: "#FEF0ED" },
  "DIY":         { color: "#C95540", bg: "#FEF0ED" },
  "Wedding":     { color: "#C95540", bg: "#FEF0ED" },
  "Gifting":     { color: "#E8705A", bg: "#FEF0ED" },
  "Expert Tips": { color: "#7A9E7E", bg: "#EDF5EE" },
  "Stories":     { color: "#7A9E7E", bg: "#EDF5EE" },
};

// Deterministic time-seeded shuffle — rotates every 3 hours
// so different articles feature across the day without looking random
function hourlyShuffle<T>(arr: T[]): T[] {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 3)); // 3-hour buckets
  const copy = [...arr];
  // Simple seeded Fisher-Yates (mulberry32 pRNG)
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

export default async function Articles() {
  // Fetch a larger pool so shuffle has variety
  const pool = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      authorName: true,
      publishedAt: true,
      readTime: true,
      featured: true,
    },
  });

  if (pool.length === 0) return null;

  // Prefer featured articles in the shuffle pool — rotate them deterministically
  const featuredPool = pool.filter((a) => a.featured);
  const regularPool  = pool.filter((a) => !a.featured);

  // Shuffle each pool by current time seed so the set rotates every 3 hours
  const shuffledFeatured = hourlyShuffle(featuredPool);
  const shuffledRegular  = hourlyShuffle(regularPool);

  // Compose: 1 featured (hero) + 2 from mixed pool
  const featured = shuffledFeatured[0] ?? shuffledRegular[0];
  const rest = [...shuffledFeatured.slice(1), ...shuffledRegular]
    .filter((a) => a.id !== featured.id)
    .slice(0, 2);

  const tc = (cat: string) => TAG_COLOR[cat] ?? { color: "#E8705A", bg: "#FEF0ED" };

  return (
    <section id="articles" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EDF5EE] rounded-full px-3 py-1 mb-3">
              <BookOpen size={13} className="text-[#7A9E7E]" />
              <span className="text-xs font-600 text-[#7A9E7E] uppercase tracking-wider">
                Articles
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-700 tracking-tight text-[#1A1A1A]">
              Floristry <span className="text-[#E8705A]">Knowledge</span>
            </h2>
            <p className="text-[#6B6B6B] mt-2 max-w-sm">
              Expert tips, care guides, and seasonal stories for flower lovers.
            </p>
          </div>
          <a
            href="/articles"
            className="hidden md:inline-flex items-center gap-2 text-sm font-500 text-[#E8705A] hover:gap-3 transition-all"
          >
            All Articles <ArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured article */}
          <a
            href={`/${featured.slug}`}
            className="lg:col-span-3 group card-lift bg-[#FAFAF8] rounded-3xl overflow-hidden border border-[#E8E4DF] cursor-pointer"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span
                  className="pill"
                  style={{ background: tc(featured.category).bg, color: tc(featured.category).color }}
                >
                  {featured.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-700 leading-snug text-[#1A1A1A] mb-3 group-hover:text-[#E8705A] transition-colors line-clamp-2">
                {featured.title}
              </h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed line-clamp-3 mb-4">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E4DF]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#F9EBE8] rounded-full flex items-center justify-center text-xs font-600 text-[#E8705A]">
                    {featured.authorName[0]}
                  </div>
                  <span className="text-xs font-500 text-[#1A1A1A]">{featured.authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B6B6B] text-xs">
                  <span>{featured.publishedAt}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {featured.readTime}
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {rest.map((article) => (
              <a
                key={article.id}
                href={`/${article.slug}`}
                className="group card-lift bg-[#FAFAF8] rounded-3xl overflow-hidden border border-[#E8E4DF] flex cursor-pointer"
              >
                <div className="relative w-36 shrink-0 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <span
                      className="pill mb-2"
                      style={{ background: tc(article.category).bg, color: tc(article.category).color }}
                    >
                      {article.category}
                    </span>
                    <h3 className="text-sm font-600 leading-snug text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors line-clamp-2 mt-1">
                      {article.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[#6B6B6B] text-xs mt-3">
                    <Clock size={11} />
                    <span>{article.readTime}</span>
                    <span className="ml-auto">{article.publishedAt}</span>
                  </div>
                </div>
              </a>
            ))}

            {/* CTA card */}
            <div className="bg-gradient-to-br from-[#E8705A] to-[#C95540] rounded-3xl p-6 text-white">
              <p className="text-xs font-600 uppercase tracking-wider mb-2 opacity-80">
                Write for us
              </p>
              <h3 className="text-lg font-700 mb-3 leading-snug">
                Share your flower stories with our community
              </h3>
              <a
                href="/articles/write"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-500 px-4 py-2 rounded-xl transition-colors"
              >
                Submit Article <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <a
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-500 text-[#E8705A]"
          >
            See All Articles <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
