import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateArticle } from "../../../actions/articles";
import ArticleForm from "../ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const tags = JSON.parse(article.tags) as string[];

  async function action(fd: FormData) {
    "use server";
    await updateArticle(id, fd);
  }

  return (
    <ArticleForm
      action={action}
      heading={`Edit: ${article.title}`}
      defaultValues={{
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        category: article.category,
        tags: tags.join(", "),
        authorName: article.authorName,
        authorBio: article.authorBio,
        authorEmail: article.authorEmail,
        status: article.status,
        featured: article.featured,
      }}
    />
  );
}
