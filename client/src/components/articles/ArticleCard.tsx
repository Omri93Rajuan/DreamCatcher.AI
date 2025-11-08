"use client";
import * as React from "react";
import MetaRow from "./MetaRow";
import CategoryTag from "./CategoryTag";
import { resolveArticleCover } from "./coverImages";
import logo from "@/assets/logo.png";
import { Article } from "@/lib/api/types";
import { clampText, stripHtml } from "@/lib/utils/articlesUtils";

export default function ArticleCard({
  a,
  onOpen,
}: {
  a: Article;
  onOpen: () => void;
}) {
  const coverSrc = resolveArticleCover(a.coverUrl);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-amber-300/40 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="h-56 w-full overflow-hidden sm:h-64">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:brightness-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-600/20 to-amber-400/25" />
        )}
      </div>

      <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
        <MetaRow
          className="text-xs text-slate-500 dark:text-white/60"
          author={a.author}
          publishedAt={a.publishedAt}
          authorAvatar={logo}
        />

        <div className="space-y-2">
          <h3 className="text-xl font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-white">
            {a.title}
          </h3>
          <p className="text-sm leading-6 text-slate-600 line-clamp-4 sm:text-base sm:leading-7 dark:text-white/80">
            {a.excerpt ?? clampText(stripHtml(a.content), 220)}
          </p>
        </div>

        {a.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {a.tags.slice(0, 3).map((t) => (
              <CategoryTag key={t} tag={t} />
            ))}
          </div>
        ) : null}

        <button
          onClick={onOpen}
          className="mt-auto inline-flex items-center justify-center rounded-full border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300/40 sm:w-auto dark:border-amber-300 dark:text-amber-200 dark:hover:bg-white/10"
          aria-label={`קרא עוד על: ${a.title}`}
        >
          קרא עוד
        </button>
      </div>
    </article>
  );
}
