"use client";
import * as React from "react";
import { calcReadingTime, fmtDate } from "../../lib/utils/articlesUtils";
import MetaRow from "./MetaRow";
import ArticleBody from "./ArticleBody";
import CategoryTag from "./CategoryTag";
import { resolveArticleCover } from "./coverImages";
import logo from "@/assets/logo.png";
import { Article } from "@/lib/api/types";

export default function ArticleView({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  const readingMins = calcReadingTime(article.content);
  const coverSrc = resolveArticleCover(article.coverUrl);
  return (
    <article className="rounded-3xl border border-black/10 bg-white/80 shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:border-white/10 dark:bg-white/[0.06]">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-white/10 dark:bg-black/30 dark:supports-[backdrop-filter]:bg-black/30 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-white focus:ring-2 focus:ring-amber-300/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:w-auto"
            aria-label="חזרה לרשימת המאמרים"
          >
            חזרה לרשימה
          </button>
          <div className="text-[11px] leading-5 text-slate-600 sm:text-xs dark:text-white/70">
            {article.publishedAt ? `${fmtDate(article.publishedAt)} • ` : ""}
            ~{readingMins} דקות קריאה
          </div>
        </div>
      </header>

      {coverSrc ? (
        <div className="w-full overflow-hidden">
          <img
            src={coverSrc}
            alt=""
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
  );
}
