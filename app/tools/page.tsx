import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { Calendar, Droplets, DollarSign, Languages, Sparkles, ChevronRight, Heart } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Free Flower Tools — Interactive Calculators & Guides",
  description: "Free flower tools from MyCareerly: birth flower finder, vase life calculator, wedding budget estimator, and flower meaning translator. Instant, interactive, no signup.",
  keywords: "flower tools, birth flower finder, vase life calculator, wedding flower budget, flower meaning translator, free flower calculators",
  openGraph: {
    title: "Free Flower Tools | MyCareerly",
    description: "4 free interactive flower tools — birth flower finder, vase life calculator, wedding budget, meaning translator.",
    url: `${SITE_URL}/tools`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools` },
};

const TOOLS = [
  {
    icon: Heart,
    title: "Flower Gift Finder",
    desc: "3-step quiz: tell us who, what occasion, and your budget. Get 3 personalized flower recommendations + nearby florists + care tips. Takes 30 seconds.",
    href: "/tools/gift-finder",
    color: "#C95540",
    bg: "#FEF0ED",
    tag: "Featured",
  },
  {
    icon: Calendar,
    title: "Birth Flower Finder",
    desc: "Enter your birthday or pick a month. Discover your primary and secondary birth flowers, their meanings, and cultural significance.",
    href: "/tools/birth-flower",
    color: "#E8705A",
    bg: "#FEF0ED",
    tag: "Most Popular",
  },
  {
    icon: Droplets,
    title: "Vase Life Calculator",
    desc: "Pick your flower and get a personalized care schedule — water temperature, food, retrimming, and florist-tested pro tips to maximize bloom life.",
    href: "/tools/vase-life",
    color: "#7A9E7E",
    bg: "#EDF5EE",
    tag: "Care Tool",
  },
  {
    icon: DollarSign,
    title: "Wedding Flower Budget",
    desc: "Calculate your wedding flower costs based on guest count, style, season, and items. Realistic 2026 US market estimates.",
    href: "/tools/wedding-budget",
    color: "#8B5CF6",
    bg: "#F3E8FF",
    tag: "Planner",
  },
  {
    icon: Languages,
    title: "Flower Meaning Translator",
    desc: "Explore any flower's symbolism across Victorian, Japanese, Chinese, Greek, and Christian traditions. Cultural meanings side-by-side.",
    href: "/tools/flower-meaning",
    color: "#C95540",
    bg: "#F9EBE8",
    tag: "Cultural",
  },
];

export default function ToolsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Flower Tools",
    description: "Interactive tools for flower lovers — birth flowers, vase life, wedding budget, and cultural meanings.",
    url: `${SITE_URL}/tools`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        description: t.desc,
        url: `${SITE_URL}${t.href}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Hero */}
        <section className="py-16 px-5 md:px-8 bg-gradient-to-b from-[#F9EBE8] to-white text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <Sparkles size={11} /> Free · No signup needed
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
              Interactive Flower Tools
            </h1>
            <p className="text-lg text-[#4A4A4A] leading-relaxed">
              Instant tools to help you pick the right flower, extend their life, plan your wedding florals, and decode centuries of symbolism.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-5">
            {TOOLS.map(({ icon: Icon, title, desc, href, color, bg, tag }) => (
              <Link
                key={href}
                href={href}
                className="bg-white border border-[#E8E4DF] rounded-3xl p-7 hover:border-[#E8705A] hover:-translate-y-1 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={26} style={{ color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: bg, color }}
                  >
                    {tag}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#E8705A] transition-colors">{title}</h2>
                <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">{desc}</p>
                <p className="text-sm font-bold text-[#E8705A] inline-flex items-center gap-1">
                  Try it now <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-white border border-[#E8E4DF] rounded-3xl p-8 text-center">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Looking for something else?</h2>
            <p className="text-sm text-[#6B6B6B] mb-5 max-w-md mx-auto">
              Explore our expert guides, 500+ verified florists, or browse our A-Z flower reference.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/articles" className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Browse articles
              </Link>
              <Link href="/listings" className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Find a florist
              </Link>
              <Link href="/all-flower-names-a-to-z-complete-guide" className="inline-flex items-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Flowers A–Z
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
