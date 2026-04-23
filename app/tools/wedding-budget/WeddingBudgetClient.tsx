"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DollarSign, Users, Palette, Calendar, Check, Sparkles, Info } from "lucide-react";

type Style = "minimal" | "classic" | "lush" | "extravagant";
type Season = "spring" | "summer" | "fall" | "winter";

const STYLE_INFO: Record<Style, { label: string; desc: string; multiplier: number }> = {
  minimal:     { label: "Minimal",     desc: "Simple bouquets, greenery-forward, 1-2 focal flowers",   multiplier: 0.7 },
  classic:     { label: "Classic",     desc: "Traditional wedding arrangements, balanced variety",      multiplier: 1.0 },
  lush:        { label: "Lush",        desc: "Abundant blooms, oversized bouquets, premium varieties",  multiplier: 1.5 },
  extravagant: { label: "Extravagant", desc: "Large installations, arches, rare flowers, full room",    multiplier: 2.3 },
};

const SEASON_INFO: Record<Season, { label: string; desc: string; multiplier: number }> = {
  spring: { label: "Spring",  desc: "Peak peony/tulip/ranunculus availability — great value",     multiplier: 0.9 },
  summer: { label: "Summer",  desc: "Wide variety, average pricing, local-grown options",         multiplier: 1.0 },
  fall:   { label: "Fall",    desc: "Dahlias/chrysanthemums abundant, good pricing",              multiplier: 0.95 },
  winter: { label: "Winter",  desc: "Most flowers imported — expect 20-30% premium",              multiplier: 1.3 },
};

// Per-item average costs (US market, 2026)
const ITEM_COSTS = {
  bridalBouquet:      { label: "Bridal Bouquet",      price: 275, perEvent: true },
  bridesmaidBouquet:  { label: "Bridesmaid Bouquet",  price: 110, perCount: true },
  groomBoutonniere:   { label: "Groom Boutonniere",   price: 35,  perEvent: true },
  groomsmanBoutonniere: { label: "Groomsman Boutonniere", price: 28, perCount: true },
  ceremonyArch:       { label: "Ceremony Arch/Backdrop", price: 900, perEvent: true },
  centerpieces:       { label: "Reception Centerpieces (per table)", price: 125, perTable: true },
  corsages:           { label: "Parent Corsages (pair)", price: 65, perEvent: true },
  aisleDecor:         { label: "Aisle Petals / Decor", price: 250, perEvent: true },
};

type ItemKey = keyof typeof ITEM_COSTS;

