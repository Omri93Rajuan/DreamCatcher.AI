"use client";
import * as React from "react";
import ArticleCardSplit from "./ArticleCard.Spotlight";
import { Article } from "@/lib/api/types";

export default function ArticlesGrid({
  items,
  onOpen,
}: {
  items: Article[];
  onOpen: (a: Article) => void;
}) {
  return (
    <section aria-label="רשימת מאמרים" className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300 sm:text-3xl">
          מאמרים מומלצים
        </h1>
        <span className="text-xs text-slate-600 dark:text-white/60 sm:text-sm">
          {items.length} מאמרים
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
