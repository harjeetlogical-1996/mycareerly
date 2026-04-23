import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import TopicsClient from "./TopicsClient";

export const dynamic = "force-dynamic";

const FOCUS_PRESETS = [
  { label: "Mix (balanced)", value: "Mix of topics covering flower care, seasonal guides, wedding florals, gifting ideas, flower meanings, and florist tips" },
  { label: "Flower Care", value: "How to care for specific flowers, extending vase life, fresh-keeping techniques, troubleshooting wilting — US climates" },
  { label: "Seasonal (Fall/Winter 2026)", value: "Seasonal flower trends for Fall/Winter 2026 in the USA, holiday florals, seasonal arrangements" },
  { label: "Wedding Flowers", value: "Wedding floral inspiration, bouquet ideas, ceremony decor, reception florals, budgeting — US weddings" },
  { label: "Gifting Guides", value: "Flower gifting for birthdays, anniversaries, sympathy, apologies, Mother's Day, Valentine's — US occasions" },
  { label: "DIY & Arrangements", value: "DIY flower arrangements for home, beginner tutorials, hosting tablescapes, budget-friendly ideas" },
  { label: "Flower Meanings", value: "Symbolism and meanings of popular flowers, cultural significance, color meanings, Victorian flower language" },
  { label: "Florist Tips", value: "Professional florist techniques, insider tips, industry knowledge, pro tools, trade secrets" },
];

export default async function TopicsPage() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] mb-5">
        <ArrowLeft size={14} /> Back to articles
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={20} className="text-[#E8705A]" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AI Topic Generator</h1>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          AI suggests relevant article topics for MyCareerly. Pick the ones you like, then either queue them on schedule or publish all immediately.
        </p>
      </div>

      <TopicsClient presets={FOCUS_PRESETS} />
    </div>
  );
}
