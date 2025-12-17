"use client";
import * as React from "react";
import ArticleCardSplit from "./ArticleCard.Spotlight";
import { Article } from "@/lib/api/types";
import { useTranslation } from "react-i18next";

export default function ArticlesGrid({
  items,
  onOpen,
}: {
  items: Article[];
  onOpen: (a: Article) => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <section aria-label={t("articles.listAria")} className="space-y-6" dir={i18n.dir()}>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300 sm:text-3xl">
          {t("articles.recommended")}
        </h1>
        <span className="text-xs text-slate-600 dark:text-white/60 sm:text-sm">
          {t("articles.count", { count: items.length })}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {items.map((a) => (
          <ArticleCardSplit key={a.id} a={a} onOpen={() => onOpen(a)} />
        ))}
      </div>
    </section>
  );
}
