import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FLOWERS_BY_LETTER, LETTERS, totalFlowerCount } from "../../data/flowers-by-letter";
import { ChevronRight, ChevronLeft, Flower2, BookOpen } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export async function generateStaticParams() {
  return LETTERS.map((letter) => ({ letter }));
}

export async function generateMetadata({ params }: { params: Promise<{ letter: string }> }): Promise<Metadata> {
  const { letter } = await params;
  const L = letter.toLowerCase();
  const flowers = FLOWERS_BY_LETTER[L] ?? [];
  if (!LETTERS.includes(L)) return { title: "Not found" };
  const letterUpper = L.toUpperCase();

  return {
    title: `Flowers That Start With ${letterUpper} — ${flowers.length}+ Names, Types & Meanings`,
    description: `Complete list of ${flowers.length}+ flowers that start with the letter ${letterUpper}. Explore names, meanings, origins, and care tips for every flower beginning with ${letterUpper}.`,
    keywords: `flowers that start with ${L}, flowers beginning with ${letterUpper}, ${letterUpper} flower names, list of flowers starting with ${L}, ${letterUpper} flowers alphabet`,
    openGraph: {
      title: `Flowers That Start With ${letterUpper} | MyCareerly`,
      description: `${flowers.length}+ flowers beginning with ${letterUpper}. Names, meanings, and care tips.`,
      url: `${SITE_URL}/flowers/${L}`,
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}/flowers/${L}` },
  };
}

export default async function LetterPage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const L = letter.toLowerCase();  if (!LETTERS.includes(L)) notFound();

  const flowers = FLOWERS_BY_LETTER[L] ?? [];
  const letterUpper = L.toUpperCase();

  const currentIdx = LETTERS.indexOf(L);
  const prevLetter = currentIdx > 0 ? LETTERS[currentIdx - 1] : null;
  const nextLetter = currentIdx < LETTERS.length - 1 ? LETTERS[currentIdx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Flowers That Start With ${letterUpper}`,
    description: `${flowers.length}+ flowers beginning with the letter ${letterUpper}.`,
    url: `${SITE_URL}/flowers/${L}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Flowers A–Z", item: `${SITE_URL}/all-flower-names-a-to-z-complete-guide` },
        { "@type": "ListItem", position: 3, name: `Start With ${letterUpper}`, item: `${SITE_URL}/flowers/${L}` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: `Flowers starting with ${letterUpper}`,
      numberOfItems: flowers.length,
      itemListElement: flowers.slice(0, 30).map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: f.name,
        description: f.desc,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B] flex-wrap">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/all-flower-names-a-to-z-complete-guide" className="hover:text-[#E8705A] transition-colors">Flowers A–Z</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">Start With {letterUpper}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#F9EBE8] to-white py-14 px-5 md:px-8 border-b border-[#E8E4DF]">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <Flower2 size={11} /> Flower Directory
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
              Flowers That Start With <span className="text-[#E8705A]">{letterUpper}</span>
            </h1>
            <p className="text-[#6B6B6B] text-base max-w-2xl mx-auto leading-relaxed">
              {flowers.length > 0
                ? `Discover ${flowers.length}+ flowers beginning with ${letterUpper} — their names, meanings, origins, and unique characteristics.`
                : `We're curating flowers starting with ${letterUpper}. Check back soon.`}
            </p>
          </div>
        </section>

        {/* A-Z Navigation */}
        <section className="bg-white border-b border-[#E8E4DF] py-5 px-5 md:px-8 sticky top-16 z-30 backdrop-blur-md bg-white/95">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-1.5">
              {LETTERS.map((ltr) => {
                const count = FLOWERS_BY_LETTER[ltr]?.length ?? 0;
                const active = ltr === L;
                return (
                  <Link
                    key={ltr}
                    href={`/flowers/${ltr}`}
                    aria-label={`Flowers starting with ${ltr.toUpperCase()} (${count} flowers)`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      active
                        ? "bg-[#E8705A] text-white shadow-[0_4px_12px_rgba(232,112,90,0.4)]"
                        : count > 0
                          ? "bg-white text-[#4A4A4A] hover:bg-[#FEF0ED] hover:text-[#E8705A] border border-[#E8E4DF]"
                          : "bg-[#F4F3F0] text-[#B0A9A4] border border-[#E8E4DF] cursor-not-allowed"
                    }`}
                  >
                    {ltr.toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">

          {/* Prev/Next + count */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              {prevLetter && (
                <Link
                  href={`/flowers/${prevLetter}`}
                  className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] transition-colors"
                >
                  <ChevronLeft size={14} /> {prevLetter.toUpperCase()}
                </Link>
              )}
            </div>

            <p className="text-sm text-[#6B6B6B] font-medium">
              Showing <span className="text-[#1A1A1A] font-bold">{flowers.length}</span> flower{flowers.length !== 1 ? "s" : ""}
            </p>

            <div>
              {nextLetter && (
                <Link
                  href={`/flowers/${nextLetter}`}
                  className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] transition-colors"
                >
                  {nextLetter.toUpperCase()} <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* Flower list */}
          {flowers.length === 0 ? (
            <div className="bg-white border border-[#E8E4DF] rounded-3xl py-16 px-8 text-center">
              <Flower2 size={36} className="text-[#E8E4DF] mx-auto mb-3" />
              <p className="text-[#6B6B6B] font-semibold mb-1">No flowers listed yet for {letterUpper}</p>
              <p className="text-xs text-[#9A9A9A]">We're continuously expanding our directory — check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {flowers.map((f, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E8705A]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#F9EBE8] rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#E8705A]">{letterUpper}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1A1A1A] mb-1">{f.name}</h3>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Related actions */}
          <section className="mt-16 grid sm:grid-cols-2 gap-4">
            <Link
              href="/all-flower-names-a-to-z-complete-guide"
              className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:border-[#E8705A] hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <BookOpen size={20} className="text-[#E8705A] mb-3" />
              <h3 className="font-bold text-[#1A1A1A] mb-1">Full A–Z Guide</h3>
              <p className="text-sm text-[#6B6B6B]">
                Read our complete guide to all flower names from A to Z with meanings and care tips.
              </p>
              <p className="text-xs font-semibold text-[#E8705A] mt-3 inline-flex items-center gap-1">
                Read the guide <ChevronRight size={11} />
              </p>
            </Link>

            <Link
              href="/listings"
              className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-6 hover:border-[#E8705A] hover:-translate-y-0.5 transition-all"
            >
              <Flower2 size={20} className="text-[#E8705A] mb-3" />
              <h3 className="font-bold text-[#1A1A1A] mb-1">Find a Florist Near You</h3>
              <p className="text-sm text-[#6B6B6B]">
                Browse 500+ verified local flower shops across the USA.
              </p>
              <p className="text-xs font-semibold text-[#E8705A] mt-3 inline-flex items-center gap-1">
                Browse florists <ChevronRight size={11} />
              </p>
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
