import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import ArticleView from "@/components/articles/ArticleView";
import StatusCard from "@/components/ui/StatusCard";
import { usePageSeo } from "@/hooks/usePageSeo";
import {
  getArticleBySlug,
  getArticleSeo,
  getArticlesSeo,
  getRelatedArticles,
} from "@/lib/seo";

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getArticleBySlug(slug);
  const seo = useMemo(
    () => (article ? getArticleSeo(article) : getArticlesSeo()),
    [article],
  );

  usePageSeo(seo);

  if (!article) {
    return (
      <div className="mx-auto grid min-h-[45vh] max-w-2xl place-items-center px-4 py-16">
        <StatusCard
          tone="error"
          title="Article not found"
          message="The article you requested does not exist."
          actionLabel="Back to articles"
          onAction={() => navigate("/articles")}
        />
        <Link className="sr-only" to="/articles">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <ArticleView
        article={article}
        onBack={() => navigate("/articles")}
        relatedArticles={getRelatedArticles(article)}
      />
    </div>
  );
}
