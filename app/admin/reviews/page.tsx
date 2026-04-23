import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { approveReview, rejectReview, deleteReview } from "../../actions/reviews";
import { MessageSquare, CheckCircle2, XCircle, Trash2, Star, Clock, Store, ExternalLink } from "lucide-react";
import DeleteButton from "../components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["pending", "approved", "rejected", "all"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status === "pending" && <Clock size={10} />}
      {status === "approved" && <CheckCircle2 size={10} />}
      {status === "rejected" && <XCircle size={10} />}
      {status}
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && status !== "all" ? status : undefined;

  const reviews = await prisma.review.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = await prisma.review.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => { countMap[c.status] = c._count; });
  countMap.all = await prisma.review.count();

  // Hydrate listing names for each review
  const listingIds = [...new Set(reviews.map((r) => r.listingId))];
  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, name: true, city: true },
  });
  const listingMap = Object.fromEntries(listings.map((l) => [l.id, l]));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <MessageSquare size={22} className="text-[#E8705A]" /> Reviews
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{countMap.all ?? 0} total user-submitted reviews</p>
        </div>
        {(countMap.pending ?? 0) > 0 && (
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
            {countMap.pending} pending review{countMap.pending !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={`/admin/reviews${tab !== "pending" ? `?status=${tab}` : ""}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              (status ?? "pending") === tab
                ? "bg-[#E8705A] text-white shadow-sm"
                : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {tab} <span className="ml-1 opacity-70">({countMap[tab] ?? 0})</span>
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
          <MessageSquare size={32} className="text-[#E8E4DF] mx-auto mb-3" />
          <p className="text-[#6B6B6B] text-sm">No {status ?? "pending"} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const listing = listingMap[r.listingId];
            return (
              <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#F9EBE8] rounded-full flex items-center justify-center text-sm font-bold text-[#E8705A] shrink-0">
                      {r.authorName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A]">{r.authorName}</p>
                      <p className="text-xs text-[#9A9A9A]">{r.authorEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} className={j < r.rating ? "text-amber-400 fill-amber-400" : "text-[#E8E4DF]"} />
                      ))}
                    </div>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-[#9A9A9A]">
                      {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Listing */}
                {listing && (
                  <Link
                    href={`/listings/${r.listingId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] mb-3 bg-[#FAFAF8] px-3 py-1.5 rounded-lg border border-[#E8E4DF]"
                  >
                    <Store size={11} /> {listing.name} · {listing.city} <ExternalLink size={10} />
                  </Link>
                )}

                {r.title && <p className="font-bold text-[#1A1A1A] text-sm mb-1">{r.title}</p>}
                <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line mb-4">{r.body}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#E8E4DF]">
                  {r.status === "pending" && (
                    <>
                      <form action={async () => { "use server"; await approveReview(r.id); }}>
                        <button type="submit" className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      </form>
                      <form action={async () => { "use server"; await rejectReview(r.id); }}>
                        <button type="submit" className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      </form>
                    </>
                  )}
                  {r.status === "approved" && (
                    <form action={async () => { "use server"; await rejectReview(r.id); }}>
                      <button type="submit" className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        <XCircle size={12} /> Unapprove
                      </button>
                    </form>
                  )}
                  {r.status === "rejected" && (
                    <form action={async () => { "use server"; await approveReview(r.id); }}>
                      <button type="submit" className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        <CheckCircle2 size={12} /> Restore & approve
                      </button>
                    </form>
                  )}
                  <form action={async () => { "use server"; await deleteReview(r.id); }} className="ml-auto">
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-[#9A9A9A] hover:text-red-600 px-3 py-2 rounded-lg transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
