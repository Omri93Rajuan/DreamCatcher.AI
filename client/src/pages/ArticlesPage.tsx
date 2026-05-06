import DreamArticles from "@/components/articles/DreamArticles";
import articles from "../components/articles/articlesData.json";
import { usePageSeo } from "@/hooks/usePageSeo";
import { getArticlesSeo } from "@/lib/seo";
import { useMemo } from "react";

export default function ArticlesPage() {
    const seo = useMemo(() => getArticlesSeo(), []);
    usePageSeo(seo);
    return <DreamArticles articles={articles}/>;
}
