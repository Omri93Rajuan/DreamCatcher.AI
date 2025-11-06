"use client";
import * as React from "react";
import { calcReadingTime, fmtDate } from "../../lib/utils/articlesUtils";
import MetaRow from "./MetaRow";
import ArticleBody from "./ArticleBody";
import { Article } from "@/lib/api/types";

export default function ArticleView({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  const readingMins = calcReadingTime(article.content);

  return (
    <article className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)]">
      {/* Header דביק עם חזרה + זמן קריאה */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-black/30 bg-white/85 dark:bg-black/30 border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-slate-700 dark:text-white hover:bg-white focus:ring-2 focus:ring-amber-300/40"
            aria-label="חזרה לרשימת המאמרים"
          >
            ← חזרה
          </button>
          <div className="text-[11px] sm:text-xs text-slate-600 dark:text-white/70">
            {article.publishedAt ? fmtDate(article.publishedAt) + " • " : ""}~
            {readingMins} ד׳ קריאה
          </div>
        </div>
      </header>

      {/* Cover */}
      {article.coverUrl ? (
        <div className="w-full overflow-hidden">
          <img
            src={article.coverUrl}
            alt=""
            className="w-full max-h-[520px] object-cover"
          />
        </div>
      ) : null}

      {/* Title + Meta */}
      <div className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            {article.title}
          </h1>
          <MetaRow
            className="mt-3"
            author={article.author}
            publishedAt={article.publishedAt}
            authorAvatar={article.authorAvatar}
          />
        </div>
      </div>

      {/* גוף המאמר */}
      <ArticleBody content={article.content} />
    </article>
  );
}
