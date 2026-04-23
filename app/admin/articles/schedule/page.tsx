import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, Sparkles, Play } from "lucide-react";
import ScheduleForm from "./ScheduleForm";
import DeleteButton from "./DeleteButton";
import RunNowButton from "./RunNowButton";
import PublishNowButton from "./PublishNowButton";
import PublishAllButton from "./PublishAllButton";

export const dynamic = "force-dynamic";

export default async function ScheduleArticlesPage() {
  const scheduled = await prisma.scheduledArticle.findMany({
    orderBy: { scheduledFor: "asc" },
    take: 100,
  });

  const pending = scheduled.filter((s) => s.status === "pending").length;
  const due = scheduled.filter((s) => s.status === "pending" && s.scheduledFor <= new Date()).length;
  const completed = scheduled.filter((s) => s.status === "completed").length;
  const failed = scheduled.filter((s) => s.status === "failed").length;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] mb-5">
        <ArrowLeft size={14} /> Back to articles
      </Link>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-[#E8705A]" />
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Bulk Schedule Articles</h1>
          </div>
          <p className="text-sm text-[#6B6B6B]">
            Queue multiple titles. AI will generate and publish them on schedule — 2-3 per day.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RunNowButton dueCount={due} />
          <PublishAllButton pendingCount={pending} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Pending", value: pending, color: "#E8705A", bg: "#FEF0ED" },
          { label: "Due Now", value: due, color: "#C95540", bg: "#FEF0ED" },
          { label: "Completed", value: completed, color: "#7A9E7E", bg: "#EDF5EE" },
          { label: "Failed", value: failed, color: "#DC2626", bg: "#FEF2F2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white border border-[#E8E4DF] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#E8705A]" />
            <h2 className="font-bold text-[#1A1A1A]">Add to Queue</h2>
          </div>
          <ScheduleForm />
        </div>

        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-3">How It Works</h2>
          <ol className="text-xs text-[#4A4A4A] space-y-2 list-decimal pl-4">
            <li>Paste one article title per line (up to 50 at a time).</li>
            <li>Optionally add matching reference hints (one per line, same order).</li>
            <li>Choose start date & how many per day (2-3 recommended).</li>
            <li>Scheduler spreads them across days at 9 AM, 1 PM, 5 PM slots.</li>
            <li>
              When due, articles auto-generate and publish.
              <br />
              <span className="text-[#9A9A9A]">Trigger the cron via <code className="bg-[#F9EBE8] px-1 rounded">/api/cron/generate</code> (Windows Task Scheduler or Vercel Cron).</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-[#E8E4DF] rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF]">
          <h2 className="font-bold text-[#1A1A1A]">Queue ({scheduled.length})</h2>
        </div>
        {scheduled.length === 0 ? (
          <div className="py-16 text-center text-[#9A9A9A] text-sm">No scheduled articles yet.</div>
        ) : (
          <div className="divide-y divide-[#E8E4DF]">
            {scheduled.map((s) => {
              const icon =
                s.status === "completed" ? <CheckCircle2 size={14} className="text-[#7A9E7E]" />
                : s.status === "failed" ? <XCircle size={14} className="text-red-500" />
                : s.status === "generating" ? <Loader2 size={14} className="text-[#E8705A] animate-spin" />
                : <Clock size={14} className="text-[#9A9A9A]" />;

              return (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FAFAF8]">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A] line-clamp-1">{s.title}</p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5">
                        {s.category} · {new Date(s.scheduledFor).toLocaleString()} · {s.authorName}
                      </p>
                      {s.status === "failed" && s.errorMessage && (
                        <p className="text-[11px] text-red-600 mt-1">{s.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.status === "pending" && (
                      <PublishNowButton id={s.id} title={s.title} />
                    )}
                    {s.generatedArticleId && (
                      <Link href={`/admin/articles/${s.generatedArticleId}`}
                        className="text-xs font-medium text-[#E8705A] hover:underline">
                        View
                      </Link>
                    )}
                    <DeleteButton id={s.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
