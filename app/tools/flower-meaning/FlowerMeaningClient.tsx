"use client";

import { useState } from "react";
import Link from "next/link";
import { Flower2, Search, ChevronRight, Sparkles, Crown, Landmark } from "lucide-react";
import { FLOWER_MEANINGS } from "../../data/tools-data";

const CULTURE_INFO: { key: keyof typeof FLOWER_MEANINGS[number]; label: string; emoji: string; tag: string }[] = [
  { key: "victorian", label: "Victorian England", emoji: "🌹", tag: "19th century floriography — the secret language of flowers" },
  { key: "japanese",  label: "Japanese (Hanakotoba)", emoji: "🌸", tag: "Flower symbolism in traditional Japanese culture" },
  { key: "chinese",   label: "Chinese Tradition",    emoji: "🏮", tag: "Classical Chinese flower symbolism and art" },
  { key: "greek",     label: "Greek Mythology",      emoji: "🏛️", tag: "Ancient Greek associations with gods and myths" },
  { key: "christian", label: "Christian Symbolism",  emoji: "✝️", tag: "Religious meanings in Christian art and tradition" },
];

export default function FlowerMeaningClient() {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  const filtered = query.length > 0
    ? FLOWER_MEANINGS.map((f, i) => ({ f, i })).filter((x) => x.f.name.toLowerCase().includes(query.toLowerCase()))
    : FLOWER_MEANINGS.map((f, i) => ({ f, i }));

  const selected = selectedIdx !== null ? FLOWER_MEANINGS[selectedIdx] : null;

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={11} /> Free Interactive Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
          Flower Meaning <span className="text-[#E8705A]">Translator</span>
        </h1>
        <p className="text-base text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
          Pick a flower and discover its meaning across five major cultural traditions — Victorian, Japanese, Chinese, Greek, and Christian.
        </p>
      </div>

      {/* Flower selector */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-8">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a flower..."
            className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
          {filtered.map(({ f, i }) => {
            const active = selectedIdx === i;
            return (
              <button
                key={f.name}
                onClick={() => {
                  setSelectedIdx(i);
                  setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? "bg-[#E8705A] text-white shadow-md"
                    : "bg-[#FAFAF8] border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#E8705A] hover:text-[#E8705A]"
                }`}
              >
                <Flower2 size={12} className="shrink-0" /> {f.name}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-sm text-[#9A9A9A]">
              No flowers match "{query}"
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {selected && (
        <div id="result" className="space-y-4 scroll-mt-24">

          {/* Headline */}
          <div className="bg-white border-2 border-[#E8705A]/30 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#F9EBE8] to-[#FEF0ED] px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Flower2 size={26} className="text-[#E8705A]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A]">Symbolism Across Cultures</p>
                <h2 className="text-3xl font-bold text-[#1A1A1A]">{selected.name}</h2>
              </div>
            </div>
          </div>

          {/* Cultural meanings */}
          <div className="space-y-3">
            {CULTURE_INFO.map((c) => (
              <div key={c.key} className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
                <div className="bg-[#FAFAF8] px-5 py-3 border-b border-[#E8E4DF] flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className="font-bold text-[#1A1A1A] text-sm">{c.label}</p>
                    <p className="text-[11px] text-[#9A9A9A]">{c.tag}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">
                    {selected[c.key as keyof typeof selected] as string}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="grid sm:grid-cols-2 gap-3 mt-8">
            <Link
              href="/the-language-of-flowers-victorian-flower-symbolism-guide"
              className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">Deep Dive</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">Victorian Flower Language Guide</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Read article <ChevronRight size={11} /></p>
            </Link>
            <Link
              href="/tools/birth-flower"
              className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">More Tools</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">Birth Flower Finder</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Try tool <ChevronRight size={11} /></p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