export default function WeddingBudgetClient() {
  const [guests, setGuests] = useState(100);
  const [bridesmaids, setBridesmaids] = useState(4);
  const [groomsmen, setGroomsmen] = useState(4);
  const [style, setStyle] = useState<Style>("classic");
  const [season, setSeason] = useState<Season>("summer");
  const [items, setItems] = useState<Record<ItemKey, boolean>>({
    bridalBouquet: true,
    bridesmaidBouquet: true,
    groomBoutonniere: true,
    groomsmanBoutonniere: true,
    ceremonyArch: true,
    centerpieces: true,
    corsages: true,
    aisleDecor: false,
  });

  const breakdown = useMemo(() => {
    const tables = Math.max(1, Math.ceil(guests / 10));
    const items_cost: { key: string; label: string; count: number; unitPrice: number; total: number }[] = [];

    (Object.keys(ITEM_COSTS) as ItemKey[]).forEach((k) => {
      if (!items[k]) return;
      const item = ITEM_COSTS[k];
      let count = 1;
      if ((item as any).perCount) {
        count = k === "bridesmaidBouquet" ? bridesmaids : groomsmen;
      } else if ((item as any).perTable) {
        count = tables;
      }
      const unitPrice = Math.round(item.price * STYLE_INFO[style].multiplier * SEASON_INFO[season].multiplier);
      items_cost.push({
        key: k,
        label: item.label,
        count,
        unitPrice,
        total: unitPrice * count,
      });
    });

    const subtotal = items_cost.reduce((s, x) => s + x.total, 0);
    const setupFee = Math.round(subtotal * 0.12); // ~12% labor/setup
    const tax = Math.round(subtotal * 0.08);       // ~8% US avg sales tax
    const total = subtotal + setupFee + tax;

    return { items_cost, subtotal, setupFee, tax, total, tables };
  }, [guests, bridesmaids, groomsmen, style, season, items]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={11} /> Free Interactive Tool · 2026 US Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
          Wedding Flower <span className="text-[#E8705A]">Budget Calculator</span>
        </h1>
        <p className="text-base text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
          Get a realistic estimate for your wedding florals based on guest count, style preferences, and season.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">

        {/* Inputs */}
        <div className="space-y-5">

          {/* Basics */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Users size={17} className="text-[#E8705A]" /> Wedding Details
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <NumberField label="Guests" value={guests} onChange={setGuests} min={20} max={500} />
              <NumberField label="Bridesmaids" value={bridesmaids} onChange={setBridesmaids} min={0} max={12} />
              <NumberField label="Groomsmen" value={groomsmen} onChange={setGroomsmen} min={0} max={12} />
            </div>
          </section>

          {/* Style */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Palette size={17} className="text-[#E8705A]" /> Floral Style
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(STYLE_INFO) as Style[]).map((s) => {
                const active = style === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      active
                        ? "border-[#E8705A] bg-[#FEF0ED]"
                        : "border-[#E8E4DF] bg-white hover:border-[#E8705A]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-[#1A1A1A]">{STYLE_INFO[s].label}</p>
                      {active && <Check size={16} className="text-[#E8705A]" />}
                    </div>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{STYLE_INFO[s].desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Season */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Calendar size={17} className="text-[#E8705A]" /> Wedding Season
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SEASON_INFO) as Season[]).map((s) => {
                const active = season === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? "border-[#E8705A] bg-[#FEF0ED]"
                        : "border-[#E8E4DF] bg-white hover:border-[#E8705A]/40"
                    }`}
                  >
                    <p className="font-bold text-sm text-[#1A1A1A] capitalize">{SEASON_INFO[s].label}</p>
                    <p className="text-[10px] text-[#6B6B6B] leading-snug mt-0.5">{SEASON_INFO[s].desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Items */}
          <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">What You Need</h2>
            <div className="space-y-2">
              {(Object.keys(ITEM_COSTS) as ItemKey[]).map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E4DF] cursor-pointer hover:border-[#E8705A]/40 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={items[k]}
                    onChange={(e) => setItems((v) => ({ ...v, [k]: e.target.checked }))}
                    className="w-4 h-4 accent-[#E8705A]"
                  />
                  <span className="text-sm text-[#1A1A1A] flex-1">{ITEM_COSTS[k].label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky result sidebar */}
        <div className="lg:sticky lg:top-20 h-fit space-y-4">
          <div className="bg-gradient-to-br from-[#F9EBE8] to-white border-2 border-[#E8705A]/30 rounded-3xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#E8705A] mb-2">Total Estimate</p>
            <p className="text-5xl font-bold text-[#1A1A1A] leading-none mb-1">{fmt(breakdown.total)}</p>
            <p className="text-sm text-[#6B6B6B]">for {guests} guests · {breakdown.tables} tables</p>
          </div>

          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-3">Breakdown</p>
            <div className="space-y-2 text-sm mb-4">
              {breakdown.items_cost.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A1A] font-medium truncate">{item.label}</p>
                    {item.count > 1 && (
                      <p className="text-[10px] text-[#9A9A9A]">
                        {item.count} × {fmt(item.unitPrice)}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-[#1A1A1A] shrink-0 ml-2">{fmt(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E4DF] space-y-1 text-xs">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Subtotal</span>
                <span>{fmt(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Setup & labor (~12%)</span>
                <span>{fmt(breakdown.setupFee)}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Sales tax (~8%)</span>
                <span>{fmt(breakdown.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1A1A1A] text-sm pt-2 border-t border-[#E8E4DF] mt-2">
                <span>Total</span>
                <span>{fmt(breakdown.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-4 flex items-start gap-2">
            <Info size={14} className="text-[#E8705A] shrink-0 mt-0.5" />
            <p className="text-xs text-[#4A4A4A] leading-relaxed">
              This is a <strong>ballpark estimate</strong> based on 2026 US market averages. Actual prices vary by region, florist, and specific flower choices.
            </p>
          </div>

          <Link
            href="/listings"
            className="block w-full bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold py-3.5 rounded-2xl text-sm text-center transition-colors"
          >
            Find a Wedding Florist Near You →
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/how-much-do-wedding-flowers-cost-in-the-us-real-budget-breakdown"
              className="bg-white border border-[#E8E4DF] rounded-xl p-3 text-xs text-center hover:border-[#E8705A] transition-colors"
            >
              <p className="font-semibold text-[#1A1A1A]">Budget Guide</p>
              <p className="text-[#6B6B6B]">Read article →</p>
            </Link>
            <Link
              href="/best-wedding-flowers-for-each-month-us-availability-chart"
              className="bg-white border border-[#E8E4DF] rounded-xl p-3 text-xs text-center hover:border-[#E8705A] transition-colors"
            >
              <p className="font-semibold text-[#1A1A1A]">Seasonal Guide</p>
              <p className="text-[#6B6B6B]">See options →</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        min={min}
        max={max}
        className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]"
      />
    </div>
  );
}
