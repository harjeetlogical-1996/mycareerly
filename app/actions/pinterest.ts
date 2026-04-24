"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { getAdminSession } from "../lib/auth";
import { getSetting, SETTING_KEYS } from "../lib/settings";
import { postPin, postPinInBackground } from "../lib/pinterest/publish";
import { pinterestFetch } from "../lib/pinterest/client";
import { getValidAccessToken } from "../lib/pinterest/tokens";
import { generatePinterestImage, generatePinterestHook, generatePinterestHooks } from "../lib/pinterest/generateImage";

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new Error("Unauthorized");
}

// ---------- App-level settings ----------

export async function savePinterestAppSettings(formData: FormData) {
  await requireAdmin();
  const entries: [string, string][] = [
    [SETTING_KEYS.PINTEREST_CLIENT_ID, (formData.get("clientId") as string) || ""],
    [SETTING_KEYS.PINTEREST_CLIENT_SECRET, (formData.get("clientSecret") as string) || ""],
    [SETTING_KEYS.PINTEREST_AUTO_POST_ENABLED, formData.get("autoPost") === "on" ? "true" : "false"],
    [SETTING_KEYS.PINTEREST_MAX_PINS_PER_DAY, (formData.get("maxPerDay") as string) || "20"],
    [SETTING_KEYS.GEMINI_API_KEY, (formData.get("geminiKey") as string) || ""],
  ];
  for (const [key, value] of entries) {
    if (key === SETTING_KEYS.PINTEREST_CLIENT_SECRET && !value) continue; // don't wipe on empty
    if (key === SETTING_KEYS.GEMINI_API_KEY && !value) continue;
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  revalidatePath("/admin/pinterest");
  revalidatePath("/admin/pinterest/settings");
}

// ---------- Account management ----------

export async function disconnectAccount(accountId: string) {
  await requireAdmin();
  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: { active: false, autoPostEnabled: false },
  });
  revalidatePath("/admin/pinterest/accounts");
}

export async function deleteAccount(accountId: string) {
  await requireAdmin();
  await prisma.pinterestAccount.delete({ where: { id: accountId } });
  revalidatePath("/admin/pinterest/accounts");
}

export async function updateAccount(accountId: string, data: { label?: string; defaultBoardId?: string; autoPostEnabled?: boolean }) {
  await requireAdmin();
  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: {
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(data.defaultBoardId !== undefined ? { defaultBoardId: data.defaultBoardId } : {}),
      ...(data.autoPostEnabled !== undefined ? { autoPostEnabled: data.autoPostEnabled } : {}),
    },
  });
  revalidatePath("/admin/pinterest/accounts");
}

export async function fetchAccountBoards(accountId: string): Promise<Array<{ id: string; name: string }>> {
  await requireAdmin();
  const token = await getValidAccessToken(accountId);
  const res: any = await pinterestFetch("/boards?page_size=100", token);
  const items: any[] = res?.items || [];
  return items.map((b) => ({ id: b.id, name: b.name }));
}

export async function saveCategoryBoards(accountId: string, mappings: Array<{ category: string; boardId: string; boardName: string }>) {
  await requireAdmin();
  // Upsert each mapping
  for (const m of mappings) {
    if (!m.boardId) {
      await prisma.pinterestBoardMap.deleteMany({
        where: { accountId, category: m.category },
      });
      continue;
    }
    await prisma.pinterestBoardMap.upsert({
      where: { accountId_category: { accountId, category: m.category } },
      create: { accountId, category: m.category, boardId: m.boardId, boardName: m.boardName },
      update: { boardId: m.boardId, boardName: m.boardName },
    });
  }
  revalidatePath("/admin/pinterest/accounts");
}

// ---------- Pin CRUD ----------

export async function createPin(data: {
  accountId: string;
  articleId: string;
  imageId?: string | null;
  title: string;
  description: string;
  hashtags: string;
  boardId: string;
  scheduledFor?: string | null;
  postNow: boolean;
}): Promise<{ ok: boolean; pinRowId?: string; error?: string }> {
  await requireAdmin();

  const article = await prisma.article.findUnique({ where: { id: data.articleId } });
  if (!article) return { ok: false, error: "Article not found" };
  const account = await prisma.pinterestAccount.findUnique({ where: { id: data.accountId } });
  if (!account) return { ok: false, error: "Account not found" };

  const status = data.postNow
    ? "queued"
    : data.scheduledFor
      ? "scheduled"
      : "draft";

  const row = await prisma.pinterestPin.create({
    data: {
      accountId: data.accountId,
      articleId: data.articleId,
      imageId: data.imageId || null,
      title: data.title.slice(0, 100),
      description: data.description,
      hashtags: data.hashtags || "",
      boardId: data.boardId,
      status,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    },
  });

  if (data.postNow) {
    postPinInBackground(row.id);
  }

  revalidatePath("/admin/pinterest/queue");
  revalidatePath(`/admin/pinterest/articles/${data.articleId}`);
  return { ok: true, pinRowId: row.id };
}

