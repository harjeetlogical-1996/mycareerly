"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Store, Flower2, MapPin, Building2, Loader2, X } from "lucide-react";

type Hit = {
  type: "article" | "listing" | "flower" | "city" | "state";
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  meta?: string;
};

type SearchResult = {
  query: string;
  articles: Hit[];
  listings: Hit[];
  flowers: Hit[];
  cities: Hit[];
  states: Hit[];
  total: number;
};

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Articles", value: "articles" },
  { label: "Florists", value: "listings" },
  { label: "Cities", value: "cities" },
  { label: "States", value: "states" },
  { label: "Flowers A–Z", value: "flowers" },
];

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  article: BookOpen,
  listing: Store,
  flower: Flower2,
  city: MapPin,
  state: Building2,
};

const TYPE_LABEL: Record<string, string> = {
  article: "Article",
  listing: "Florist",
  flower: "Flower",
  city: "City",
  state: "State",
};

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const initialType = params.get("type") ?? "all";

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (query: string, filter: string) => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${filter}&limit=20`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when initial URL params change
  useEffect(() => {
    if (initialQ) runSearch(initialQ, initialType);
  }, [initialQ, initialType, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q)}&type=${type}`);
  };

  const switchType = (newType: string) => {
    setType(newType);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}&type=${newType}`);
  };

  const allResults: Hit[] = results
    ? [...results.listings, ...results.articles, ...results.cities, ...results.states, ...results.flowers]
    : [];

  const getFiltered = (): Hit[] => {
    if (!results) return [];
    switch (type) {
      case "articles": return results.articles;
      case "listings": return results.listings;
      case "cities":   return results.cities;
      case "states":   return results.states;
      case "flowers":  return results.flowers;
      default:         return allResults;
    }
  };

  const filtered = getFiltered();

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      {/* Search bar */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">
          Search MyCareerly
        </h1>
        <form onSubmit={handleSubmit} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search flowers, florists, cities, or guides..."
            className="w-full bg-white border border-[#E8E4DF] rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); setResults(null); router.push("/search"); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#1A1A1A]"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      {/* Filter tabs */}
      {results && results.total > 0 && (
        <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-2xl p-1 mb-6 w-fit overflow-x-auto">
          {TYPE_FILTERS.map((f) => {
            const count = f.value === "all"
              ? results.total
              : f.value === "articles" ? results.articles.length
              : f.value === "listings" ? results.listings.length
              : f.value === "cities"   ? results.cities.length
              : f.value === "states"   ? results.states.length
              : f.value === "flowers"  ? results.flowers.length
              : 0;
            const active = type === f.value;
            return (
              <button
                key={f.value}
                onClick={() => switchType(f.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-[#E8705A] text-white"
                    : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 text-xs ${active ? "opacity-90" : "opacity-60"}`}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-[#E8705A] animate-spin" />
        </div>
      )}

      {!loading && results && results.total === 0 && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl py-16 px-8 text-center">
          <Search size={32} className="text-[#E8E4DF] mx-auto mb-3" />
          <p className="font-bold text-[#1A1A1A] mb-1">No results for "{q}"</p>
          <p className="text-sm text-[#6B6B6B]">Try different keywords or check your spelling.</p>
        </div>
      )}

      {!loading && results && filtered.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B6B6B] mb-2">
            Showing <strong className="text-[#1A1A1A]">{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""} for{" "}
            <strong className="text-[#1A1A1A]">"{results.query}"</strong>
          </p>
          {filtered.map((hit, i) => {
            const Icon = TYPE_ICON[hit.type];
            return (
              <Link
                key={`${hit.type}-${i}`}
                href={hit.url}
                className="flex gap-4 bg-white border border-[#E8E4DF] rounded-2xl p-4 hover:border-[#E8705A] hover:shadow-sm transition-all"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#F9EBE8] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {hit.image ? (
                    <Image
                      src={hit.image}
                      alt={hit.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <Icon size={28} className="text-[#E8705A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8705A] bg-[#F9EBE8] px-2 py-0.5 rounded-full">
                      {TYPE_LABEL[hit.type]}
                    </span>
                    {hit.meta && <span className="text-[11px] text-[#9A9A9A]">{hit.meta}</span>}
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] text-base line-clamp-1 mb-0.5">{hit.title}</h3>
                  {hit.excerpt && <p className="text-sm text-[#6B6B6B] line-clamp-2 leading-relaxed">{hit.excerpt}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !results && !q && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-8 text-center">
          <Search size={32} className="text-[#E8E4DF] mx-auto mb-3" />
          <p className="font-bold text-[#1A1A1A] mb-1">Start typing to search</p>
          <p className="text-sm text-[#6B6B6B] mb-5">
            Search across articles, florists, cities, states, and 1,900+ flower names.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {["roses", "wedding flowers", "peonies", "Los Angeles", "Texas"].map((s) => (
              <button
                key={s}
                onClick={() => { setQ(s); router.push(`/search?q=${encodeURIComponent(s)}`); }}
                className="px-3 py-1.5 rounded-full border border-[#E8E4DF] bg-white text-[#4A4A4A] hover:border-[#E8705A] hover:text-[#E8705A] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
