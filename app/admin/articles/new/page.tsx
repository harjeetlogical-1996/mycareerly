import ArticleForm from "../ArticleForm";
import { createArticle } from "../../../actions/articles";

export default function NewArticlePage() {
  return <ArticleForm action={createArticle} heading="New Article" />;
}
