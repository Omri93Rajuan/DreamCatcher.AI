"use client";
import * as React from "react";
import ArticlesGrid from "./ArticlesGrid";
import ArticleView from "./ArticleView";
import { Article } from "@/lib/api/types";

export default function DreamArticles({
  articles,
  initialSelectedId = null,
  onSelectArticle,
  onBackToGrid,
}: {
  articles: Article[];
  initialSelectedId?: string | null;
  onSelectArticle?: (a: Article) => void;
  onBackToGrid?: () => void;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelectedId
  );

  const selected = React.useMemo(
    () => articles.find((a) => a.id === selectedId) || null,
    [articles, selectedId]
  );

  const handleOpen = (a: Article) => {
    setSelectedId(a.id);
    onSelectArticle?.(a);
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  };
  const handleBack = () => {
    setSelectedId(null);
    onBackToGrid?.();
  };

  return (
    <div dir="rtl" className="w-full mx-auto max-w-6xl p-4 sm:p-6">
      {selected ? (
        <ArticleView article={selected} onBack={handleBack} />
      ) : (
        <ArticlesGrid items={articles} onOpen={handleOpen} />
      )}
    </div>
  );
}
