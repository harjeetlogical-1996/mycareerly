import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";
import GenerateForm from "./GenerateForm";

export const dynamic = "force-dynamic";

export default async function GenerateArticlePage() {
  const [categoriesCount, authorsCount] = await Promise.all([
    prisma.category.count({ where: { active: true } }),
    prisma.author.count({ where: { active: true } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] mb-5">
        <ArrowLeft size={14} /> Back to articles
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-[#E8705A]" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AI Article Generator</h1>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          Just drop a title. AI auto-picks the best category, matches the right author, and generates a complete 1300-word SEO/AEO/GEO-optimized article in MyCareerly's signature format — including meta tags, FAQs, and tags.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
            <GenerateForm />
            {(categoriesCount === 0 || authorsCount === 0) && (
              <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                ⚠️ {categoriesCount === 0 && "No categories configured. "}
                {authorsCount === 0 && "No authors configured. "}
                AI will use defaults — <a href="/admin/categories" className="underline">add categories</a> and{" "}
                <a href="/admin/authors" className="underline">authors</a> for better results.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/articles/schedule"
            className="block bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Clock size={16} className="text-[#E8705A]" />
              <p className="font-semibold text-[#1A1A1A] text-sm">Bulk Schedule</p>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Queue multiple article titles to auto-generate daily (2–3 per day). Set and forget.
            </p>
          </Link>

          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <p className="font-semibold text-[#1A1A1A] text-sm mb-2">Tips for Best Results</p>
            <ul className="text-xs text-[#6B6B6B] space-y-1.5 list-disc pl-4">
              <li>Specific titles work best: "How to Grow Peonies in Zone 6" beats "Peonies"</li>
              <li>Add references for unique angle ("focus on seasonal weddings")</li>
              <li>Choose the right category — it shapes the tone</li>
              <li>Review before publishing — AI is great but not perfect</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
