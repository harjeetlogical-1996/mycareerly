import { prisma } from "../lib/prisma";
import { SITE_URL, absoluteUrl } from "../lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 600;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const now = new Date().toUTCString();

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/${a.slug}`;
      const img = absoluteUrl(a.coverImage || "/images/articles/cover-2-spring-flowers.jpg");
      const pub = a.createdAt ? new Date(a.createdAt).toUTCString() : now;
      const tags = (() => {
        try { return JSON.parse(a.tags) as string[]; } catch { return []; }
      })();
      const categoriesXml = [a.category, ...tags]
        .filter(Boolean)
        .map((c) => `    <category>${escapeXml(c)}</category>`)
        .join("\n");

      return `  <item>
    <title>${cdata(a.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${pub}</pubDate>
    <author>noreply@mycareerly.com (${escapeXml(a.authorName || "MyCareerly")})</author>
    <description>${cdata(a.excerpt || a.title)}</description>
${categoriesXml}
    <enclosure url="${escapeXml(img)}" type="image/jpeg" />
    <media:content url="${escapeXml(img)}" medium="image" />
    <media:thumbnail url="${escapeXml(img)}" />
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>MyCareerly — Flower Articles &amp; Guides</title>
  <link>${SITE_URL}</link>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <description>Expert flower care guides, DIY arrangements, seasonal picks, and wedding inspiration from MyCareerly.</description>
  <language>en-us</language>
  <lastBuildDate>${now}</lastBuildDate>
  <generator>MyCareerly</generator>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
