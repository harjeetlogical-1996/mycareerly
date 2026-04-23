"use client";

import { useState, useTransition } from "react";
import { Star, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { submitReview } from "../../actions/reviews";

export default function ReviewForm({ listingId, listingName }: { listingId: string; listingName: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [result, setResult] = useState<{ success: boolean; error?: string; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    if (rating === 0) {
      setResult({ success: false, error: "Please select a rating" });
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("listingId", listingId);
    fd.set("rating", String(rating));
    startTransition(async () => {
      const res = await submitReview(fd);
      setResult(res);
      if (res.success) {
        (e.target as HTMLFormElement).reset();
        setRating(0);
      }
    });
  };

  if (result?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
        <p className="font-bold text-green-900 mb-1">Thank you!</p>
        <p className="text-sm text-green-700">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Your rating *</p>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1 hover:scale-110 transition-transform"
              aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            >
              <Star
                size={28}
                className={
                  (hover || rating) >= n
                    ? "text-amber-400 fill-amber-400"
                    : "text-[#E8E4DF]"
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-semibold text-[#1A1A1A]">
              {rating}.0 — {["Poor","Fair","Good","Great","Excellent"][rating - 1]}
            </span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Your name *</label>
          <input
            name="authorName"
            required
            placeholder="Jane S."
            className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Email * <span className="text-[#9A9A9A] font-normal">(not published)</span></label>
          <input
            name="authorEmail"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Review title <span className="text-[#9A9A9A] font-normal">(optional)</span></label>
        <input
          name="title"
          placeholder="Summary of your experience..."
          maxLength={100}
          className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">
          Your review * <span className="text-[#9A9A9A] font-normal">(min 20 characters)</span>
        </label>
        <textarea
          name="body"
          required
          rows={5}
          maxLength={2000}
          placeholder={`Share your experience with ${listingName}. What did you order? How was the quality and service?`}
          className="w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8705A] resize-none"
        />
      </div>

      {result?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {result.error}
        </div>
      )}

      <p className="text-[11px] text-[#9A9A9A] leading-relaxed">
        Reviews are moderated for spam and authenticity. Your review will appear within 24 hours of submission. By submitting, you agree to our <a href="/terms" className="text-[#E8705A] hover:underline">Terms</a>.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        {isPending
          ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
          : <><Send size={13} /> Submit Review</>}
      </button>
    </form>
  );
}
