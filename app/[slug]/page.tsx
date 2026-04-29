import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { Clock, ArrowLeft, ChevronRight, ArrowRight, Tag, BookOpen, User } from "lucide-react";
import ShareButton from "./ShareButton";
import PinItButton from "../components/PinItButton";
import { SITE_URL, absoluteUrl } from "../lib/site";

export const dynamic = "force-dynamic";

const CAT_COLOR: Record<string, { text: string; bg: string }> = {
  "Care Guide":  { text: "#7A9E7E", bg: "#EDF5EE" },
  "Seasonal":    { text: "#E8705A", bg: "#FEF0ED" },
  "DIY":         { text: "#C95540", bg: "#FEF0ED" },
  "Wedding":     { text: "#C95540", bg: "#FEF0ED" },
  "Gifting":     { text: "#E8705A", bg: "#FEF0ED" },
  "Expert Tips": { text: "#7A9E7E", bg: "#EDF5EE" },
  "Stories":     { text: "#7A9E7E", bg: "#EDF5EE" },
};

function cleanText(t: string) {
  return t
    .replace(/ — /g, " ")
    .replace(/ —/g, " ")
    .replace(/— /g, " ")
    .replace(/—/g, " ");
}

function renderInline(text: string) {
  return cleanText(text)
    // Markdown links — open in new tab for internal + external alike
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      const isExternal = /^https?:\/\//i.test(url);
      const rel = isExternal ? 'rel="noopener noreferrer"' : 'rel="noopener"';
      return `<a href="${url}" target="_blank" ${rel} class="text-[#E8705A] font-medium hover:text-[#C95540] underline decoration-[#E8705A]/30 underline-offset-2 hover:decoration-[#E8705A] transition-colors">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class=\"bg-[#F3F0ED] px-1.5 py-0.5 rounded text-sm font-mono text-[#C95540]\">$1</code>");
}

// Parse a heading line to check if it's wrapped in a link: "[Text](url)"
// Returns { text, url } if it's a linked heading, else { text: original, url: null }
function parseLinkedHeading(raw: string): { text: string; url: string | null } {
  const m = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
  if (m) return { text: m[1], url: m[2] };
  return { text: raw, url: null };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug, status: "published" } });
  if (!article) return {};

  const tags = JSON.parse(article.tags) as string[];
  const imageUrl = article.coverImage.startsWith("http")
    ? article.coverImage
    : `${SITE_URL}${article.coverImage}`;

  const cleanTitle = cleanText(article.title);
  const cleanExcerpt = cleanText(article.excerpt);
  const keywordsSet = [...new Set([...tags, "flowers", "mycareerly", "local florist", article.category])];

  return {
    title: cleanTitle,
    description: cleanExcerpt,
    keywords: keywordsSet.join(", "),
    authors: [{ name: article.authorName }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: cleanTitle,
      description: cleanExcerpt,
      url: `${SITE_URL}/${article.slug}`,
      siteName: "MyCareerly",
      locale: "en_US",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: cleanTitle }],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.authorName],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanExcerpt,
      images: [imageUrl],
      creator: "@mycareerly",
    },
    alternates: {
      canonical: `${SITE_URL}/${article.slug}`,
    },
  };
}

function renderContent(raw: string) {
  const content = cleanText(raw);
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  const toc: { id: string; text: string }[] = [];
  let i = 0;
  let faqItems: { q: string; a: string }[] = [];
  let inFaq = false;
  let currentQ = "";
  let paraBuffer: string[] = [];

  function flushParas() {
    if (paraBuffer.length === 0) return;
    paraBuffer.forEach((html, idx) => {
      elements.push(
        <p key={`p-${i}-${idx}`} className="text-[#3D3D3D] text-[1.05rem] leading-[1.95] mb-5"
          dangerouslySetInnerHTML={{ __html: html }} />
      );
    });
    paraBuffer = [];
  }

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  while (i < lines.length) {
    const raw_line = lines[i];
    const line = raw_line.trim();

    if (!line) { flushParas(); i++; continue; }

    if (line.startsWith("![")) {
      flushParas();
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        const [, alt, src] = match;
        const cleanAlt = cleanText(alt);
        elements.push(
          <figure key={`img-${i}`} className="my-8 rounded-2xl overflow-hidden shadow-sm border border-[#E8E4DF]">
            <img src={src} alt={cleanAlt} className="w-full object-cover" loading="lazy" decoding="async" />
            {cleanAlt && (
              <figcaption className="text-center text-xs text-[#8A8A8A] px-4 py-2.5 bg-[#FAFAF8] italic">
                {cleanAlt}
              </figcaption>
            )}
          </figure>
        );
      }
      i++; continue;
    }

    if (line.startsWith("## ")) {
      flushParas();
      const heading = line.slice(3);
      if (heading.trim() === "FAQ") {
        inFaq = true;
        const id = "faq";
        toc.push({ id, text: "Frequently Asked Questions" });
        elements.push(
          <div key={`faq-header-${i}`} id={id} className="mt-12 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-6 rounded-full bg-[#E8705A]" />
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
            </div>
            <p className="text-sm text-[#8A8A8A] ml-4">Quick answers to common questions</p>
          </div>
        );
        i++; continue;
      }
      inFaq = false;
      const parsed = parseLinkedHeading(heading);
      const id = slugify(parsed.text);
      toc.push({ id, text: parsed.text });
      elements.push(
        <div key={`h2-${i}`} id={id} className="mt-12 mb-4 flex items-start gap-3 scroll-mt-24">
          <div className="w-1 h-7 rounded-full bg-[#E8705A] mt-0.5 shrink-0" />
          {parsed.url ? (
            <h2 className="text-2xl font-bold leading-snug">
              <a
                href={parsed.url}
                target="_blank"
                rel="noopener"
                className="text-[#1A1A1A] hover:text-[#E8705A] transition-colors inline-flex items-center gap-2 group"
              >
                {parsed.text}
                <span className="text-[#E8705A] text-lg opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">↗</span>
              </a>
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-[#1A1A1A] leading-snug">{parsed.text}</h2>
          )}
        </div>
      );
      i++; continue;
    }

    if (line.startsWith("### ")) {
      flushParas(); inFaq = false;
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-lg font-bold text-[#1A1A1A] mt-7 mb-3 pl-4 border-l-2 border-[#E8E4DF]"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }}
        />
      );
      i++; continue;
    }

    if (line.startsWith("#### ")) {
      flushParas();
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-base font-bold text-[#1A1A1A] mt-5 mb-2"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(5)) }}
        />
      );
      i++; continue;
    }

    if (inFaq && line.startsWith("**Q:")) {
      currentQ = cleanText(line.replace(/^\*\*Q:\s*/, "").replace(/\*\*$/, ""));
      i++; continue;
    }

    if (inFaq && line.startsWith("A:") && currentQ) {
      const answer = cleanText(line.slice(2).trim());
      faqItems.push({ q: currentQ, a: answer });
      elements.push(
        <details key={`faq-${i}`} className="mb-3 border border-[#E8E4DF] rounded-2xl overflow-hidden group">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none bg-[#FAFAF8] hover:bg-[#FEF0ED] transition-colors">
            <span className="font-semibold text-[0.95rem] text-[#1A1A1A] pr-4">{currentQ}</span>
            <span className="w-5 h-5 rounded-full bg-[#E8705A] text-white flex items-center justify-center text-sm shrink-0 font-bold group-open:rotate-45 transition-transform duration-200">+</span>
          </summary>
          <div className="px-5 py-4 bg-white text-sm text-[#4A4A4A] leading-relaxed border-t border-[#E8E4DF]">{answer}</div>
        </details>
      );
      currentQ = ""; i++; continue;
    }

    if (inFaq) { i++; continue; }

    if (line.startsWith("> ")) {
      flushParas();
      elements.push(
        <blockquote key={`bq-${i}`} className="my-6 pl-5 pr-4 py-4 border-l-4 border-[#E8705A] bg-[#FEF0ED] rounded-r-2xl">
          <p className="text-[#4A4A4A] italic leading-relaxed text-[0.95rem]"
            dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
        </blockquote>
      );
      i++; continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParas();
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        items.push(lines[i].trim().slice(2)); i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-2.5 my-5 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-[#3D3D3D] text-[1.02rem] leading-relaxed">
              <span className="w-1.5 h-1.5 bg-[#E8705A] rounded-full mt-[0.6rem] shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      flushParas();
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, "")); i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-2.5 my-5 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-[#3D3D3D] text-[1.02rem] leading-relaxed">
              <span className="w-5 h-5 bg-[#F9EBE8] text-[#E8705A] rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("| ")) {
      flushParas();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().split("|").filter(Boolean).map((c) => c.trim());
        if (!cells.every((c) => /^[-:]+$/.test(c))) rows.push(cells);
        i++;
      }
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-7 rounded-2xl border border-[#E8E4DF] shadow-sm">
          <table className="w-full border-collapse text-sm min-w-[400px]">
            <thead>
              <tr className="bg-[#F9EBE8]">
                {rows[0]?.map((h, j) => (
                  <th key={j} className="text-left px-4 py-3 font-semibold text-[#1A1A1A] border-b border-[#E8E4DF] first:rounded-tl-2xl last:rounded-tr-2xl">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className={`border-b border-[#E8E4DF] last:border-0 ${ri % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"} hover:bg-[#FEF0ED] transition-colors`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-[#4A4A4A]" dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
      flushParas();
      elements.push(
        <p key={`bold-${i}`} className="font-semibold text-[#1A1A1A] mt-6 mb-2 text-[1.02rem]">
          {cleanText(line.slice(2, -2))}
        </p>
      );
      i++; continue;
    }

    paraBuffer.push(renderInline(line));
    i++;
  }

  flushParas();
  return { elements, faqItems, toc };
}

