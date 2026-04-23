import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { retryPin, deletePin } from "../../../actions/pinterest";
import { ListOrdered, CheckCircle2, XCircle, Clock, Zap, RefreshCw, Trash2, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const TABS = ["all", "queued", "scheduled", "posted", "failed", "draft"] as const;

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.status && TABS.includes(sp.status as any)) ? sp.status : "all";

  const where = filter !== "all" ? { status: filter } : {};
  const pins = await prisma.pinterestPin.findMany({
    where,
    include: { account: true, image: true },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const counts = await prisma.pinterestPin.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap: Record<string, number> = { all: 0 };
  counts.forEach((c) => { countMap[c.status] = c._count; countMap.all += c._count; });

  const articleIds = [...new Set(pins.map((p) => p.articleId))];
  const articles = articleIds.length ? await prisma.article.findMany({ where: { id: { in: articleIds } } }) : [];
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <ListOrdered size={22} className="text-[#E60023]" /> Pin Queue
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{countMap.all} total pins across all accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-xl p-1 mb-5 w-fit overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/pinterest/queue${t === "all" ? "" : `?status=${t}`}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize whitespace-nowrap ${
              filter === t ? "bg-[#E60023] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {t} <span className="opacity-70 ml-1">({countMap[t] ?? 0})</span>
          </Link>
        ))}
      </div>

      {pins.length === 0 ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
          <p className="text-sm text-[#6B6B6B]">No pins in this filter</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-16">Img</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Article</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden md:table-cell">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell">When</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {pins.map((p) => {
                const art = articleMap.get(p.articleId);
                const imgUrl = p.image?.url || art?.coverImage;
                return (
                  <tr key={p.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3">
                      {imgUrl && (
                        <div className="w-9 h-12 rounded-lg overflow-hidden bg-[#FAFAF8]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1 max-w-sm">{art?.title ?? p.title}</p>
                      <p className="text-[10px] text-[#6B6B6B] line-clamp-1">{p.title}</p>
                      {p.lastError && <p className="text-[10px] text-red-600 line-clamp-1 mt-0.5">{p.lastError}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs font-semibold text-[#1A1A1A]">@{p.account.username}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{p.boardId.slice(0, 18)}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[10px] text-[#6B6B6B]">
                      {p.postedAt ? `Posted ${new Date(p.postedAt).toLocaleDateString()}` :
                       p.scheduledFor ? `Scheduled ${new Date(p.scheduledFor).toLocaleString()}` :
                       new Date(p.createdAt).toLocaleDateString()}
                      {p.attempts > 0 && <span className="ml-2">· {p.attempts} tries</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.pinId && p.status === "posted" && (
                          <a href={`https://www.pinterest.com/pin/${p.pinId}/`} target="_blank" rel="noopener" title="View on Pinterest" className="w-7 h-7 rounded-lg bg-[#FAFAF8] hover:bg-[#E8E4DF] text-[#6B6B6B] flex items-center justify-center">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {(p.status === "failed" || p.status === "draft") && (
                          <form action={async () => { "use server"; await retryPin(p.id); }}>
                            <button type="submit" title="Retry / queue" className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center">
                              <RefreshCw size={12} />
                            </button>
                          </form>
                        )}
                        <form action={async () => { "use server"; await deletePin(p.id); }}>
                          <button type="submit" title="Delete" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                            <Trash2 size={12} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: any }> = {
    draft:     { cls: "bg-gray-100 text-gray-600", Icon: Clock },
    queued:    { cls: "bg-amber-100 text-amber-700", Icon: Zap },
    scheduled: { cls: "bg-blue-100 text-blue-700", Icon: Clock },
    posted:    { cls: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    failed:    { cls: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const m = map[status] || map.draft;
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>
      <Icon size={10} /> {status}
    </span>
  );
}
