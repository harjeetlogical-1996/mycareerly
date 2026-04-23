"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { scheduleArticles } from "../../../actions/articleGen";

export default function ScheduleForm() {
  const [result, setResult] = useState<{ success: boolean; error?: string; scheduled?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await scheduleArticles(fd);
      setResult(res);
      if (res.success) (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
          Titles <span className="text-[#9A9A9A] font-normal">(one per line)</span>
        </label>
        <textarea
          name="titles"
          required
          rows={7}
          placeholder={"How to Care for Hydrangeas in Summer\n7 Wedding Bouquet Ideas for Fall 2026\nThe Complete Guide to Ranunculus"}
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 bg-[#FAFAF8] resize-none font-mono"
        />
        <p className="text-[11px] text-[#6B6B6B] mt-2 flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#E8705A]" />
          Category + author auto-picked by AI at generation time
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">
          References <span className="text-[#9A9A9A] font-normal">(optional, one per line, same order)</span>
        </label>
        <textarea
          name="references"
          rows={3}
          placeholder={"Focus on blue varieties and soil pH\nTrend toward dahlias and garden roses\nInclude varieties for US zones 3-8"}
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 bg-[#FAFAF8] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Per day</label>
          <select
            name="perDay"
            defaultValue="3"
            className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A]"
          >
            <option value="1">1 per day</option>
            <option value="2">2 per day</option>
            <option value="3">3 per day</option>
            <option value="5">5 per day</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Start date</label>
          <input
            name="startDate"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A]"
          />
        </div>
      </div>

      {result?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {result.error}
        </div>
      )}
      {result?.success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 text-xs">
          <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> Queued {result.scheduled} article{result.scheduled !== 1 ? "s" : ""}!
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm"
      >
        {isPending ? <><Loader2 size={14} className="animate-spin" /> Queueing…</> : "Add to Queue"}
      </button>
    </form>
  );
}
