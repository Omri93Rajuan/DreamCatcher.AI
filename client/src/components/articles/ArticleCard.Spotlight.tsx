"use client";
import * as React from "react";
import MetaRow from "./MetaRow";
import CategoryTag from "./CategoryTag";
import { Article } from "@/lib/api/types";
import { clampText, stripHtml } from "@/lib/utils/articlesUtils";
export default function ArticleCardSplit({ a, onOpen, }: {
    a: Article;
    onOpen: () => void;
}) {
    return (<article dir="rtl" className="
        grid gap-0
        rounded-[28px]
        bg-white/85 dark:bg-white/[0.06]
        ring-1 ring-black/5 dark:ring-white/10
        shadow-[0_18px_40px_-20px_rgba(0,0,0,.35)]
        overflow-hidden
        transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-28px_rgba(0,0,0,.45)]
        md:grid-cols-[1fr,42%]
      ">
      
      <div className="p-5 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-900 dark:text-white">
          {a.title}
        </h3>

        <MetaRow className="mt-2" author={a.author} publishedAt={a.publishedAt} authorAvatar={a.authorAvatar}/>

        <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-white/80">
          {a.excerpt ?? clampText(stripHtml(a.content), 240)}
        </p>

        {a.tags?.length ? (<div className="mt-3 flex flex-wrap gap-2">
            {a.tags.slice(0, 3).map((t) => (<CategoryTag key={t} tag={t}/>))}
          </div>) : null}

        <button onClick={onOpen} className="
            mt-5 w-full sm:w-auto px-5 py-2.5 rounded-2xl font-semibold text-white
            bg-[linear-gradient(135deg,#8b5cf6_0%,#f59e0b_100%)]
            shadow-[0_10px_24px_-14px_rgba(0,0,0,.35)]
            hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-amber-300/40
          " aria-label={`פתח מאמר: ${a.title}`}>
          קרא/י עוד
        </button>
      </div>

      
      <div className="relative">
        <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
          {a.coverUrl ? (<img src={a.coverUrl} alt="" className="w-full h-full object-cover transition duration-500 md:scale-100 hover:scale-[1.03]" loading="lazy"/>) : (<div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-amber-400/25"/>)}
        </div>

        
        {a.tags?.length ? (<div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {a.tags.slice(0, 2).map((t) => (<CategoryTag key={t} tag={t} variant="overlay"/>))}
          </div>) : null}
      </div>
    </article>);
}
