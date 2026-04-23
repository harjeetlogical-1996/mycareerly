import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { deleteArticle, setArticleStatus, toggleFeatured } from "../../actions/articles";
import { PenLine, Eye, Star, Clock, CheckCircle2, XCircle, Plus, BookOpen, Sparkles, CalendarClock, Lightbulb } from "lucide-react";
import { ARTICLE_CATEGORIES } from "../../data/articles";
import DeleteButton from "../components/DeleteButton";

const STATUS_TABS = ["all", "pending", "published", "rejected"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-amber-100 text-amber-700", text: "Pending", icon: <Clock size={11} /> },
    published: { bg: "bg-green-100 text-green-700", text: "Published", icon: <CheckCircle2 size={11} /> },
    rejected: { bg: "bg-red-100 text-red-700", text: "Rejected", icon: <XCircle size={11} /> },
  };
  const s = map[status] ?? { bg: "bg-gray-100 text-gray-600", text: status, icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg}`}>
      {s.icon}{s.text}
    </span>
  );
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status && sp.status !== "all" ? sp.status : undefined;

  const articles = await prisma.article.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.article.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap: Record<string, number> = { all: articles.length };
  counts.forEach((c) => { countMap[c.status] = c._count; });
  const total = await prisma.article.count();
  countMap.all = total;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BookOpen size={22} className="text-[#E8705A]" /> Articles
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{total} total articles</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/articles/topics"
            className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Lightbulb size={14} /> Topic Ideas
          </Link>
          <Link
            href="/admin/articles/schedule"
            className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <CalendarClock size={14} /> Schedule
          </Link>
          <Link
            href="/admin/articles/generate"
            className="inline-flex items-center gap-2 bg-[#F9EBE8] hover:bg-[#fde1db] text-[#E8705A] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Sparkles size={14} /> AI Generate
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={14} /> New Article
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={`/admin/articles${tab !== "all" ? `?status=${tab}` : ""}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              (sp.status ?? "all") === tab
                ? "bg-[#E8705A] text-white shadow-sm"
                : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {tab} {countMap[tab] !== undefined && <span className="ml-1 opacity-70">({countMap[tab] ?? 0})</span>}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen size={32} className="text-[#E8E4DF] mx-auto mb-3" />
            <p className="text-[#6B6B6B] text-sm">No articles found</p>
            <Link href="/admin/articles/new" className="mt-3 inline-flex items-center gap-1 text-sm text-[#E8705A] hover:underline">
              <Plus size={13} /> Create the first one
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#FAFAF8]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Article</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell">Author</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell">Featured</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-[#FAFAF8] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {article.coverImage && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                          <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#1A1A1A] line-clamp-1 max-w-xs">{article.title}</p>
                        <p className="text-xs text-[#6B6B6B]">{article.readTime} · {article.publishedAt || "Draft"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="bg-[#F9EBE8] text-[#E8705A] text-xs font-medium px-2 py-0.5 rounded-full">{article.category}</span>
                  </td>
                  <td className="px-4 py-4 text-[#6B6B6B] text-xs hidden lg:table-cell">{article.authorName}</td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-4 text-center hidden lg:table-cell">
                    <form action={async () => { "use server"; await toggleFeatured(article.id, !article.featured); }}>
                      <button type="submit" className={`${article.featured ? "text-amber-400" : "text-[#E8E4DF] hover:text-amber-300"} transition-colors`}>
                        <Star size={16} className={article.featured ? "fill-amber-400" : ""} />
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Publish / Reject quick actions */}
                      {article.status === "pending" && (
                        <>
                          <form action={async () => { "use server"; await setArticleStatus(article.id, "published"); }}>
                            <button type="submit" title="Publish" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors">
                              <CheckCircle2 size={13} />
                            </button>
                          </form>
                          <form action={async () => { "use server"; await setArticleStatus(article.id, "rejected"); }}>
                            <button type="submit" title="Reject" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                              <XCircle size={13} />
                            </button>
                          </form>
                        </>
                      )}
                      {article.status === "published" && (
                        <Link href={`/${article.slug}`} target="_blank" title="View" className="w-7 h-7 rounded-lg bg-[#F9EBE8] hover:bg-[#E8705A]/20 text-[#E8705A] flex items-center justify-center transition-colors">
                          <Eye size={13} />
                        </Link>
                      )}
                      <Link href={`/admin/articles/${article.id}`} title="Edit" className="w-7 h-7 rounded-lg bg-[#FAFAF8] hover:bg-[#E8E4DF] text-[#6B6B6B] flex items-center justify-center transition-colors">
                        <PenLine size={13} />
                      </Link>
                      <form action={async () => { "use server"; await deleteArticle(article.id); }}>
                        <DeleteButton message="Delete this article?" />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