function buildJsonLd(
  article: { title: string; excerpt: string; coverImage: string; authorName: string; authorBio: string; publishedAt: string; slug: string; readTime: string; category: string },
  tags: string[],
  faqItems: { q: string; a: string }[],
  toc: { id: string; text: string }[]
) {
  const imageUrl = article.coverImage.startsWith("http") ? article.coverImage : `${SITE_URL}${article.coverImage}`;
  const cleanTitle = cleanText(article.title);
  const cleanExcerpt = cleanText(article.excerpt);

  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: cleanTitle,
      description: cleanExcerpt,
      image: imageUrl,
      keywords: [...tags, "flowers", "mycareerly"].join(", "),
      articleSection: article.category,
      author: { "@type": "Person", name: article.authorName, description: article.authorBio },
      publisher: { "@type": "Organization", name: "MyCareerly", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/${article.slug}` },
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".article-excerpt", ".article-body h2", ".article-body p"] },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/articles` },
        { "@type": "ListItem", position: 3, name: cleanTitle, item: `${SITE_URL}/${article.slug}` },
      ],
    },
  ];

  if (faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }

  if (toc.length >= 3) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Sections in: ${cleanTitle}`,
      itemListElement: toc.map((item, idx) => ({ "@type": "ListItem", position: idx + 1, name: item.text, url: `${SITE_URL}/${article.slug}#${item.id}` })),
    });
  }

  return schemas;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug, status: "published" } });
  if (!article) notFound();

  const tags = JSON.parse(article.tags) as string[];

  const relatedDb = await prisma.article.findMany({
    where: { status: "published", slug: { not: article.slug }, category: article.category },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  const related = relatedDb.map((a) => ({ ...a, tags: JSON.parse(a.tags) as string[] }));

  const authorRecord = await prisma.author.findFirst({ where: { name: article.authorName, active: true } });

  const cat = CAT_COLOR[article.category] ?? { text: "#E8705A", bg: "#FEF0ED" };
  const { elements, faqItems, toc } = renderContent(article.content);
  const jsonLd = buildJsonLd(article, tags, faqItems, toc);
  const cleanTitle = cleanText(article.title);
  const cleanExcerpt = cleanText(article.excerpt);

  return (
    <>
      {jsonLd.map((schema, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <Navbar />

      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-[#8A8A8A] flex-wrap">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/articles" className="hover:text-[#E8705A] transition-colors">Articles</Link>
            <ChevronRight size={11} />
            <Link href={`/articles?category=${encodeURIComponent(article.category)}`}
              className="hover:text-[#E8705A] transition-colors">{article.category}</Link>
            <ChevronRight size={11} />
            <span className="text-[#1A1A1A] font-medium truncate max-w-[200px] sm:max-w-xs">{cleanTitle}</span>
          </div>
        </nav>

        {/* Hero */}
        <header className="relative h-[50vh] min-h-[340px] max-h-[520px] overflow-hidden">
          <Image src={article.coverImage} alt={cleanTitle} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-8 pb-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                  style={{ background: cat.text }}>{article.category}</span>
                <span className="text-white/60 text-xs flex items-center gap-1">
                  <Clock size={10} /> {article.readTime}
                </span>
              </div>
              <h1 className="text-3xl md:text-[2.6rem] font-bold text-white leading-tight tracking-tight max-w-3xl">
                {cleanTitle}
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
          <div className="grid lg:grid-cols-[1fr_300px] gap-10">

            {/* Left: Article */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Link href="/articles"
                  className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] transition-colors font-medium">
                  <ArrowLeft size={14} /> Back to Articles
                </Link>
                <div className="flex items-center gap-2">
                  <PinItButton
                    url={`${SITE_URL}/${article.slug}`}
                    media={absoluteUrl(article.coverImage)}
                    description={cleanText(article.title)}
                  />
                  <ShareButton />
                </div>
              </div>

              {/* Author card */}
              <div className="bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 mb-8 flex-wrap shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#F9EBE8] rounded-full flex items-center justify-center text-base font-bold text-[#E8705A] shrink-0 overflow-hidden">
                    {authorRecord?.avatar
                      ? <Image src={authorRecord.avatar} alt={article.authorName} width={44} height={44} className="w-full h-full object-cover" />
                      : article.authorName[0]}
                  </div>
                  <div>
                    {authorRecord
                      ? <Link href={`/authors/${authorRecord.slug}`} className="font-semibold text-sm text-[#1A1A1A] hover:text-[#E8705A] transition-colors">{article.authorName}</Link>
                      : <p className="font-semibold text-sm text-[#1A1A1A]">{article.authorName}</p>}
                    <p className="text-xs text-[#8A8A8A] max-w-xs leading-snug">{article.authorBio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8A8A8A] shrink-0">
                  <span>{article.publishedAt}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="article-excerpt text-[1.1rem] text-[#4A4A4A] leading-relaxed mb-8 border-l-4 border-[#E8705A] pl-5 bg-gradient-to-r from-[#FEF0ED] to-transparent py-4 pr-4 rounded-r-2xl italic font-[450]">
                {cleanExcerpt}
              </p>

              {/* Content */}
              <article className="article-body">{elements}</article>

              {/* Tags */}
              <div className="mt-10 pt-6 border-t border-[#E8E4DF]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={13} className="text-[#8A8A8A]" />
                  {tags.map((tag) => (
                    <Link key={tag} href={`/articles?tag=${encodeURIComponent(tag)}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#E8E4DF] text-[#6B6B6B] hover:border-[#E8705A] hover:text-[#E8705A] hover:bg-[#FEF0ED] transition-colors">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Author bio */}
              <div className="mt-8 bg-white border border-[#E8E4DF] rounded-2xl p-6 flex gap-4 shadow-sm">
                <div className="w-14 h-14 bg-[#F9EBE8] rounded-full flex items-center justify-center text-xl font-bold text-[#E8705A] shrink-0 overflow-hidden">
                  {authorRecord?.avatar
                    ? <Image src={authorRecord.avatar} alt={article.authorName} width={56} height={56} className="w-full h-full object-cover" />
                    : article.authorName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-[#E8705A] uppercase tracking-widest mb-1">Written by</p>
                  {authorRecord
                    ? <Link href={`/authors/${authorRecord.slug}`} className="font-bold text-[#1A1A1A] hover:text-[#E8705A] transition-colors mb-1.5 block">{article.authorName}</Link>
                    : <p className="font-bold text-[#1A1A1A] mb-1.5">{article.authorName}</p>}
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{article.authorBio}</p>
                  {authorRecord && (
                    <Link href={`/authors/${authorRecord.slug}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#E8705A] hover:underline">
                      View all articles by {article.authorName} →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden space-y-4 pr-0.5 scrollbar-thin">

                {toc.length > 2 && (
                  <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={15} className="text-[#E8705A]" />
                      <h3 className="font-bold text-sm text-[#1A1A1A]">Table of Contents</h3>
                    </div>
                    <nav>
                      <ol className="space-y-1.5">
                        {toc.map((item, idx) => (
                          <li key={item.id}>
                            <a href={`#${item.id}`}
                              className="flex items-start gap-2 text-xs text-[#6B6B6B] hover:text-[#E8705A] transition-colors leading-snug group">
                              <span className="w-4 h-4 rounded-full bg-[#F9EBE8] text-[#E8705A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 group-hover:bg-[#E8705A] group-hover:text-white transition-colors">
                                {idx + 1}
                              </span>
                              <span className="flex-1">{item.text}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  </div>
                )}

                <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-[#1A1A1A] mb-4">Article Details</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Category", value: article.category },
                      { label: "Published", value: article.publishedAt },
                      { label: "Read Time", value: article.readTime },
                      { label: "Author", value: article.authorName },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm gap-2">
                        <span className="text-[#8A8A8A] shrink-0">{label}</span>
                        <span className="font-medium text-[#1A1A1A] text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E8E4DF]">
                    <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cat.bg, color: cat.text }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#E8705A] to-[#C95540] rounded-2xl p-5 text-white shadow-md">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <User size={17} className="text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">Find a Local Florist</h3>
                  <p className="text-white/80 text-xs leading-relaxed mb-4">Browse verified flower shops near you across 50+ US cities.</p>
                  <Link href="/listings"
                    className="inline-flex items-center gap-1.5 bg-white text-[#E8705A] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#FEF0ED] transition-colors">
                    Browse Shops <ArrowRight size={12} />
                  </Link>
                </div>

                {related.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A] mb-3">Related Articles</h3>
                    <div className="space-y-3">
                      {related.map((a) => (
                        <Link key={a.id} href={`/${a.slug}`}
                          className="group flex gap-3 bg-white border border-[#E8E4DF] rounded-2xl p-3 hover:border-[#E8705A] transition-colors shadow-sm">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <Image src={a.coverImage} alt={cleanText(a.title)} fill sizes="64px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#E8705A] transition-colors">
                              {cleanText(a.title)}
                            </p>
                            <p className="text-[10px] text-[#8A8A8A] mt-1 flex items-center gap-1">
                              <Clock size={9} /> {a.readTime}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="mt-16 pt-10 border-t border-[#E8E4DF]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider mb-1">Read More</p>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">More in {article.category}</h2>
                </div>
                <Link href="/articles" className="inline-flex items-center gap-1 text-sm font-medium text-[#E8705A] hover:gap-2 transition-all">
                  All Articles <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {related.map((a) => (
                  <Link key={a.id} href={`/${a.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E8E4DF] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={a.coverImage} alt={cleanText(a.title)} fill sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                        style={{ background: cat.bg, color: cat.text }}>{a.category}</span>
                      <p className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors line-clamp-2 leading-snug">
                        {cleanText(a.title)}
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-2 flex items-center gap-1">
                        <Clock size={10} /> {a.readTime}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
