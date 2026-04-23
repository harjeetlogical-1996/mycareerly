"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Clock, ArrowRight, X } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  "Care Guide": "#7A9E7E",
  "Seasonal": "#E8705A",
  "DIY": "#C95540",
  "Wedding": "#C95540",
  "Gifting": "#E8705A",
  "Expert Tips": "#7A9E7E",
  "Stories": "#7A9E7E",
};

type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  readTime: string;
  publishedAt: string;
  featured: boolean;
};

export default function ArticlesClient({
  articles,
  categories,
}: {
  articles: ArticleCard[];
  categories: string[];
}) {
  const urlParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Pre-fill filter from URL (?category=Care+Guide or ?q=roses)
  useEffect(() => {
    const catParam = urlParams.get("category");
    const q = urlParams.get("q") ?? urlParams.get("search");
    if (catParam) setCategory(catParam);
    if (q) setSearch(q);
  }, [urlParams]);

  const featured = articles.find((a) => a.featured) ?? articles[0];

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "All" || a.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, articles]);

  const tagColor = (cat: string) => TAG_COLORS[cat] || "#E8705A";
  const tagBg = (cat: string) => tagColor(cat) === "#7A9E7E" ? "#EDF5EE" : "#FEF0ED";

  return (
    <main className="min-h-screen bg-[#FAFAF8] pt-16">
      {/* Page header */}
      <section className="bg-white border-b border-[#E8E4DF] py-12 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#EDF5EE] rounded-full px-3 py-1 mb-3">
              <BookOpen size={13} className="text-[#7A9E7E]" />
              <span className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-wider">Floristry Knowledge</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Flower{" "}
              <span style={{ background: "linear-gradient(135deg,#E8705A,#C95540)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Articles
              </span>
              <br />& Guides
            </h1>
            <p className="text-[#6B6B6B] mt-2">{articles.length} expert articles on flowers, care, and more</p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl px-4 py-3 focus-within:border-[#E8705A] focus-within:ring-2 focus-within:ring-[#E8705A]/10 transition-all max-w-xl">
            <Search size={18} className="text-[#6B6B6B] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, tips, flower types..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-[#B0A9A4]"
            />
            {search && <button onClick={() => setSearch("")}><X size={14} className="text-[#6B6B6B]" /></button>}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-[#E8705A] text-white"
                    : "bg-white border border-[#E8E4DF] text-[#6B6B6B] hover:border-[#E8705A] hover:text-[#E8705A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Featured article */}
        {category === "All" && !search && featured && (
          <div className="mb-12">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-4">Featured Article</p>
            <Link
              href={`/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-[#E8E4DF] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-64 md:h-auto overflow-hidden">
                <Image src={featured.coverImage} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                <div className="absolute top-4 left-4">
                  <span className="pill text-white text-[10px]" style={{ background: tagColor(featured.category) }}>
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-3">Editor&apos;s Pick</span>
                <h2 className="text-2xl font-bold text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#E8705A] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#6B6B6B] text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#F9EBE8] rounded-full flex items-center justify-center text-xs font-bold text-[#E8705A]">
                      {featured.authorName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{featured.authorName}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{featured.publishedAt}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                    <Clock size={11} /> {featured.readTime}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E8705A] group-hover:gap-2 transition-all">
                  Read Article <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#6B6B6B]">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {category !== "All" && <span> in <span className="font-semibold text-[#1A1A1A]">{category}</span></span>}
            {search && <span> for &quot;<span className="font-semibold text-[#1A1A1A]">{search}</span>&quot;</span>}
          </p>
        </div>

        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="text-[#E8E4DF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No articles found</h3>
            <p className="text-[#6B6B6B] text-sm">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/${article.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-[#E8E4DF] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="pill text-white text-[10px]" style={{ background: tagColor(article.category) }}>
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#1A1A1A] leading-snug mb-2 group-hover:text-[#E8705A] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: tagBg(article.category), color: tagColor(article.category) }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DF]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#F9EBE8] rounded-full flex items-center justify-center text-[10px] font-bold text-[#E8705A]">
                        {article.authorName[0]}
                      </div>
                      <span className="text-xs font-medium text-[#1A1A1A]">{article.authorName}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                      <Clock size={10} /> {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
