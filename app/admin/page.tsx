import Link from "next/link";
import { prisma } from "../lib/prisma";
import { BookOpen, Store, Clock, CheckCircle2, XCircle, Star, TrendingUp, PenLine, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalArticles, pendingArticles, publishedArticles, rejectedArticles,
    totalListings, pendingListings, approvedListings, featuredListings,
    recentArticles, recentListings,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "pending" } }),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "rejected" } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "pending" } }),
    prisma.listing.count({ where: { status: "approved" } }),
    prisma.listing.count({ where: { featured: true } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.listing.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Total Articles", value: totalArticles, icon: BookOpen, color: "#E8705A", bg: "#FEF0ED", link: "/admin/articles" },
    { label: "Pending Articles", value: pendingArticles, icon: Clock, color: "#F59E0B", bg: "#FFFBEB", link: "/admin/articles?status=pending" },
    { label: "Total Listings", value: totalListings, icon: Store, color: "#7A9E7E", bg: "#EDF5EE", link: "/admin/listings" },
    { label: "Pending Listings", value: pendingListings, icon: Clock, color: "#F59E0B", bg: "#FFFBEB", link: "/admin/listings?status=pending" },
    { label: "Published", value: publishedArticles, icon: CheckCircle2, color: "#7A9E7E", bg: "#EDF5EE", link: "/admin/articles?status=published" },
    { label: "Approved Shops", value: approvedListings, icon: CheckCircle2, color: "#7A9E7E", bg: "#EDF5EE", link: "/admin/listings?status=approved" },
    { label: "Rejected", value: rejectedArticles, icon: XCircle, color: "#EF4444", bg: "#FEF2F2", link: "/admin/articles?status=rejected" },
    { label: "Featured Shops", value: featuredListings, icon: Star, color: "#E8705A", bg: "#FEF0ED", link: "/admin/listings" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      published: "bg-green-100 text-green-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Welcome back: here&apos;s what&apos;s happening</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/articles/new" className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <PenLine size={14} /> New Article
          </Link>
          <Link href="/admin/listings" className="inline-flex items-center gap-2 bg-white border border-[#E8E4DF] text-[#1A1A1A] text-sm font-medium px-4 py-2.5 rounded-xl hover:border-[#E8705A] transition-colors">
            <Plus size={14} /> Review Listings
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {(pendingArticles > 0 || pendingListings > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {pendingArticles > 0 && (
            <Link href="/admin/articles?status=pending" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
              <Clock size={14} />
              <strong>{pendingArticles}</strong> article{pendingArticles > 1 ? "s" : ""} waiting for review
            </Link>
          )}
          {pendingListings > 0 && (
            <Link href="/admin/listings?status=pending" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
              <Clock size={14} />
              <strong>{pendingListings}</strong> listing{pendingListings > 1 ? "s" : ""} waiting for approval
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} href={link} className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <TrendingUp size={14} className="text-[#6B6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Articles */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
            <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
              <BookOpen size={16} className="text-[#E8705A]" /> Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-xs text-[#E8705A] hover:underline">View all</Link>
          </div>
          {recentArticles.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#6B6B6B] text-sm">No articles yet</div>
          ) : (
            <div className="divide-y divide-[#E8E4DF]">
              {recentArticles.map((a) => (
                <Link key={a.id} href={`/admin/articles/${a.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors group">
                  {a.coverImage && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      <img src={a.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#E8705A] transition-colors">{a.title}</p>
                    <p className="text-xs text-[#6B6B6B]">{a.authorName} · {a.category}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge(a.status)}`}>
                    {a.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#E8E4DF]">
            <Link href="/admin/articles/new" className="text-xs font-medium text-[#E8705A] hover:underline flex items-center gap-1">
              <PenLine size={11} /> Write new article
            </Link>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
            <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Store size={16} className="text-[#7A9E7E]" /> Recent Listings
            </h2>
            <Link href="/admin/listings" className="text-xs text-[#E8705A] hover:underline">View all</Link>
          </div>
          {recentListings.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#6B6B6B] text-sm">No listings yet</div>
          ) : (
            <div className="divide-y divide-[#E8E4DF]">
              {recentListings.map((l) => {
                const imgs = JSON.parse(l.images) as string[];
                return (
                  <Link key={l.id} href={`/admin/listings/${l.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors group">
                    {imgs[0] && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#E8705A] transition-colors">{l.name}</p>
                      <p className="text-xs text-[#6B6B6B]">{l.city} · {l.phone}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#E8E4DF]">
            <span className="text-xs text-[#6B6B6B]">Submitted via listing form</span>
          </div>
        </div>
      </div>
    </div>
  );
}
