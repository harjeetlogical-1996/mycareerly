"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function ConnectForm() {
  const [label, setLabel] = useState("");

  return (
    <div className="bg-white border-2 border-dashed border-[#E60023]/30 rounded-2xl p-5">
      <p className="text-sm font-bold text-[#1A1A1A] mb-1">Connect a new Pinterest account</p>
      <p className="text-xs text-[#6B6B6B] mb-3">Give the account a label (e.g., &ldquo;Main&rdquo;, &ldquo;Wedding niche&rdquo;) — helps identify it later.</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Account label"
          className="flex-1 px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none"
        />
        <a
          href={`/api/pinterest/oauth/start?label=${encodeURIComponent(label)}`}
          className="inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#AD081B] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} /> Connect
        </a>
      </div>
      <p className="text-[10px] text-[#8A8A8A] mt-2">You&apos;ll be redirected to Pinterest to authorize. Make sure you&apos;re logged into the correct account first.</p>
    </div>
  );
}
