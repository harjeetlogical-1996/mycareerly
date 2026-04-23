import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import ArticlesLibrary from "./ArticlesLibrary";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PinterestArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter || "all";
  const q = (sp.q || "").trim().toLowerCase();

  const where: any = { status: "published" };
  if (q) where.title = { contains: q };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Pin counts per article
  const pinCounts = await prisma.pinterestPin.groupBy({
    by: ["articleId", "status"],
    _count: true,
  });
  const statsByArticle: Record<string, { posted: number; queued: number; scheduled: number; failed: number; drafts: number }> = {};
  for (const row of pinCounts) {
    if (!statsByArticle[row.articleId]) statsByArticle[row.articleId] = { posted: 0, queued: 0, scheduled: 0, failed: 0, drafts: 0 };
    const key = row.status === "draft" ? "drafts" : row.status;
    if (statsByArticle[row.articleId][key as keyof typeof statsByArticle[string]] !== undefined) {
      (statsByArticle[row.articleId] as any)[key] = row._count;
    }
  }

  let filtered = articles;
  if (filter === "never") filtered = articles.filter((a) => !statsByArticle[a.id]);
  else if (filter === "pinned") filtered = articles.filter((a) => statsByArticle[a.id]?.posted > 0);
  else if (filter === "failed") filtered = articles.filter((a) => statsByArticle[a.id]?.failed > 0);

  const accounts = await prisma.pinterestAccount.findMany({ where: { active: true } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BookOpen size={22} className="text-[#E60023]" /> Articles Library
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {articles.length} published articles · Bulk-pin existing content or create pin variants per article
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-xl p-1 mb-5 w-fit overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "never", label: "Never pinned" },
          { key: "pinned", label: "Pinned" },
          { key: "failed", label: "Failed" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/admin/pinterest/articles${t.key === "all" ? "" : `?filter=${t.key}`}${q ? `${t.key === "all" ? "?" : "&"}q=${encodeURIComponent(q)}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === t.key ? "bg-[#E60023] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ArticlesLibrary
        articles={filtered.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          coverImage: a.coverImage,
          category: a.category,
          stats: statsByArticle[a.id] || { posted: 0, queued: 0, scheduled: 0, failed: 0, drafts: 0 },
        }))}
        accounts={accounts.map((a) => ({ id: a.id, username: a.username, label: a.label, defaultBoardId: a.defaultBoardId }))}
      />
    </div>
  );
}
