"use client";
import * as React from "react";
import ArticlesGrid from "./ArticlesGrid";
import ArticleView from "./ArticleView";
import { Article } from "@/lib/api/types";
import Pagination from "@/components/ui/Pagination";
export default function DreamArticles({ articles, initialSelectedId = null, onSelectArticle, onBackToGrid, }: {
    articles: Article[];
    initialSelectedId?: string | null;
    onSelectArticle?: (a: Article) => void;
    onBackToGrid?: () => void;
}) {
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
    return (<div dir="rtl" className="w-full mx-auto max-w-6xl p-4 sm:p-6">
      {selected ? (<ArticleView article={selected} onBack={handleBack}/>) : (<>
          <ArticlesGrid items={pagedArticles} onOpen={handleOpen}/>
          <Pagination page={page} pages={totalPages} onChange={handlePageChange}/>
        </>)}
    </div>);
}
