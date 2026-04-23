"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { publishScheduledNow } from "../../../actions/articleGen";

export default function PublishNowButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  const handleClick = () => {
    setErr("");
    if (!confirm(`Publish "${title.slice(0, 60)}${title.length > 60 ? "…" : ""}" now?\n\nThis will generate and publish the article immediately (30-60 sec).`)) return;
    startTransition(async () => {
      const res = await publishScheduledNow(id);
      if (res.success) {
        router.refresh();
      } else {
        setErr(res.error || "Failed");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8705A] hover:bg-[#FEF0ED] border border-[#E8705A]/40 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60"
      >
        {isPending ? <><Loader2 size={11} className="animate-spin" /> Publishing…</> : <><Zap size={11} /> Publish Now</>}
      </button>
      {err && <p className="text-[10px] text-red-600">{err}</p>}
    </div>
  );
}
