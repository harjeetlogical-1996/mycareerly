import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rules — applies to all crawlers (including Googlebot)
      {
        userAgent: "*",
        allow: "/",
        // Block sensitive / private URL spaces. /admin/ covers all sub-paths,
        // no need to list /admin/articles/, /admin/listings/, etc. separately.
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/_next/",
        ],
      },
      // Explicit allow for AI crawlers — same default access as humans.
      // Listed separately so the AI tools can see they're welcome
      // (some refuse to crawl when only the wildcard is present).
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "PerplexityBot",
          "Applebot",
          "cohere-ai",
        ],
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
        ],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
    // Note: 'host:' directive is intentionally omitted. It's a Yandex /
    // Mail.ru extension; Googlebot logs it as 'Rule ignored' which can
    // surface as a warning in Search Console. Canonical host preference
    // is communicated via <link rel=canonical> + 301 redirects instead.
  };
}
