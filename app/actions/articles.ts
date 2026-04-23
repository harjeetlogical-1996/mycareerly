"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import { getSetting, SETTING_KEYS } from "../lib/settings";
import { postPinInBackground } from "../lib/pinterest/publish";

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function calcReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export async function createArticle(formData: FormData) {
  const title = formData.get("title") as string;
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const content = formData.get("content") as string;

  await prisma.article.create({
    data: {
      slug: makeSlug(title) + "-" + Date.now(),
      title,
      excerpt: formData.get("excerpt") as string,
      content,
      coverImage: formData.get("coverImage") as string,
      category: formData.get("category") as string,
      tags: JSON.stringify(tags),
      authorName: formData.get("authorName") as string,
      authorBio: formData.get("authorBio") as string,
      authorEmail: formData.get("authorEmail") as string,
      status: (formData.get("status") as string) ?? "pending",
      featured: formData.get("featured") === "true",
      readTime: calcReadTime(content),
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
  });

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const content = formData.get("content") as string;

  await prisma.article.update({
    where: { id },
    data: {
      title,
      excerpt: formData.get("excerpt") as string,
      content,
      coverImage: formData.get("coverImage") as string,
      category: formData.get("category") as string,
      tags: JSON.stringify(tags),
      authorName: formData.get("authorName") as string,
      authorBio: formData.get("authorBio") as string,
      authorEmail: formData.get("authorEmail") as string,
      status: formData.get("status") as string,
      featured: formData.get("featured") === "true",
      readTime: calcReadTime(content),
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
}

export async function setArticleStatus(id: string, status: string) {
  await prisma.article.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published"
        ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : undefined,
    },
  });
  if (status === "published") {
    await finalizeArticlePublish(id);
  }
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
}

/**
 * Runs after an article transitions to status=published.
 * When PINTEREST_AUTO_POST_ENABLED=true and there are active PinterestAccounts,
 * queues one pending pin per active account (with category→board mapping if set).
 * Safe to call multiple times — only queues pins for accounts that don't already
 * have a posted/queued pin for this article.
 */
export async function finalizeArticlePublish(articleId: string): Promise<void> {
  try {
    const flag = await getSetting(SETTING_KEYS.PINTEREST_AUTO_POST_ENABLED);
    if (flag !== "true") return;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return;

    const accounts = await prisma.pinterestAccount.findMany({
      where: { active: true, autoPostEnabled: true },
    });
    if (accounts.length === 0) return;

    const tags = (() => {
      try { return JSON.parse(article.tags) as string[]; } catch { return []; }
    })();
    const hashtags = tags.slice(0, 8).map((t) => "#" + t.replace(/\s+/g, "")).join(" ");

    for (const acct of accounts) {
      if (!acct.defaultBoardId) continue;

      // Resolve board via category mapping, else default
      const mapped = await prisma.pinterestBoardMap.findUnique({
        where: { accountId_category: { accountId: acct.id, category: article.category } },
      });
      const boardId = mapped?.boardId || acct.defaultBoardId;

      // Skip if already queued/posted for this (account, article)
      const existing = await prisma.pinterestPin.findFirst({
        where: {
          articleId: article.id,
          accountId: acct.id,
          status: { in: ["queued", "scheduled", "posted"] },
        },
      });
      if (existing) continue;

      const pin = await prisma.pinterestPin.create({
        data: {
          accountId: acct.id,
          articleId: article.id,
          imageId: null,
          title: article.title.slice(0, 100),
          description: article.excerpt || article.title,
          hashtags,
          boardId,
          status: "queued",
        },
      });
      postPinInBackground(pin.id);
    }
  } catch {
    // Never let Pinterest queuing break the publish flow.
  }
}

export async function toggleFeatured(id: string, featured: boolean) {
  await prisma.article.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
}
