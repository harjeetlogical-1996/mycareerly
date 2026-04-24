"use server";

import { prisma } from "../lib/prisma";
import {
  generateArticle,
  autoSelectCategoryAndAuthor,
  generateTopicIdeas,
  generateArticleImages,
} from "../lib/generateArticle";
import { addInternalLinks } from "../lib/internalLinker";
import { finalizeArticlePublish } from "./articles";
import { revalidatePath } from "next/cache";

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

async function getAuthorBio(authorName: string) {
  const a = await prisma.author.findFirst({ where: { name: authorName, active: true } });
  return { bio: a?.bio ?? "", email: a?.email ?? "" };
}

const DEFAULT_COVER = "/images/articles/cover-2-spring-flowers.jpg";

// Shared: generate full article + all images, return complete DB-ready payload
async function generateFullArticlePayload(opts: {
  title: string;
  reference: string;
  category: string;
  author: string;
}) {
  const gen = await generateArticle(opts.title, opts.reference, opts.category);
  const slug = await uniqueSlug(gen.slug || toSlug(gen.title));

  // Generate images (cover + inline). Runs in parallel and is optimized in-place.
  const imgs = await generateArticleImages(slug, gen.content);

  // Require at least one successfully-generated image before the article can be
  // auto-published. If Gemini/Imagen quota is exhausted or the API key is stale,
  // we don't want to ship articles with only the default stock cover.
  const imagesOk = imgs.totalGenerated > 0;

  const { bio, email } = await getAuthorBio(opts.author);

  // Fall back to a known-good cover only when genuinely generating images failed.
  const coverImage = imgs.coverImage || DEFAULT_COVER;

  // Add 2 internal links to related existing articles
  const linked = await addInternalLinks({
    title: gen.title,
    tags: JSON.stringify(gen.tags),
    category: opts.category,
    content: imgs.updatedContent,
    maxLinks: 2,
  });

  return {
    slug,
    imagesOk,
    articleData: {
      slug,
      title: gen.title,
      excerpt: gen.excerpt,
      content: linked.content,
      coverImage,
      tags: JSON.stringify(gen.tags),
      authorName: opts.author,
      authorBio: bio,
      authorEmail: email,
      readTime: gen.readTime,
      metaTitle: gen.metaTitle,
      metaDescription: gen.metaDescription,
      keywords: gen.keywords,
      faqs: JSON.stringify(gen.faqs),
    },
    imageStats: imgs,
  };
}

