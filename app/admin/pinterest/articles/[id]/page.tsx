import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { retryPin, deletePin } from "../../../../actions/pinterest";
import { ArrowLeft, Plus, CheckCircle2, XCircle, Clock, Zap, ExternalLink, RefreshCw, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArticlePinsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return notFound();

  const pins = await prisma.pinterestPin.findMany({
    where: { articleId: id },
    include: { account: true, image: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <Link href="/admin/pinterest/articles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] mb-4">
        <ArrowLeft size={12} /> Back to Articles
      </Link>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] line-clamp-2 max-w-2xl">{article.title}</h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">{pins.length} pin variant{pins.length !== 1 ? "s" : ""} · {article.category}</p>
        </div>
        <Link href={`/admin/pinterest/articles/${article.id}/new`} className="inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#AD081B] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <Plus size={14} /> New Pin Variant
        </Link>
      </div>

      {pins.length === 0 ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
          <p className="text-sm text-[#6B6B6B] mb-3">No pins for this article yet</p>
          <Link href={`/admin/pinterest/articles/${article.id}/new`} className="inline-flex items-center gap-1.5 text-sm text-[#E60023] font-semibold hover:underline">
            <Plus size={14} /> Create first pin
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pins.map((p) => (
            <div key={p.id} className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
              <div className="relative aspect-[2/3] bg-[#FAFAF8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image?.url || article.coverImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <StatusBadge status={p.status} />
                </div>
                {p.image?.source === "ai" && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-gradient-to-r from-[#E60023] to-[#E8705A] text-white px-1.5 py-0.5 rounded">AI</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-xs text-[#1A1A1A] line-clamp-2 mb-1">{p.title}</p>
                <p className="text-[10px] text-[#6B6B6B] mb-2">@{p.account.username} · {p.boardId || "no board"}</p>
                {p.lastError && <p className="text-[10px] text-red-600 line-clamp-2 mb-2">{p.lastError}</p>}
                {p.scheduledFor && p.status === "scheduled" && (
                  <p className="text-[10px] text-[#6B6B6B] mb-2">Scheduled: {new Date(p.scheduledFor).toLocaleString()}</p>
                )}
                {p.postedAt && (
                  <p className="text-[10px] text-[#6B6B6B] mb-2">Posted: {new Date(p.postedAt).toLocaleString()}</p>
                )}
                <div className="flex items-center gap-1">
                  {p.pinId && p.status === "posted" && (
                    <a
                      href={`https://www.pinterest.com/pin/${p.pinId}/`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6B6B6B] hover:text-[#E60023] px-2 py-1"
                    >
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                  {p.status === "failed" && (
                    <form action={async () => { "use server"; await retryPin(p.id); }}>
                      <button type="submit" className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg">
                        <RefreshCw size={10} /> Retry
                      </button>
                    </form>
                  )}
                  <form action={async () => { "use server"; await deletePin(p.id); }}>
                    <button type="submit" className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg">
                      <Trash2 size={10} /> Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
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
