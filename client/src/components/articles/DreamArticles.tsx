"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import ArticlesGrid from "./ArticlesGrid";
import ArticleView from "./ArticleView";
import { Article } from "@/lib/api/types";
import Pagination from "@/components/ui/Pagination";
import { getArticlePath } from "@/lib/seo";
import { useTranslation } from "react-i18next";

export default function DreamArticles({ articles, initialSelectedId = null, onSelectArticle, onBackToGrid, }: {
    articles: Article[];
    initialSelectedId?: string | null;
    onSelectArticle?: (a: Article) => void;
    onBackToGrid?: () => void;
}) {
    const { t } = useTranslation();
    const PAGE_SIZE = 6;
    const [selectedId, setSelectedId] = React.useState<string | null>(initialSelectedId);
    const [page, setPage] = React.useState(1);
    const selected = React.useMemo(() => articles.find((a) => a.id === selectedId) || null, [articles, selectedId]);
    const totalPages = React.useMemo(() => Math.max(1, Math.ceil(articles.length / PAGE_SIZE)), [articles.length]);
    React.useEffect(() => {
        if (!initialSelectedId)
            return;
        const index = articles.findIndex((a) => a.id === initialSelectedId);
        if (index >= 0) {
            const initialPage = Math.floor(index / PAGE_SIZE) + 1;
            setPage(initialPage);
        }
    }, [articles, initialSelectedId]);
    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);
    const pagedArticles = React.useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return articles.slice(start, start + PAGE_SIZE);
    }, [articles, page]);
    const handleOpen = (a: Article) => {
        setSelectedId(a.id);
        onSelectArticle?.(a);
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };
    const handleBack = () => {
        setSelectedId(null);
        onBackToGrid?.();
    };
    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };
    return (<div dir="rtl" className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {selected ? (<ArticleView article={selected} onBack={handleBack}/>) : (<>
          <ArticlesGrid items={pagedArticles} onOpen={handleOpen}/>
          <Pagination page={page} pages={totalPages} onChange={handlePageChange}/>
          <nav
            className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
            aria-label={t("articles.archive", { defaultValue: "All articles" })}
          >
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t("articles.archive", { defaultValue: "All articles" })}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link
                    to={getArticlePath(article)}
                    className="block rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold leading-6 text-amber-700 transition hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-amber-200 dark:hover:bg-white/10"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>)}
    </div>);
}
