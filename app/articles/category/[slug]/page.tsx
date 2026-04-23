import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return {};
  return {
    title: `${cat.name} Articles`,
    description: cat.description || `Browse all ${cat.name} articles on MyCareerly.`,
    alternates: { canonical: `${SITE_URL}/articles/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug, active: true } });
  if (!cat) notFound();

  const articles = await prisma.article.findMany({
    where: { status: "published", category: cat.name },
    orderBy: { createdAt: "desc" },
  });

  const allCategories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} Articles`,
    description: cat.description || `Browse all ${cat.name} articles on MyCareerly.`,
    url: `${SITE_URL}/articles/category/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/articles` },
        { "@type": "ListItem", position: 3, name: cat.name, item: `${SITE_URL}/articles/category/${slug}` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-[#8A8A8A]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/articles" className="hover:text-[#E8705A] transition-colors">Articles</Link>
            <ChevronRight size={11} />
            <span className="font-medium" style={{ color: cat.color }}>{cat.name}</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-14 px-5 md:px-8 border-b border-[#E8E4DF] bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: cat.color + "20" }}>
                <BookOpen size={24} style={{ color: cat.color }} />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block"
                  style={{ background: cat.color + "15", color: cat.color }}>
                  Category
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">{cat.name}</h1>
                {cat.description && <p className="text-[#6B6B6B] text-base max-w-xl">{cat.description}</p>}
                <p className="text-sm text-[#8A8A8A] mt-2">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
          <div className="grid lg:grid-cols-[1fr_240px] gap-10">

            {/* Articles grid */}
            <div>
              {articles.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen size={40} className="text-[#E8E4DF] mx-auto mb-4" />
                  <p className="text-[#6B6B6B]">No articles in this category yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {articles.map((a) => (
                    <Link key={a.id} href={`/${a.slug}`}
                      className="group bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
                      <div className="relative h-44 overflow-hidden bg-[#F4F3F0]">
                        <Image src={a.coverImage} alt={a.title} fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                          style={{ background: cat.color + "15", color: cat.color }}>
                          {a.category}
                        </span>
                        <h2 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors line-clamp-2 leading-snug mb-2">
                          {a.title}
                        </h2>
                        <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mb-3">{a.excerpt}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#8A8A8A]">
                          <span>{a.authorName}</span>
                          <span className="flex items-center gap-1"><Clock size={9} /> {a.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: other categories */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <h3 className="font-bold text-sm text-[#1A1A1A] mb-3">Browse Categories</h3>
                <div className="space-y-2">
                  {allCategories.map((c) => (
                    <Link key={c.id} href={`/articles/category/${c.slug}`}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${c.slug === slug ? "text-white" : "text-[#6B6B6B] bg-white border border-[#E8E4DF] hover:border-[#E8705A] hover:text-[#E8705A]"}`}
                      style={c.slug === slug ? { background: c.color } : {}}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.slug === slug ? "white" : c.color }} />
                      {c.name}
                    </Link>
                  ))}
                  <Link href="/articles"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6B6B6B] bg-white border border-[#E8E4DF] hover:border-[#E8705A] hover:text-[#E8705A] transition-colors">
                    <BookOpen size={13} /> All Articles
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
