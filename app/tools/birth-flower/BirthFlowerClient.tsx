"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Flower2, Share2, ChevronRight, Gift, Sparkles } from "lucide-react";
import { BIRTH_FLOWERS } from "../../data/tools-data";

const MONTHS = BIRTH_FLOWERS.map((b) => b.monthName);

export default function BirthFlowerClient() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedData = selectedMonth !== null ? BIRTH_FLOWERS[selectedMonth - 1] : null;

  const handleDateChange = (value: string) => {
    setBirthDate(value);
    if (value) {
      const m = new Date(value + "T00:00:00").getMonth() + 1;
      setSelectedMonth(m);
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleShare = async () => {
    if (!selectedData) return;
    const url = `${window.location.origin}/tools/birth-flower?month=${selectedData.month}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My birth flower is ${selectedData.primary.name}!`,
          text: `${selectedData.monthName} birth flower: ${selectedData.primary.name} — ${selectedData.primary.meaning}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={11} /> Free Interactive Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
          What's Your <span className="text-[#E8705A]">Birth Flower</span>?
        </h1>
        <p className="text-base text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
          Just like a birthstone, your birth month has its own flower with unique meaning and history. Enter your birthday or pick a month below.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Enter your birthday
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              type="date"
              value={birthDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#E8E4DF]" />
          <span className="text-xs text-[#9A9A9A] font-medium">OR PICK A MONTH</span>
          <div className="flex-1 h-px bg-[#E8E4DF]" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {MONTHS.map((m, i) => {
            const active = selectedMonth === i + 1;
            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(i + 1);
                  setBirthDate("");
                  setTimeout(() => {
                    document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#E8705A] text-white shadow-md"
                    : "bg-[#FAFAF8] border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#E8705A] hover:text-[#E8705A]"
                }`}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result */}
      {selectedData && (
        <div id="result" className="space-y-5 scroll-mt-24">
          {/* Primary */}
          <div className="bg-white border-2 border-[#E8705A]/30 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#F9EBE8] to-[#FEF0ED] px-6 py-4 border-b border-[#E8E4DF]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A]">Primary Birth Flower · {selectedData.monthName}</p>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-5 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: selectedData.primary.color + "30" }}
                >
                  <Flower2 size={28} style={{ color: selectedData.primary.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-[#1A1A1A] mb-1">{selectedData.primary.name}</h2>
                  <p className="text-sm font-semibold text-[#E8705A]">{selectedData.primary.meaning}</p>
                </div>
              </div>
              <p className="text-[#4A4A4A] leading-relaxed text-[0.95rem]">{selectedData.primary.description}</p>
            </div>
          </div>

          {/* Secondary */}
          <div className="bg-white border border-[#E8E4DF] rounded-3xl overflow-hidden">
            <div className="bg-[#FAFAF8] px-6 py-3 border-b border-[#E8E4DF]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Alternative Birth Flower</p>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: selectedData.secondary.color + "30" }}
                >
                  <Flower2 size={20} style={{ color: selectedData.secondary.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{selectedData.secondary.name}</h3>
                  <p className="text-xs font-semibold text-[#E8705A]">{selectedData.secondary.meaning}</p>
                </div>
              </div>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">{selectedData.secondary.description}</p>
            </div>
          </div>

          {/* Share + CTAs */}
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[#1A1A1A] text-sm">Share your result</p>
              <p className="text-xs text-[#6B6B6B]">Copy link or share with friends</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Share2 size={13} /> {copied ? "Copied!" : "Share"}
              </button>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Gift size={13} /> Find a florist
              </Link>
            </div>
          </div>

          {/* Related */}
          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            <Link
              href="/birth-month-flowers-meanings-symbolism-for-every-month"
              className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">Related Article</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">All 12 Birth Flowers & Their Meanings</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Read guide <ChevronRight size={11} /></p>
            </Link>
            <Link
              href="/tools/flower-meaning"
              className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">More Tools</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">Flower Meaning Translator</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Try tool <ChevronRight size={11} /></p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
