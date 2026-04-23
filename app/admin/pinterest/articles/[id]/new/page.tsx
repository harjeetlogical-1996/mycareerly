import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../../../lib/settings";
import PinComposer from "./PinComposer";

export const dynamic = "force-dynamic";

export default async function NewPinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return notFound();

  const accounts = await prisma.pinterestAccount.findMany({
    where: { active: true },
    include: { boardMaps: true },
  });
  const images = await prisma.pinterestImage.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "desc" },
  });

  const geminiKey = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
  const tags = (() => { try { return JSON.parse(article.tags) as string[]; } catch { return []; } })();

  return (
    <PinComposer
      article={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        category: article.category,
        tags,
      }}
      accounts={accounts.map((a) => ({
        id: a.id,
        username: a.username,
        label: a.label,
        defaultBoardId: a.defaultBoardId,
        mappings: a.boardMaps.map((m) => ({ category: m.category, boardId: m.boardId, boardName: m.boardName })),
      }))}
      images={images.map((i) => ({ id: i.id, url: i.url, source: i.source }))}
      aiEnabled={!!geminiKey}
    />
  );
}
