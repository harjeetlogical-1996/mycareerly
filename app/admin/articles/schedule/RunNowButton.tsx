"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { runDueScheduled } from "../../../actions/articleGen";

export default function RunNowButton({ dueCount }: { dueCount: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ succeeded: number; failed: number; processed: number } | null>(null);

  const handleRun = () => {
    setResult(null);
    startTransition(async () => {
      const res = await runDueScheduled();
      setResult(res);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-[#6B6B6B]">
          {result.succeeded} succeeded, {result.failed} failed
        </span>
      )}
      <button
        onClick={handleRun}
        disabled={isPending || dueCount === 0}
        className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
      >
        {isPending ? <><Loader2 size={14} className="animate-spin" /> Running…</> : <><Play size={13} /> Run Due ({dueCount})</>}
      </button>
    </div>
  );
}
