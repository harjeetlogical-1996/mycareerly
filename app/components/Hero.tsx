"use client";

import { ArrowRight, MapPin, Star, BookOpen } from "lucide-react";

const stats = [
  { value: "200+", label: "Verified Shops" },
  { value: "50+", label: "US Cities" },
  { value: "50K+", label: "Monthly Visitors" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAF8] pt-16">
      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#F9EBE8] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#B8D4BB]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F9EBE8] border border-[#E8705A]/20 rounded-full px-4 py-1.5 mb-6">
              <MapPin size={14} className="text-[#E8705A]" />
              <span className="text-xs font-600 text-[#E8705A] uppercase tracking-wider">
                America's Flower Shop Directory
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-800 leading-[1.05] tracking-tight mb-6">
              Find the Best{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#E8705A,#C95540)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Flower Shops
              </span>{" "}
              Near You
            </h1>

            <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-md mb-8">
              America's flower shop directory — discover verified local florists near you, read expert flower guides, and find the perfect bloom for any occasion.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-12">
              <a
                href="/listings"
                className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-600 px-7 py-3.5 rounded-2xl transition-all duration-200 hover:shadow-[0_8px_30px_rgba(232,112,90,0.4)] group"
              >
                Find a Shop
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/articles"
                className="inline-flex items-center gap-2 bg-white border border-[#E8E4DF] text-[#1A1A1A] font-500 px-7 py-3.5 rounded-2xl hover:border-[#E8705A] hover:text-[#E8705A] transition-all duration-200"
              >
                <BookOpen size={16} />
                Flower Guides
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-700 text-[#1A1A1A]">{s.value}</p>
                  <p className="text-xs text-[#6B6B6B] font-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card */}
          <div className="relative h-[520px] hidden lg:block">
            {/* Main card */}
            <div className="absolute inset-8 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
                src="/images/articles/article-7-popular-flowers.jpg"
                alt="Fresh flowers at a local flower shop"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Overlay badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8705A] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-[#1A1A1A]">200+ Verified Shops</p>
                    <p className="text-xs text-[#6B6B6B]">Across New York, Chicago, LA and more</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating info cards — right side only, no overlap with content */}
            <div className="absolute top-4 -right-4 bg-white shadow-lg rounded-2xl p-3 flex items-center gap-2 z-10">
              <div className="w-10 h-10 bg-[#EDF5EE] rounded-xl flex items-center justify-center">
                <Star size={18} className="text-[#7A9E7E] fill-[#7A9E7E]" />
              </div>
              <div>
                <p className="text-xs font-600 text-[#1A1A1A]">Top Rated</p>
                <p className="text-xs text-[#7A9E7E] font-500">4.9 avg rating</p>
              </div>
            </div>

            <div className="absolute bottom-10 -right-2 bg-white shadow-lg rounded-2xl p-3 flex items-center gap-2 z-10">
              <div className="w-8 h-8 bg-[#F9EBE8] rounded-xl flex items-center justify-center">
                <MapPin size={14} className="text-[#E8705A]" />
              </div>
              <div>
                <p className="text-xs font-600 text-[#1A1A1A]">Near You</p>
                <p className="text-xs text-[#E8705A] font-500">50+ US cities</p>
              </div>
            </div>

            {/* Decorative rings */}
            <div className="absolute -top-6 right-10 w-20 h-20 rounded-full border-2 border-dashed border-[#E8705A]/30 animate-spin" style={{ animationDuration: "12s" }} />
            <div className="absolute bottom-16 -left-6 w-12 h-12 rounded-full border-2 border-dashed border-[#7A9E7E]/40 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
