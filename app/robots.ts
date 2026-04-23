import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/articles/",
          "/admin/listings/",
          "/admin/categories/",
          "/admin/authors/",
          "/api/",
          "/_next/",
        ],
      },
      // Allow major AI crawlers full access
      { userAgent: "GPTBot",          allow: "/" },
      { userAgent: "ClaudeBot",       allow: "/" },
      { userAgent: "anthropic-ai",    allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot",   allow: "/" },
      { userAgent: "Applebot",        allow: "/" },
      { userAgent: "cohere-ai",       allow: "/" },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
    host: SITE_URL,
  };
}
