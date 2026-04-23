"use client";

import { useState, useTransition } from "react";
import { Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeNewsletter } from "../actions/newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await subscribeNewsletter(formData);
      setResult(res);
    });
  };

  return (
    <section className="py-20 bg-[#FAFAF8] relative overflow-hidden">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F9EBE8] rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#F9EBE8] border border-[#E8705A]/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles size={14} className="text-[#E8705A]" />
          <span className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider">Stay in Bloom</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] mb-3">
          Get expert guides &{" "}
          <span style={{ background: "linear-gradient(135deg,#E8705A,#C95540)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            flower tips
          </span>{" "}
          weekly
        </h2>
        <p className="text-[#6B6B6B] text-base mb-8 max-w-lg mx-auto">
          Join 12,000+ flower lovers who get seasonal guides, new shop spotlights, and expert flower tips every week.
        </p>

        {result?.success ? (
          <div className="inline-flex items-center gap-3 bg-[#EDF5EE] border border-[#B8D4BB] rounded-2xl px-6 py-4">
            <div className="w-8 h-8 bg-[#7A9E7E] rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#1A1A1A] text-sm">You&apos;re subscribed!</p>
              <p className="text-xs text-[#6B6B6B]">{result.message}</p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 flex items-center gap-2 bg-white border border-[#E8E4DF] rounded-2xl px-4 py-3 focus-within:border-[#E8705A] focus-within:ring-2 focus-within:ring-[#E8705A]/10 transition-all">
                <Mail size={16} className="text-[#6B6B6B] shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent text-sm outline-none placeholder-[#C5A89F] text-[#1A1A1A]"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-2xl transition-all hover:shadow-[0_6px_20px_rgba(232,112,90,0.4)] group"
              >
                {isPending ? "Subscribing..." : "Subscribe"}
                {!isPending && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {result?.error && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
                <AlertCircle size={12} /> {result.error}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-[#6B6B6B] mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
