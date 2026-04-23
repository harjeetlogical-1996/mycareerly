"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Loader2, AlertCircle, CheckCircle2, Check, CalendarClock, Zap, RefreshCw } from "lucide-react";
import { suggestTopics, queueSelectedTopics, publishSelectedTopicsNow } from "../../../actions/articleGen";

type Preset = { label: string; value: string };

export default function TopicsClient({ presets }: { presets: Preset[] }) {
  const router = useRouter();

  const [focus, setFocus] = useState(presets[0].value);
  const [count, setCount] = useState(10);
  const [topics, setTopics] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const [queueResult, setQueueResult] = useState<{ scheduled?: number } | null>(null);
  const [publishResult, setPublishResult] = useState<{ succeeded: number; failed: number; total: number; errors?: string[] } | null>(null);

  const [isGenerating, startGenerating] = useTransition();
  const [isQueueing, startQueueing] = useTransition();
  const [isPublishing, startPublishing] = useTransition();

  const handleGenerate = () => {
    setError("");
    setQueueResult(null);
    setPublishResult(null);
    const fd = new FormData();
    fd.set("focus", focus);
    fd.set("count", String(count));
    startGenerating(async () => {
      const res = await suggestTopics(fd);
      if (res.success && res.topics) {
        setTopics(res.topics);
        setSelected(new Set(res.topics)); // select all by default
      } else {
        setError(res.error || "Failed to generate topics");
      }
    });
  };

  const toggle = (title: string) => {
    const next = new Set(selected);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === topics.length) setSelected(new Set());
    else setSelected(new Set(topics));
  };

  const handleQueue = (formData: FormData) => {
    setQueueResult(null);
    const fd = new FormData();
    Array.from(selected).forEach((t) => fd.append("titles", t));
    fd.set("perDay", formData.get("perDay") as string);
    fd.set("startDate", formData.get("startDate") as string);
    startQueueing(async () => {
      const res = await queueSelectedTopics(fd);
      if (res.success) {
        setQueueResult({ scheduled: res.scheduled });
        setTimeout(() => router.push("/admin/articles/schedule"), 1500);
      } else {
        setError(res.error || "Queue failed");
      }
    });
  };

  const handlePublishNow = () => {
    if (!confirm(`Publish ${selected.size} articles right now? This takes ~${Math.ceil(selected.size * 0.7)} minutes.`)) return;
    setPublishResult(null);
    const fd = new FormData();
    Array.from(selected).forEach((t) => fd.append("titles", t));
    startPublishing(async () => {
      const res = await publishSelectedTopicsNow(fd);
      if (res.success) {
        setPublishResult({ succeeded: res.succeeded!, failed: res.failed!, total: res.total!, errors: res.errors });
      } else {
        setError(res.error || "Publish failed");
      }
    });
  };

  const isBusy = isGenerating || isQueueing || isPublishing;

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
        <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-[#E8705A]" /> Step 1 — Pick Focus
        </h2>

        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setFocus(p.value)}
              className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                focus === p.value
                  ? "border-[#E8705A] bg-[#FEF0ED] text-[#1A1A1A] font-semibold"
                  : "border-[#E8E4DF] bg-white text-[#4A4A4A] hover:border-[#E8705A]/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={2}
          placeholder="Custom focus — e.g. 'Valentine's Day red rose ideas for 2027'"
          className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A] resize-none"
        />

        <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#4A4A4A]">Count:</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="border border-[#E8E4DF] rounded-lg px-2.5 py-1.5 text-sm bg-[#FAFAF8]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isBusy}
            className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            {isGenerating
              ? <><Loader2 size={14} className="animate-spin" /> Brainstorming…</>
              : topics.length > 0
                ? <><RefreshCw size={14} /> Generate new topics</>
                : <><Lightbulb size={14} /> Generate Topics</>}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
            <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Topics list */}
      {topics.length > 0 && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1A1A1A]">
              Step 2 — Select Topics
              <span className="text-xs text-[#6B6B6B] font-normal ml-2">
                ({selected.size} of {topics.length} selected)
              </span>
            </h2>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-semibold text-[#E8705A] hover:underline"
            >
              {selected.size === topics.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {topics.map((t, i) => {
              const checked = selected.has(t);
              return (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    checked
                      ? "border-[#E8705A] bg-[#FEF0ED]"
                      : "border-[#E8E4DF] bg-white hover:border-[#E8705A]/40"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    checked ? "bg-[#E8705A] border-[#E8705A]" : "border-[#C0B8B2]"
                  }`}>
                    {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(t)}
                    className="sr-only"
                  />
                  <span className="text-sm text-[#1A1A1A] leading-relaxed">{t}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {topics.length > 0 && selected.size > 0 && !publishResult && !queueResult && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Step 3 — Schedule or Publish</h2>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Schedule form */}
            <form
              action={handleQueue}
              className="bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock size={15} className="text-[#E8705A]" />
                <p className="font-semibold text-sm text-[#1A1A1A]">Add to Schedule</p>
              </div>
              <p className="text-xs text-[#6B6B6B] mb-4">
                Queue {selected.size} topics. AI auto-generates each on schedule.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6B6B6B] mb-1">Per day</label>
                  <select
                    name="perDay"
                    defaultValue="3"
                    className="w-full border border-[#E8E4DF] rounded-lg px-2.5 py-2 text-xs bg-white"
                  >
                    <option value="1">1 per day</option>
                    <option value="2">2 per day</option>
                    <option value="3">3 per day</option>
                    <option value="5">5 per day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6B6B6B] mb-1">Start date</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full border border-[#E8E4DF] rounded-lg px-2.5 py-2 text-xs bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#E8705A] text-[#E8705A] hover:bg-[#FEF0ED] disabled:opacity-60 font-semibold py-2.5 rounded-xl text-sm"
              >
                {isQueueing
                  ? <><Loader2 size={13} className="animate-spin" /> Queueing…</>
                  : <><CalendarClock size={13} /> Add {selected.size} to Queue</>}
              </button>
            </form>

            {/* Publish now */}
            <div className="bg-[#FEF0ED] border border-[#E8705A]/30 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} className="text-[#E8705A]" />
                <p className="font-semibold text-sm text-[#1A1A1A]">Publish Immediately</p>
              </div>
              <p className="text-xs text-[#6B6B6B] mb-4 flex-1">
                Generate and publish all {selected.size} articles right now. Takes ~{Math.ceil(selected.size * 0.7)} minutes.
              </p>

              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm"
              >
                {isPublishing
                  ? <><Loader2 size={13} className="animate-spin" /> Publishing…</>
                  : <><Zap size={13} /> Publish {selected.size} Now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue result */}
      {queueResult?.scheduled !== undefined && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900 text-sm">Queued {queueResult.scheduled} article{queueResult.scheduled !== 1 ? "s" : ""}!</p>
            <p className="text-xs text-green-700 mt-0.5">Redirecting to schedule page…</p>
          </div>
        </div>
      )}

      {/* Publish result */}
      {publishResult && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-green-600" />
            <p className="font-bold text-[#1A1A1A]">Publishing complete</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{publishResult.succeeded}</p>
              <p className="text-[10px] text-green-700">Published</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{publishResult.failed}</p>
              <p className="text-[10px] text-red-700">Failed</p>
            </div>
            <div className="bg-[#F9EBE8] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#E8705A]">{publishResult.total}</p>
              <p className="text-[10px] text-[#E8705A]">Total</p>
            </div>
          </div>

          {publishResult.errors && publishResult.errors.length > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
              <p className="font-semibold mb-1">Errors:</p>
              {publishResult.errors.slice(0, 5).map((err, i) => (
                <p key={i}>• {err}</p>
              ))}
            </div>
          )}

          <a
            href="/admin/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8705A] hover:underline mt-4"
          >
            View published articles →
          </a>
        </div>
      )}
    </div>
  );
}