export async function generateNow(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const reference = (formData.get("reference") as string)?.trim() ?? "";
  const publishNow = formData.get("publishNow") !== null;

  if (!title) return { success: false, error: "Title is required" };

  try {
    // Load categories and authors from DB
    const [categories, authors] = await Promise.all([
      prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    ]);

    // AI picks best category + author
    const { category, author } = await autoSelectCategoryAndAuthor(
      title,
      categories.map((c) => c.name),
      authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
    );

    // Generate full article + all images
    const { articleData, imageStats, imagesOk } = await generateFullArticlePayload({
      title, reference, category, author,
    });

    // Safety net: if every image generation failed (e.g., Gemini/Imagen quota
    // exhausted, API key stale), never auto-publish — hold the article in
    // 'pending' so the admin sees it and can retry or swap covers manually.
    const finalStatus = publishNow && imagesOk ? "published" : "pending";

    const created = await prisma.article.create({
      data: {
        ...articleData,
        category,
        status: finalStatus,
        featured: false,
        publishedAt: finalStatus === "published" ? new Date().toISOString().split("T")[0] : "",
      },
    });
    if (finalStatus === "published") await finalizeArticlePublish(created.id);

    revalidatePath("/admin/articles");
    return {
      success: true,
      articleId: created.id,
      slug: created.slug,
      pickedCategory: category,
      pickedAuthor: author,
      imagesGenerated: imageStats.totalGenerated,
      imagesRequested: imageStats.totalRequested,
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Generation failed" };
  }
}

export async function suggestTopics(formData: FormData) {
  const focus = (formData.get("focus") as string)?.trim() ?? "";
  const count = Math.min(30, Math.max(3, parseInt((formData.get("count") as string) ?? "10", 10)));

  try {
    const existing = await prisma.article.findMany({
      select: { title: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
    const topics = await generateTopicIdeas(focus, count, existing.map((e) => e.title));
    return { success: true, topics };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to generate topics" };
  }
}

export async function queueSelectedTopics(formData: FormData) {
  const raw = formData.getAll("titles") as string[];
  const titles = raw.map((t) => t.trim()).filter(Boolean);
  const perDay = parseInt((formData.get("perDay") as string) ?? "3", 10);
  const startDateStr = (formData.get("startDate") as string) ?? new Date().toISOString().split("T")[0];

  if (titles.length === 0) return { success: false, error: "No topics selected" };

  const startDate = new Date(startDateStr);
  let scheduled = 0;

  for (let i = 0; i < titles.length; i++) {
    const dayOffset = Math.floor(i / perDay);
    const slotInDay = i % perDay;
    const when = new Date(startDate);
    when.setDate(when.getDate() + dayOffset);
    when.setHours(9 + slotInDay * 4, 0, 0, 0);

    await prisma.scheduledArticle.create({
      data: {
        title: titles[i],
        reference: "",
        category: "auto",
        authorName: "auto",
        scheduledFor: when,
        status: "pending",
      },
    });
    scheduled++;
  }

  revalidatePath("/admin/articles/schedule");
  revalidatePath("/admin/articles/topics");
  return { success: true, scheduled };
}

export async function publishSelectedTopicsNow(formData: FormData) {
  const raw = formData.getAll("titles") as string[];
  const titles = raw.map((t) => t.trim()).filter(Boolean);

  if (titles.length === 0) return { success: false, error: "No topics selected" };

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const title of titles) {
    try {
      const { category, author } = await autoSelectCategoryAndAuthor(
        title,
        categories.map((c) => c.name),
        authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
      );

      const { articleData, imagesOk } = await generateFullArticlePayload({
        title, reference: "", category, author,
      });

      const bulkStatus = imagesOk ? "published" : "pending";
      const createdBulk = await prisma.article.create({
        data: {
          ...articleData,
          category,
          status: bulkStatus,
          featured: false,
          publishedAt: bulkStatus === "published" ? new Date().toISOString().split("T")[0] : "",
        },
      });
      if (bulkStatus === "published") await finalizeArticlePublish(createdBulk.id);
      succeeded++;
    } catch (e: any) {
      failed++;
      errors.push(`"${title.slice(0, 40)}": ${e.message?.slice(0, 80) ?? "unknown"}`);
    }
  }

  revalidatePath("/admin/articles");
  return { success: true, succeeded, failed, total: titles.length, errors };
}

export async function scheduleArticles(formData: FormData) {
  const rawTitles = (formData.get("titles") as string)?.trim();
  const rawReferences = (formData.get("references") as string)?.trim() ?? "";
  const perDay = parseInt((formData.get("perDay") as string) ?? "2", 10);
  const startDateStr = (formData.get("startDate") as string) ?? new Date().toISOString().split("T")[0];

  if (!rawTitles) return { success: false, error: "At least one title is required" };

  const titles = rawTitles.split("\n").map((t) => t.trim()).filter(Boolean);
  const references = rawReferences.split("\n").map((t) => t.trim());

  if (titles.length === 0) return { success: false, error: "No valid titles provided" };

  const startDate = new Date(startDateStr);
  let scheduled = 0;

  for (let i = 0; i < titles.length; i++) {
    const dayOffset = Math.floor(i / perDay);
    const slotInDay = i % perDay;
    const when = new Date(startDate);
    when.setDate(when.getDate() + dayOffset);
    when.setHours(9 + slotInDay * 4, 0, 0, 0);

    await prisma.scheduledArticle.create({
      data: {
        title: titles[i],
        reference: references[i] ?? "",
        category: "auto", // AI will pick at generation time
        authorName: "auto",
        scheduledFor: when,
        status: "pending",
      },
    });
    scheduled++;
  }

  revalidatePath("/admin/articles/schedule");
  return { success: true, scheduled };
}

export async function deleteScheduled(id: string) {
  await prisma.scheduledArticle.delete({ where: { id } });
  revalidatePath("/admin/articles/schedule");
  return { success: true };
}

// Publish a single scheduled item immediately, bypassing the schedule time
export async function publishScheduledNow(id: string) {
  const s = await prisma.scheduledArticle.findUnique({ where: { id } });
  if (!s) return { success: false, error: "Not found" };
  if (s.status === "completed") return { success: false, error: "Already completed" };

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  try {
    await prisma.scheduledArticle.update({
      where: { id: s.id },
      data: { status: "generating" },
    });

    let category = s.category;
    let author = s.authorName;
    if (category === "auto" || author === "auto") {
      const pick = await autoSelectCategoryAndAuthor(
        s.title,
        categories.map((c) => c.name),
        authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
      );
      category = category === "auto" ? pick.category : category;
      author = author === "auto" ? pick.author : author;
    }

    const { articleData, imagesOk } = await generateFullArticlePayload({
      title: s.title, reference: s.reference, category, author,
    });

    const schedStatus = imagesOk ? "published" : "pending";
    const article = await prisma.article.create({
      data: {
        ...articleData,
        category,
        status: schedStatus,
        featured: false,
        publishedAt: schedStatus === "published" ? new Date().toISOString().split("T")[0] : "",
      },
    });
    if (schedStatus === "published") await finalizeArticlePublish(article.id);

    await prisma.scheduledArticle.update({
      where: { id: s.id },
      data: { status: "completed", generatedArticleId: article.id, category, authorName: author },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/schedule");
    return { success: true, articleId: article.id };
  } catch (e: any) {
    await prisma.scheduledArticle.update({
      where: { id: s.id },
      data: { status: "failed", errorMessage: e.message?.slice(0, 500) || "Unknown error" },
    });
    revalidatePath("/admin/articles/schedule");
    return { success: false, error: e.message || "Generation failed" };
  }
}

// Publish ALL pending scheduled items immediately
export async function publishAllPendingNow() {
  const pending = await prisma.scheduledArticle.findMany({
    where: { status: "pending" },
    orderBy: { scheduledFor: "asc" },
  });

  if (pending.length === 0) {
    return { success: true, succeeded: 0, failed: 0, total: 0 };
  }

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  let succeeded = 0;
  let failed = 0;

  for (const s of pending) {
    try {
      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "generating" },
      });

      let category = s.category;
      let author = s.authorName;
      if (category === "auto" || author === "auto") {
        const pick = await autoSelectCategoryAndAuthor(
          s.title,
          categories.map((c) => c.name),
          authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
        );
        category = category === "auto" ? pick.category : category;
        author = author === "auto" ? pick.author : author;
      }

      const { articleData, imagesOk } = await generateFullArticlePayload({
        title: s.title, reference: s.reference, category, author,
      });

      const schedStatus = imagesOk ? "published" : "pending";
      const article = await prisma.article.create({
        data: {
          ...articleData,
          category,
          status: schedStatus,
          featured: false,
          publishedAt: schedStatus === "published" ? new Date().toISOString().split("T")[0] : "",
        },
      });
      if (schedStatus === "published") await finalizeArticlePublish(article.id);

      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "completed", generatedArticleId: article.id, category, authorName: author },
      });
      succeeded++;
    } catch (e: any) {
      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "failed", errorMessage: e.message?.slice(0, 500) || "Unknown error" },
      });
      failed++;
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles/schedule");
  return { success: true, succeeded, failed, total: pending.length };
}

