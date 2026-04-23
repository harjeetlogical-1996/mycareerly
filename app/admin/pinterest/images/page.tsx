import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { deletePinterestImage } from "../../../actions/pinterest";
import { Images, Sparkles, Upload, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ImagesGalleryPage() {
  const images = await prisma.pinterestImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const articleIds = [...new Set(images.map((i) => i.articleId))];
  const articles = articleIds.length ? await prisma.article.findMany({ where: { id: { in: articleIds } } }) : [];
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  // Group by article
  const byArticle = new Map<string, typeof images>();
  for (const img of images) {
    const list = byArticle.get(img.articleId) ?? [];
    list.push(img);
    byArticle.set(img.articleId, list);
  }

  // Usage count per image (for delete confirmation)
  const pins = await prisma.pinterestPin.findMany({
    where: { imageId: { in: images.map((i) => i.id) } },
    select: { imageId: true },
  });
  const usageMap = new Map<string, number>();
  for (const p of pins) if (p.imageId) usageMap.set(p.imageId, (usageMap.get(p.imageId) ?? 0) + 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Images size={22} className="text-[#E60023]" /> Pin Images
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{images.length} custom images across {byArticle.size} article{byArticle.size !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
          <Images size={32} className="text-[#E8E4DF] mx-auto mb-3" />
          <p className="text-sm text-[#6B6B6B]">No custom pin images yet</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Upload or AI-generate from an article&apos;s Pin Composer</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...byArticle.entries()].map(([articleId, imgs]) => {
            const art = articleMap.get(articleId);
            return (
              <div key={articleId} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <Link href={`/admin/pinterest/articles/${articleId}`} className="text-sm font-bold text-[#1A1A1A] hover:text-[#E60023] line-clamp-1">
                      {art?.title ?? "Unknown article"}
                    </Link>
                    <p className="text-xs text-[#6B6B6B]">{imgs.length} image{imgs.length !== 1 ? "s" : ""}</p>
                  </div>
                  <Link href={`/admin/pinterest/articles/${articleId}/new`} className="text-xs font-semibold text-[#E60023] hover:underline">
                    Create pin with these →
                  </Link>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {imgs.map((img) => {
                    const usage = usageMap.get(img.id) ?? 0;
                    return (
                      <div key={img.id} className="relative group">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-[#E8E4DF]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${img.source.startsWith("ai") ? "bg-gradient-to-r from-[#E60023] to-[#E8705A] text-white" : "bg-black/60 text-white"}`}>
                          {img.source === "ai-overlay" ? <><Sparkles size={8} className="inline mr-0.5" />AI+Hook</> : img.source === "ai" ? <><Sparkles size={8} className="inline mr-0.5" />AI</> : <><Upload size={8} className="inline mr-0.5" />upload</>}
                        </span>
                        {usage > 0 && (
                          <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                            used {usage}×
                          </span>
                        )}
                        <form action={async () => { "use server"; await deletePinterestImage(img.id); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="submit" title="Delete image" className="w-6 h-6 rounded-lg bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center">
                            <Trash2 size={10} />
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
