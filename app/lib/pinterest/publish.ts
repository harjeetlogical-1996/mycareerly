import { prisma } from "../prisma";
import { absoluteUrl, SITE_URL } from "../site";
import { pinterestFetch, PinterestApiError } from "./client";
import { getValidAccessToken } from "./tokens";

function truncate(s: string, n: number) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function buildDescription(base: string, hashtags: string): string {
  const desc = base.trim();
  const hash = hashtags.trim();
  if (!hash) return truncate(desc, 500);
  // keep description, truncate hashtags to fit 500 total
  const room = 500 - desc.length - 2;
  if (room <= 0) return truncate(desc, 500);
  return desc + "\n\n" + truncate(hash, Math.max(0, room));
}

/**
 * Posts a single PinterestPin row to Pinterest API v5.
 * Updates the row's status/pinId/attempts/lastError.
 */
export async function postPin(pinRowId: string): Promise<{ ok: boolean; error?: string; pinId?: string }> {
  const pin = await prisma.pinterestPin.findUnique({
    where: { id: pinRowId },
    include: { image: true, account: true },
  });
  if (!pin) return { ok: false, error: "Pin row not found" };
  if (pin.status === "posted") return { ok: true, pinId: pin.pinId ?? undefined };

  const article = await prisma.article.findUnique({ where: { id: pin.articleId } });
  if (!article) {
    await prisma.pinterestPin.update({
      where: { id: pin.id },
      data: { status: "failed", lastError: "Article not found", attempts: { increment: 1 } },
    });
    return { ok: false, error: "Article not found" };
  }

  const imageUrl = pin.image?.url || article.coverImage;
  const absoluteImg = absoluteUrl(imageUrl);
  const link = `${SITE_URL}/${article.slug}`;

  // Guard: Pinterest won't accept localhost URLs
  if (/localhost|127\.0\.0\.1/i.test(absoluteImg) || /localhost|127\.0\.0\.1/i.test(link)) {
    const msg = "Image or article URL is localhost — Pinterest requires public URLs. Set SITE_URL env var.";
    await prisma.pinterestPin.update({
      where: { id: pin.id },
      data: { status: "failed", lastError: msg, attempts: { increment: 1 } },
    });
    return { ok: false, error: msg };
  }

  try {
    const token = await getValidAccessToken(pin.accountId);
    const payload = {
      board_id: pin.boardId,
      title: truncate(pin.title, 100),
      description: buildDescription(pin.description || article.excerpt, pin.hashtags || ""),
      link,
      alt_text: truncate(pin.title, 500),
      media_source: { source_type: "image_url", url: absoluteImg },
    };
    const res = await pinterestFetch("/pins", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const pinId = (res && (res.id as string)) || undefined;
    await prisma.pinterestPin.update({
      where: { id: pin.id },
      data: {
        status: "posted",
        pinId: pinId ?? null,
        postedAt: new Date(),
        attempts: { increment: 1 },
        lastError: "",
      },
    });
    return { ok: true, pinId };
  } catch (err: any) {
    const msg =
      err instanceof PinterestApiError
        ? `${err.status}: ${JSON.stringify(err.body).slice(0, 400)}`
        : err?.message || String(err);
    await prisma.pinterestPin.update({
      where: { id: pin.id },
      data: { status: "failed", lastError: msg, attempts: { increment: 1 } },
    });
    return { ok: false, error: msg };
  }
}

/**
 * Fire-and-forget wrapper for finalizeArticlePublish. Silences errors.
 */
export function postPinInBackground(pinRowId: string): void {
  postPin(pinRowId).catch(() => {});
}