export async function runDueScheduled() {
  const due = await prisma.scheduledArticle.findMany({
    where: { status: "pending", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take: 5,
  });

  let succeeded = 0;
  let failed = 0;

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  for (const s of due) {
    try {
      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "generating" },
      });

      // Auto-pick category + author if set to "auto"
      let category = s.category;
      let author = s.authorName;
      if (category === "auto" || author === "auto") {
        const pick = await autoSelectCategoryAndAuthor(
          s.title,
          categories.map((c) => c.name),
          authors.map((a) => ({ name: a.name, specialty: a.specialty, bio: a.bio }))
        );
        category = category === "auto" ? pick.category : category;
        author = author === "auto" ? pick.author : author;
      }

      const { articleData, imagesOk } = await generateFullArticlePayload({
        title: s.title, reference: s.reference, category, author,
      });

      const schedStatus = imagesOk ? "published" : "pending";
      const article = await prisma.article.create({
        data: {
          ...articleData,
          category,
          status: schedStatus,
          featured: false,
          publishedAt: schedStatus === "published" ? new Date().toISOString().split("T")[0] : "",
        },
      });
      if (schedStatus === "published") await finalizeArticlePublish(article.id);

      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "completed", generatedArticleId: article.id, category, authorName: author },
      });
      succeeded++;
    } catch (e: any) {
      await prisma.scheduledArticle.update({
        where: { id: s.id },
        data: { status: "failed", errorMessage: e.message?.slice(0, 500) || "Unknown error" },
      });
      failed++;
    }
  }

  return { succeeded, failed, processed: due.length };
}
