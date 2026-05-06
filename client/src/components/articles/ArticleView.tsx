"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import { calcReadingTime, fmtDate } from "../../lib/utils/articlesUtils";
import MetaRow from "./MetaRow";
import ArticleBody from "./ArticleBody";
import CategoryTag from "./CategoryTag";
import { resolveArticleCover } from "./coverImages";
import logo from "@/assets/logo.webp";
import { Article } from "@/lib/api/types";
import { useTranslation } from "react-i18next";
import { getArticleDescription, getArticlePath } from "@/lib/seo";

export default function ArticleView({
  article,
  onBack,
  relatedArticles = [],
}: {
  article: Article;
  onBack: () => void;
  relatedArticles?: Article[];
}) {
  const { t, i18n } = useTranslation();
  const readingMins = calcReadingTime(article.content);
  const coverSrc = resolveArticleCover(article.coverUrl);
  return (
    <>
    <article className="rounded-3xl border border-black/10 bg-white/80 shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:border-white/10 dark:bg-white/[0.06]" dir={i18n.dir()}>
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-white/10 dark:bg-black/30 dark:supports-[backdrop-filter]:bg-black/30 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-white focus:ring-2 focus:ring-amber-300/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:w-auto"
            aria-label={t("articles.backAria")}
          >
            {t("articles.backToList")}
          </button>
          <div className="text-[11px] leading-5 text-slate-600 sm:text-xs dark:text-white/70">
            {article.publishedAt ? `${fmtDate(article.publishedAt, i18n.language)} • ` : ""}
            {t("articles.readingTime", { minutes: readingMins })}
          </div>
        </div>
      </header>

      {coverSrc ? (
        <div className="w-full overflow-hidden">
          <img
            src={coverSrc}
            alt={article.title}
            className="h-full w-full max-h-[420px] object-cover sm:max-h-[520px]"
          />
        </div>
      ) : null}

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-6 sm:py-8">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {article.title}
          </h1>
          <MetaRow
            className="mt-3"
            author={article.author}
            publishedAt={article.publishedAt}
            authorAvatar={logo}
          />
          {article.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <CategoryTag key={tag} tag={tag} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ArticleBody content={article.content} />
    </article>
    {relatedArticles.length ? (
      <aside
        className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
        aria-label={t("articles.related", { defaultValue: "Related articles" })}
        dir={i18n.dir()}
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
          {t("articles.related", { defaultValue: "Related articles" })}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {relatedArticles.map((related) => {
            const relatedCover = resolveArticleCover(related.coverUrl);
            return (
              <Link
                key={related.id}
                to={getArticlePath(related)}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 dark:border-white/10 dark:bg-white/[0.05]"
              >
                {relatedCover ? (
                  <img
                    src={relatedCover}
                    alt=""
                    className="h-36 w-full object-cover transition duration-300 group-hover:brightness-105"
                    loading="lazy"
                  />
                ) : null}
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
                    {related.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-white/70">
                    {getArticleDescription(related)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    ) : null}
    </>
  );
}
