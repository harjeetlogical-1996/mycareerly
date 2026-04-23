"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { generateNow } from "../../../actions/articleGen";

export default function GenerateForm() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    articleId?: string;
    pickedCategory?: string;
    pickedAuthor?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await generateNow(fd);
      setResult(res);
      if (res.success && res.articleId) {
        setTimeout(() => router.push(`/admin/articles/${res.articleId}`), 2000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* TITLE — the only required field */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
          Article Title
          <span className="text-[#9A9A9A] font-normal ml-1">(everything else is automatic)</span>
        </label>
        <input
          name="title"
          required
          autoFocus
          placeholder="e.g. 7 Peony Varieties Every Florist Should Know"
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-4 text-base text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 bg-[#FAFAF8]"
        />
        <p className="text-[11px] text-[#6B6B6B] mt-2 flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#E8705A]" />
          AI will auto-pick the best category, match the right author, and generate a full
          1300-word SEO/AEO/GEO-optimized article.
        </p>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs font-medium text-[#6B6B6B] hover:text-[#E8705A] inline-flex items-center gap-1"
      >
        <ChevronDown size={12} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        Advanced (optional reference hints)
      </button>

      {showAdvanced && (
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">
            Reference / angle hints
          </label>
          <textarea
            name="reference"
            rows={3}
            placeholder="e.g. Focus on cool-climate varieties, include care tips for zones 4-7"
            className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 bg-[#FAFAF8] resize-none"
          />
          <p className="text-[10px] text-[#9A9A9A] mt-1">
            Blank = AI interprets freely. Only use for specific angles.
          </p>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="publishNow" defaultChecked className="w-4 h-4 accent-[#E8705A]" />
        <span className="text-xs text-[#4A4A4A]">Publish immediately (uncheck to save as draft)</span>
      </label>

      {result?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {result?.success && (
        <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-4 text-sm">
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <span className="font-semibold">Article generated!</span>
          </div>
          <div className="text-xs space-y-0.5 ml-6">
            <p>📂 Category: <span className="font-semibold">{result.pickedCategory}</span></p>
            <p>✍️ Author: <span className="font-semibold">{result.pickedAuthor}</span></p>
            <p className="text-green-700">Redirecting to edit page…</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors text-sm"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> AI is working (30–50 seconds)…
          </>
        ) : (
          <>
            <Sparkles size={15} /> Generate Article (auto everything)
          </>
        )}
      </button>
    </form>
  );
}
