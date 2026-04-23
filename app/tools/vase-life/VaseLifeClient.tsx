"use client";

import { useState } from "react";
import Link from "next/link";
import { Droplets, Scissors, Sun, ThermometerSun, Flower2, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Calendar } from "lucide-react";
import { VASE_LIFE_FLOWERS } from "../../data/tools-data";

const DIFFICULTY_COLOR: Record<string, { bg: string; text: string }> = {
  Easy:     { bg: "#EDF5EE", text: "#7A9E7E" },
  Moderate: { bg: "#FEF0ED", text: "#E8705A" },
  Tricky:   { bg: "#FFF3E0", text: "#FF9800" },
};

export default function VaseLifeClient() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const selected = selectedIdx !== null ? VASE_LIFE_FLOWERS[selectedIdx] : null;

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={11} /> Free Interactive Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
          Vase Life <span className="text-[#E8705A]">Calculator</span>
        </h1>
        <p className="text-base text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
          Pick your flower and get a custom care schedule — water temperature, flower food, retrim frequency, and florist-tested pro tips.
        </p>
      </div>

      {/* Flower selector */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-8">
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
          Choose your flower
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {VASE_LIFE_FLOWERS.map((f, i) => {
            const active = selectedIdx === i;
            return (
              <button
                key={f.name}
                onClick={() => {
                  setSelectedIdx(i);
                  setTimeout(() => {
                    document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 justify-center ${
                  active
                    ? "bg-[#E8705A] text-white shadow-md"
                    : "bg-[#FAFAF8] border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#E8705A] hover:text-[#E8705A]"
                }`}
              >
                <Flower2 size={13} className="shrink-0" />
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result */}
      {selected && (
        <div id="result" className="space-y-5 scroll-mt-24">
          {/* Headline */}
          <div className="bg-white border-2 border-[#E8705A]/30 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#F9EBE8] to-[#FEF0ED] px-6 py-4 flex items-center justify-between flex-wrap gap-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Flower2 size={22} className="text-[#E8705A]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">{selected.name}</h2>
                  <p className="text-sm text-[#4A4A4A]">
                    Typical vase life: <strong className="text-[#E8705A]">{selected.minDays}–{selected.maxDays} days</strong>
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: DIFFICULTY_COLOR[selected.difficulty].bg,
                  color: DIFFICULTY_COLOR[selected.difficulty].text,
                }}
              >
                {selected.difficulty} care
              </span>
            </div>

            {/* Care grid */}
            <div className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <InfoItem icon={Droplets} label="Water Temperature" value={selected.waterTemp} />
                <InfoItem icon={Flower2} label="Flower Food" value={selected.flowerFood} />
                <InfoItem icon={Scissors} label="Retrim Every" value={selected.retrimEvery} />
                <InfoItem icon={Sun} label="Ideal Location" value={selected.idealLocation} />
              </div>

              {/* Tips */}
              <div className="mb-5">
                <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#7A9E7E]" /> Pro Tips
                </h3>
                <ul className="space-y-2">
                  {selected.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#4A4A4A] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E7E] mt-[0.55rem] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid */}
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" /> Avoid
                </h3>
                <ul className="space-y-1.5">
                  {selected.avoid.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#4A4A4A] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-[0.55rem] shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Schedule preview */}
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#E8705A]" /> Suggested Care Schedule
            </h3>
            <div className="space-y-2.5">
              {generateSchedule(selected).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E4DF]">
                  <div className="w-8 h-8 bg-[#E8705A] text-white rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">
                    D{item.day}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">{item.title}</p>
                    <p className="text-xs text-[#6B6B6B]">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="grid sm:grid-cols-2 gap-3 mt-8">
            <Link
              href="/how-to-keep-cut-flowers-fresh-longer-15-florist-tested-tricks"
              className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">Related Article</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">15 Pro Tricks to Keep Flowers Fresh</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Read guide <ChevronRight size={11} /></p>
            </Link>
            <Link
              href="/listings"
              className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5 hover:border-[#E8705A] transition-all group"
            >
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">Get Fresh Flowers</p>
              <p className="font-bold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">Find a florist near you</p>
              <p className="text-xs text-[#E8705A] font-semibold mt-2 inline-flex items-center gap-1">Browse listings <ChevronRight size={11} /></p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-[#FAFAF8] rounded-xl p-3.5 border border-[#E8E4DF]">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#E8705A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{value}</p>
      </div>
    </div>
  );
}

function generateSchedule(f: typeof VASE_LIFE_FLOWERS[number]) {
  const schedule: { day: number; title: string; action: string }[] = [
    { day: 0, title: "Arrival", action: `Trim stems at 45° underwater, strip leaves below waterline, use ${f.waterTemp.toLowerCase()} water${f.flowerFood !== "Optional" ? ` + flower food (${f.flowerFood.toLowerCase()})` : ""}.` },
  ];

  const retrimDays = parseInt(f.retrimEvery.match(/\d+/)?.[0] ?? "3", 10);
  const endDay = Math.ceil((f.minDays + f.maxDays) / 2);

  for (let d = retrimDays; d < endDay; d += retrimDays) {
    schedule.push({
      day: d,
      title: `Water change`,
      action: "Empty vase, rinse thoroughly, refill with fresh water, retrim stems by 1 cm.",
    });
  }

  schedule.push({
    day: endDay,
    title: "Enjoy & evaluate",
    action: "By this point most blooms peak. Remove any wilted stems to extend the rest.",
  });

  return schedule;
}
