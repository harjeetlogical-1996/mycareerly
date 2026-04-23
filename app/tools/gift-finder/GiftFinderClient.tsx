"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check, Sparkles, Flower2, Star, MapPin, Truck, Heart, RefreshCw, Share2, Info } from "lucide-react";
import {
  RECIPIENTS, OCCASIONS, BUDGETS, recommendFlowers,
  type Recipient, type Occasion, type Budget,
} from "../../data/gift-flowers";

type Shop = {
  id: string; name: string; city: string; state: string;
  rating: number; reviewCount: number; image: string;
  tagline: string; sponsored: boolean; featured: boolean;
};

export default function GiftFinderClient({ shops }: { shops: Shop[] }) {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [showResult, setShowResult] = useState(false);

  const recommendations = (recipient && occasion && budget)
    ? recommendFlowers(recipient, occasion, budget)
    : [];

  const reset = () => {
    setStep(1);
    setRecipient(null);
    setOccasion(null);
    setBudget(null);
    setShowResult(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/tools/gift-finder?r=${recipient}&o=${occasion}&b=${budget}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Flower Gift Finder", text: "I found the perfect flowers!", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  // ── RESULT VIEW ──────────────────────────────────────────────────────────
  if (showResult && recommendations.length > 0) {
    const recipientLabel = RECIPIENTS.find((r) => r.value === recipient)?.label ?? "";
    const occasionLabel = OCCASIONS.find((o) => o.value === occasion)?.label ?? "";

    return (
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={11} /> Personalized for you
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2 leading-tight">
            Top 3 flowers for <span className="text-[#E8705A]">{recipientLabel}</span>
          </h1>
          <p className="text-base text-[#6B6B6B]">
            For <strong>{occasionLabel}</strong> · Budget <strong>${budget}+</strong>
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] border border-[#E8E4DF] px-3 py-1.5 rounded-lg">
              <RefreshCw size={11} /> Start over
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-xs text-white bg-[#E8705A] hover:bg-[#C95540] px-3 py-1.5 rounded-lg">
              <Share2 size={11} /> Share result
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-5 mb-10">
          {recommendations.map((flower, i) => (
            <div key={flower.name} className="bg-white border border-[#E8E4DF] rounded-3xl overflow-hidden hover:border-[#E8705A]/40 transition-all">
              <div className="grid sm:grid-cols-[180px_1fr]">
                {/* Color swatch / number */}
                <div
                  className="h-32 sm:h-auto flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${flower.color}, ${flower.color}dd)` }}
                >
                  <div className="text-center text-white">
                    <p className="text-6xl font-bold">#{i + 1}</p>
                    <Flower2 size={20} className="mx-auto mt-2 opacity-70" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A1A1A]">{flower.name}</h3>
                      <p className="text-sm font-semibold text-[#E8705A] italic">{flower.meaning}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#FAFAF8] text-[#6B6B6B] px-2 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Vase life: {flower.vaseLife}
                    </span>
                  </div>

                  <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">{flower.why}</p>

                  <div className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-xl p-3 flex items-start gap-2">
                    <Info size={13} className="text-[#E8705A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#E8705A]">Care Tip</p>
                      <p className="text-xs text-[#4A4A4A] leading-relaxed">{flower.careTip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nearby shops */}
        {shops.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Where to order</h2>
                <p className="text-sm text-[#6B6B6B]">Verified florists with delivery</p>
              </div>
              <Link href="/listings" className="text-sm font-semibold text-[#E8705A] hover:underline">All florists →</Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.slice(0, 3).map((shop) => (
                <Link
                  key={shop.id}
                  href={`/listings/${shop.id}`}
                  className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden hover:border-[#E8705A] hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative h-36 bg-[#F4F3F0]">
                    {shop.image && (
                      <Image
                        src={shop.image}
                        alt={shop.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                    {shop.sponsored && (
                      <span className="absolute top-2 left-2 bg-[#E8705A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1A1A1A] text-sm mb-0.5 line-clamp-1">{shop.name}</h3>
                    <p className="text-xs text-[#6B6B6B] mb-2 flex items-center gap-1">
                      <MapPin size={10} /> {shop.city}, {shop.state}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-[#1A1A1A]">{shop.rating}</span>
                        <span className="text-[#9A9A9A]">({shop.reviewCount})</span>
                      </div>
                      <span className="text-[#7A9E7E] font-semibold inline-flex items-center gap-1">
                        <Truck size={10} /> Delivery
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-3xl p-8 text-center">
          <Heart size={28} className="text-[#E8705A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Need different recommendations?</h2>
          <p className="text-sm text-[#6B6B6B] mb-5">Try the quiz again with different choices, or explore more tools.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={reset} className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              <RefreshCw size={13} /> Run quiz again
            </button>
            <Link href="/tools" className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] font-semibold px-5 py-2.5 rounded-xl text-sm">
              All tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={11} /> Free · 30-second quiz
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
          Find the Perfect <span className="text-[#E8705A]">Flower Gift</span>
        </h1>
        <p className="text-base text-[#4A4A4A] max-w-xl mx-auto leading-relaxed">
          Three quick questions. We'll recommend 3 flowers + nearby florists + care tips — perfectly matched to your gift.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              n < step ? "bg-[#7A9E7E] text-white"
              : n === step ? "bg-[#E8705A] text-white shadow-md"
              : "bg-[#E8E4DF] text-[#9A9A9A]"
            }`}>
              {n < step ? <Check size={14} /> : n}
            </div>
            {n < 3 && <div className={`w-12 h-0.5 ${n < step ? "bg-[#7A9E7E]" : "bg-[#E8E4DF]"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">

        {step === 1 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A] mb-2">Step 1 of 3</p>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Who's it for?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {RECIPIENTS.map((r) => {
                const active = recipient === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRecipient(r.value);
                      setTimeout(() => setStep(2), 300);
                    }}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
                      active ? "border-[#E8705A] bg-[#FEF0ED]" : "border-[#E8E4DF] hover:border-[#E8705A]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{r.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-[#1A1A1A] mb-0.5">{r.label}</p>
                        <p className="text-xs text-[#6B6B6B]">{r.desc}</p>
                      </div>
                      {active && <Check size={18} className="text-[#E8705A] mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A] mb-2">Step 2 of 3</p>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">What's the occasion?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {OCCASIONS.map((o) => {
                const active = occasion === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => {
                      setOccasion(o.value);
                      setTimeout(() => setStep(3), 300);
                    }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      active ? "border-[#E8705A] bg-[#FEF0ED]" : "border-[#E8E4DF] hover:border-[#E8705A]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{o.emoji}</span>
                      <p className="font-bold text-[#1A1A1A] flex-1">{o.label}</p>
                      {active && <Check size={16} className="text-[#E8705A]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A] mb-2">Step 3 of 3</p>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">What's your budget?</h2>
            <div className="space-y-3">
              {BUDGETS.map((b) => {
                const active = budget === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => {
                      setBudget(b.value);
                      setTimeout(() => setShowResult(true), 400);
                    }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      active ? "border-[#E8705A] bg-[#FEF0ED]" : "border-[#E8E4DF] hover:border-[#E8705A]/40"
                    }`}
                  >
                    <div className="w-14 h-14 bg-[#F9EBE8] rounded-2xl flex items-center justify-center text-xl font-bold text-[#E8705A] shrink-0">
                      ${b.value}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1A1A1A] text-lg">{b.label}</p>
                      <p className="text-sm text-[#6B6B6B]">{b.desc}</p>
                    </div>
                    {active && <Check size={20} className="text-[#E8705A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Back button */}
        {step > 1 && (
          <div className="mt-6 pt-5 border-t border-[#E8E4DF]">
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A]"
            >
              <ChevronLeft size={14} /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
