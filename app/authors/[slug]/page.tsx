import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { Clock, Globe, Mail, ArrowRight, BookOpen, User } from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.author.findUnique({ where: { slug } });
  if (!author) return {};
  return {
    title: `${author.name} — Flower Expert`,
    description: author.bio || `Read articles by ${author.name} on MyCareerly. Expert flower care, gifting, and floristry guides.`,
    openGraph: {
      title: `${author.name} | MyCareerly Author`,
      description: author.bio || `Articles by ${author.name}`,
      url: `${SITE_URL}/authors/${slug}`,
      type: "profile",
      ...(author.avatar ? { images: [{ url: author.avatar, width: 400, height: 400, alt: author.name }] } : {}),
    },
    alternates: { canonical: `${SITE_URL}/authors/${slug}` },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await prisma.author.findUnique({ where: { slug } });
  if (!author || !author.active) notFound();

  const articles = await prisma.article.findMany({
    where: { authorName: author.name, status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/authors/${slug}`,
    name: author.name,
    description: author.bio,
    url: `${SITE_URL}/authors/${slug}`,
    ...(author.avatar ? { image: author.avatar } : {}),
    ...(author.email ? { email: author.email } : {}),
    ...(author.specialty ? { jobTitle: author.specialty } : {}),
    ...(author.twitter ? { sameAs: [author.twitter.startsWith("http") ? author.twitter : `https://twitter.com/${author.twitter.replace("@", "")}`] } : {}),
    knowsAbout: ["flower care", "floristry", "flower gifting", "floral arrangements"],
    worksFor: { "@type": "Organization", name: "MyCareerly", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8]">

        {/* Hero */}
        <section className="bg-white border-b border-[#E8E4DF]">
          <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full bg-[#F9EBE8] flex items-center justify-center shrink-0 overflow-hidden border-4 border-white shadow-md">
              {author.avatar ? (
                <Image src={author.avatar} alt={author.name} fill sizes="96px" className="object-cover" priority />
              ) : (
                <span className="text-4xl font-bold text-[#E8705A]">{author.name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-medium text-[#E8705A] mb-1">Author</p>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">{author.name}</h1>
              {author.specialty && (
                <p className="text-sm text-[#6B6B6B] font-medium mb-3">{author.specialty}</p>
              )}
              {author.bio && (
                <p className="text-[#4A4A4A] text-sm leading-relaxed max-w-xl mb-4">{author.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-5 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#1A1A1A]">{articles.length}</p>
                  <p className="text-xs text-[#6B6B6B]">Articles</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {author.email && (
                  <a href={`mailto:${author.email}`}
                    className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] border border-[#E8E4DF] hover:border-[#E8705A] px-3 py-1.5 rounded-lg transition-colors">
                    <Mail size={12} /> Email
                  </a>
                )}
                {author.twitter && (
                  <a href={author.twitter.startsWith("http") ? author.twitter : `https://twitter.com/${author.twitter.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] border border-[#E8E4DF] hover:border-[#E8705A] px-3 py-1.5 rounded-lg transition-colors">
                    𝕏 Twitter
                  </a>
                )}
                {author.instagram && (
                  <a href={author.instagram.startsWith("http") ? author.instagram : `https://instagram.com/${author.instagram.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] border border-[#E8E4DF] hover:border-[#E8705A] px-3 py-1.5 rounded-lg transition-colors">
                    IG Instagram
                  </a>
                )}
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] border border-[#E8E4DF] hover:border-[#E8705A] px-3 py-1.5 rounded-lg transition-colors">
                    <Globe size={12} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <BookOpen size={18} className="text-[#E8705A]" />
            Articles by {author.name}
          </h2>

          {articles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E4DF]">
              <User size={40} className="text-[#E8E4DF] mx-auto mb-3" />
              <p className="text-[#6B6B6B]">No published articles yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => {
                const tags: string[] = (() => { try { return JSON.parse(article.tags); } catch { return []; } })();
                return (
                  <Link key={article.id} href={`/${article.slug}`}
                    className="group flex gap-5 bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden hover:border-[#E8705A]/40 hover:shadow-sm transition-all">
                    {/* Cover */}
                    <div className="relative w-40 shrink-0 bg-[#F4F3F0] overflow-hidden">
                      {article.coverImage ? (
                        <Image src={article.coverImage} alt={article.title} fill sizes="160px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={24} className="text-[#E8E4DF]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-4 pr-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-[#E8705A] bg-[#FEF0ED] px-2 py-0.5 rounded-lg">
                          {article.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#9A9A9A]">
                          <Clock size={11} /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1A1A1A] text-base mb-1.5 group-hover:text-[#E8705A] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-3">{article.excerpt}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#E8705A]">
                        Read article <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