export async function retryPin(pinRowId: string): Promise<{ ok: boolean; error?: string; pinId?: string }> {
  await requireAdmin();
  // Reset to queued, zero attempts
  await prisma.pinterestPin.update({
    where: { id: pinRowId },
    data: { status: "queued", lastError: "", attempts: 0 },
  });
  const res = await postPin(pinRowId);
  revalidatePath("/admin/pinterest/queue");
  return res;
}

export async function deletePin(pinRowId: string) {
  await requireAdmin();
  await prisma.pinterestPin.delete({ where: { id: pinRowId } });
  revalidatePath("/admin/pinterest/queue");
}

export async function bulkPinArticles(data: {
  articleIds: string[];
  accountIds: string[]; // one pin per (article, account)
  useCategoryMapping: boolean;
}): Promise<{ ok: boolean; queued: number; skipped: number }> {
  await requireAdmin();
  let queued = 0, skipped = 0;

  for (const articleId of data.articleIds) {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) { skipped++; continue; }
    const tags = (() => { try { return JSON.parse(article.tags) as string[]; } catch { return []; } })();
    const hashtags = tags.slice(0, 8).map((t) => "#" + t.replace(/\s+/g, "")).join(" ");

    for (const accountId of data.accountIds) {
      const account = await prisma.pinterestAccount.findUnique({ where: { id: accountId } });
      if (!account || !account.defaultBoardId) { skipped++; continue; }

      let boardId = account.defaultBoardId;
      if (data.useCategoryMapping) {
        const mapped = await prisma.pinterestBoardMap.findUnique({
          where: { accountId_category: { accountId, category: article.category } },
        });
        if (mapped) boardId = mapped.boardId;
      }

      // Skip if already queued/posted
      const existing = await prisma.pinterestPin.findFirst({
        where: {
          articleId,
          accountId,
          status: { in: ["queued", "scheduled", "posted"] },
        },
      });
      if (existing) { skipped++; continue; }

      await prisma.pinterestPin.create({
        data: {
          accountId,
          articleId,
          title: article.title.slice(0, 100),
          description: article.excerpt || article.title,
          hashtags,
          boardId,
          status: "queued",
        },
      });
      queued++;
    }
  }

  revalidatePath("/admin/pinterest/queue");
  revalidatePath("/admin/pinterest/articles");
  return { ok: true, queued, skipped };
}

// ---------- Image actions ----------

export async function generatePinImage(
  articleId: string,
  variantIndex: number = 0,
  options: { withOverlay?: boolean; customHook?: string } = {}
): Promise<{ ok: boolean; url?: string; imageId?: string; overlayHook?: string | null; error?: string }> {
  await requireAdmin();
  try {
    const res = await generatePinterestImage(articleId, variantIndex, options);
    revalidatePath(`/admin/pinterest/articles/${articleId}`);
    revalidatePath("/admin/pinterest/images");
    return { ok: true, url: res.url, imageId: res.id, overlayHook: res.overlayHook };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Generate 6 different clickable Pinterest hook headlines in one call.
 * User picks one, then generates the image with that exact hook as overlay.
 */
export async function generateHookOptions(articleId: string, count: number = 6): Promise<{ ok: boolean; hooks?: string[]; error?: string }> {
  await requireAdmin();
  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { ok: false, error: "Article not found" };
    const tags = (() => { try { return JSON.parse(article.tags) as string[]; } catch { return []; } })();
    const hooks = await generatePinterestHooks(
      { title: article.title, category: article.category, excerpt: article.excerpt, tags, content: article.content },
      count
    );
    return { ok: true, hooks };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Legacy single-hook preview. Kept for API compat.
 */
export async function previewPinHook(articleId: string, variantIndex: number = 0): Promise<{ ok: boolean; hook?: string; error?: string }> {
  await requireAdmin();
  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { ok: false, error: "Article not found" };
    const tags = (() => { try { return JSON.parse(article.tags) as string[]; } catch { return []; } })();
    const hook = await generatePinterestHook(
      { title: article.title, category: article.category, excerpt: article.excerpt, tags, content: article.content },
      variantIndex
    );
    return { ok: true, hook };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function attachUploadedImage(articleId: string, url: string): Promise<{ id: string }> {
  await requireAdmin();
  const row = await prisma.pinterestImage.create({
    data: { articleId, url, source: "upload" },
  });
  revalidatePath(`/admin/pinterest/articles/${articleId}`);
  return { id: row.id };
}

export async function deletePinterestImage(imageId: string) {
  await requireAdmin();
  await prisma.pinterestImage.delete({ where: { id: imageId } });
  revalidatePath("/admin/pinterest/images");
}
