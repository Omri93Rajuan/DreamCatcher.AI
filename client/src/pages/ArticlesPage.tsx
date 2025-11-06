import DreamArticles from "@/components/articles/DreamArticles";
import articles from "../components/articles/articlesData.json";

export default function ArticlesPage() {
  return <DreamArticles articles={articles} />;
}
