"use client";
import * as React from "react";
import MetaRow from "./MetaRow";
import CategoryTag from "./CategoryTag";
import { Article } from "@/lib/api/types";
import { clampText, stripHtml } from "@/lib/utils/articlesUtils";
export default function ArticleCard({ a, onOpen, }: {
    a: Article;
    onOpen: () => void;
}) {
    return (<article className="
        group flex flex-col overflow-hidden
        rounded-3xl
        bg-white/80 dark:bg-white/[0.06]
        shadow-[0_10px_30px_-20px_rgba(0,0,0,.35)]
        hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,.45)]
        transition
        hover:-translate-y-0.5
        focus-within:ring-2 focus-within:ring-amber-300/40
      ">
      
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          {a.coverUrl ? (<img src={a.coverUrl} alt="" className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy"/>) : (<div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-amber-400/25"/>)}
        </div>

        
        {a.tags?.length ? (<div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
            {a.tags.slice(0, 2).map((t) => (<CategoryTag key={t} tag={t} variant="overlay"/>))}
          </div>) : null}
      </div>

      
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
          {a.title}
        </h3>

        <MetaRow className="mt-2" author={a.author} publishedAt={a.publishedAt} authorAvatar={a.authorAvatar}/>

        <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-white/80 line-clamp-3">
          {a.excerpt ?? clampText(stripHtml(a.content), 220)}
        </p>

        {a.tags?.length ? (<div className="mt-3 flex flex-wrap gap-2">
            {a.tags.slice(0, 3).map((t) => (<CategoryTag key={t} tag={t}/>))}
          </div>) : null}

        <button onClick={onOpen} className="
            mt-5 inline-flex items-center justify-center w-full
            rounded-2xl px-4 py-2.5 font-semibold
            text-white
            bg-[linear-gradient(135deg,#8b5cf6_0%,#f59e0b_100%)]
            shadow-[0_8px_24px_-16px_rgba(0,0,0,.25)]
            hover:opacity-95
            focus:outline-none focus:ring-2 focus:ring-amber-300/40
          " aria-label={`פתח מאמר: ${a.title}`}>
          קרא/י עוד
        </button>
      </div>
    </article>);
}
