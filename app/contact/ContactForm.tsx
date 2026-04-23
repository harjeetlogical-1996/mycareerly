"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { submitContact } from "../actions/contact";

const SUBJECTS = [
  "General Inquiry",
  "List My Flower Shop",
  "Update My Listing",
  "Editorial / Article Pitch",
  "Partnership / Advertising",
  "Report an Issue",
  "Other",
];

export default function ContactForm() {
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitContact(formData);
      setResult(res);
    });
  };

  if (result?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="w-16 h-16 bg-[#EDF5EE] rounded-full flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#7A9E7E]" />
        </div>
        <div>
          <p className="font-bold text-[#1A1A1A] text-lg mb-1">Message Sent!</p>
          <p className="text-sm text-[#6B6B6B]">{result.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Your Name *</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Jane Smith"
            className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all bg-[#FAFAF8]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Email Address *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="jane@example.com"
            className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all bg-[#FAFAF8]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Subject *</label>
        <select
          name="subject"
          required
          defaultValue=""
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all bg-[#FAFAF8]"
        >
          <option value="" disabled>Select a subject...</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help..."
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all bg-[#FAFAF8] resize-none"
        />
      </div>

      {result?.error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
          <AlertCircle size={13} /> {result.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
      >
        {isPending ? "Sending..." : <><Send size={15} /> Send Message</>}
      </button>
    </form>
  );
}
