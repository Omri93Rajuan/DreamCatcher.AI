"use client";
import * as React from "react";
import ArticleCardSpotlight from "./ArticleCard.Spotlight";
import { Article } from "@/lib/api/types";
import ArticleCardSplit from "./ArticleCard.Spotlight";

export default function ArticlesGrid({
  items,
  onOpen,
}: {
  items: Article[];
  onOpen: (a: Article) => void;
}) {
  return (
    <section aria-label="רשימת מאמרים" className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300">
          מאמרים מומלצים
        </h1>
        <span className="text-xs text-slate-600 dark:text-white/60">
          {items.length} מאמרים
        </span>
      </header>

      {/* כרטיסים רחבים ונושמים; במובייל זה סטאק יפה */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {items.map((a) => (
          <ArticleCardSplit key={a.id} a={a} onOpen={() => onOpen(a)} />
        ))}
      </div>
    </section>
  );
}
