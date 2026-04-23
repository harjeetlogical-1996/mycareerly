"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { publishAllPendingNow } from "../../../actions/articleGen";

export default function PublishAllButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ succeeded: number; failed: number; total: number } | null>(null);

  const handleClick = () => {
    if (pendingCount === 0) return;
    const estMinutes = Math.ceil(pendingCount * 0.8);
    if (!confirm(`Publish ALL ${pendingCount} pending articles right now?\n\nThis will take ~${estMinutes} minute${estMinutes !== 1 ? "s" : ""}.`)) return;

    setResult(null);
    startTransition(async () => {
      const res = await publishAllPendingNow();
      if (res.success) {
        setResult({ succeeded: res.succeeded!, failed: res.failed!, total: res.total! });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-[#6B6B6B]">
          <span className="text-green-600 font-semibold">{result.succeeded}</span> published
          {result.failed > 0 && <>, <span className="text-red-600 font-semibold">{result.failed}</span> failed</>}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={isPending || pendingCount === 0}
        className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
      >
        {isPending
          ? <><Loader2 size={14} className="animate-spin" /> Publishing {pendingCount}…</>
          : <><Zap size={13} /> Publish All Now ({pendingCount})</>}
      </button>
    </div>
  );
}
