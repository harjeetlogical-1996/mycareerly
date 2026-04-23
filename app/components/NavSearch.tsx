"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, BookOpen, Store, Flower2, MapPin, Building2 } from "lucide-react";

type Hit = {
  type: "article" | "listing" | "flower" | "city" | "state";
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  meta?: string;
};

type SearchResult = {
  articles: Hit[];
  listings: Hit[];
  flowers: Hit[];
  cities: Hit[];
  states: Hit[];
  total: number;
};

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  article: BookOpen,
  listing: Store,
  flower: Flower2,
  city: MapPin,
  state: Building2,
};

export default function NavSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(mobile);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=4`);
        const data = await res.json();
        setResults(data);
        setActiveIdx(-1);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    if (mobile) return;
    const fn = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [mobile]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const allHits: Hit[] = results
    ? [...results.listings, ...results.articles, ...results.cities, ...results.states, ...results.flowers].slice(0, 12)
    : [];

  const submit = () => {
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allHits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && allHits[activeIdx]) {
        router.push(allHits[activeIdx].url);
        setOpen(false);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      if (q) setQ("");
      else setOpen(false);
    }
  };

  if (mobile) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#F9EBE8] rounded-2xl">
          <Search size={16} className="text-[#E8705A] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search flowers, florists..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-[#C5A89F]"
          />
          {loading && <Loader2 size={14} className="text-[#E8705A] animate-spin" />}
        </div>

        {results && allHits.length > 0 && (
          <div className="mt-2 bg-white border border-[#E8E4DF] rounded-2xl shadow-lg overflow-hidden max-h-[50vh] overflow-y-auto">
            {allHits.slice(0, 6).map((hit, i) => {
              const Icon = TYPE_ICON[hit.type];
              return (
                <Link
                  key={`${hit.type}-${i}`}
                  href={hit.url}
                  onClick={() => { setOpen(false); setQ(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#FEF0ED] transition-colors border-b border-[#E8E4DF] last:border-0"
                >
                  <Icon size={14} className="text-[#E8705A] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">{hit.title}</p>
                    {hit.meta && <p className="text-[10px] text-[#9A9A9A]">{hit.meta}</p>}
                  </div>
                </Link>
              );
            })}
            <button
              onClick={submit}
              className="w-full py-3 text-sm font-semibold text-[#E8705A] hover:bg-[#FEF0ED] transition-colors"
            >
              See all {results.total} results →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={panelRef} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-[#F9EBE8] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      ) : (
        <div className="hidden md:flex items-center gap-2 bg-white border border-[#E8E4DF] rounded-xl px-3 py-1.5 focus-within:border-[#E8705A] focus-within:ring-2 focus-within:ring-[#E8705A]/10 transition-all w-72">
          <Search size={16} className="text-[#9A9A9A] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search flowers, florists, cities..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-[#B0A9A4]"
          />
          {loading && <Loader2 size={14} className="text-[#E8705A] animate-spin shrink-0" />}
          {q && !loading && (
            <button onClick={() => setQ("")} className="text-[#9A9A9A] hover:text-[#1A1A1A] shrink-0">
              <X size={14} />
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-[#9A9A9A] hover:text-[#1A1A1A] shrink-0 ml-1" aria-label="Close">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Dropdown results */}
      {open && results && allHits.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-[420px] max-w-[90vw] bg-white border border-[#E8E4DF] rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="max-h-[420px] overflow-y-auto">
            {allHits.map((hit, i) => {
              const Icon = TYPE_ICON[hit.type];
              const active = i === activeIdx;
              return (
                <Link
                  key={`${hit.type}-${i}`}
                  href={hit.url}
                  onClick={() => { setOpen(false); setQ(""); }}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#E8E4DF] last:border-0 transition-colors ${
                    active ? "bg-[#FEF0ED]" : "hover:bg-[#FAFAF8]"
                  }`}
                >
                  <div className="relative w-10 h-10 bg-[#F9EBE8] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {hit.image ? (
                      <Image src={hit.image} alt={hit.title} fill sizes="40px" className="object-cover" />
                    ) : (
                      <Icon size={16} className="text-[#E8705A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">{hit.title}</p>
                    {hit.meta && <p className="text-[10px] text-[#9A9A9A] mt-0.5">{hit.meta}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
          <button
            onClick={submit}
            className="w-full py-3 text-sm font-semibold text-[#E8705A] hover:bg-[#FEF0ED] border-t border-[#E8E4DF] transition-colors"
          >
            See all {results.total} results →
          </button>
        </div>
      )}

      {open && q.length >= 2 && results && allHits.length === 0 && !loading && (
        <div className="absolute top-full right-0 mt-2 w-[420px] max-w-[90vw] bg-white border border-[#E8E4DF] rounded-2xl shadow-xl p-6 z-50 text-center">
          <p className="text-sm text-[#6B6B6B]">No results for "<span className="font-semibold text-[#1A1A1A]">{q}</span>"</p>
          <p className="text-xs text-[#9A9A9A] mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
}
