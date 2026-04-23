"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 border border-[#E8E4DF] px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B6B6B] hover:bg-[#F9EBE8] hover:text-[#E8705A] hover:border-[#E8705A] transition-colors"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
