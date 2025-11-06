"use client";
import { fmtDate } from "@/lib/utils/articlesUtils";
import * as React from "react";
export default function MetaRow({ author, publishedAt, authorAvatar, className = "", }: {
    author: string;
    publishedAt?: string;
    authorAvatar?: string;
    className?: string;
}) {
    return (<div className={`mt-1 flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-white/70 ${className}`}>
      {authorAvatar ? (<img src={authorAvatar} alt="" className="w-7 h-7 rounded-full border border-black/10 dark:border-white/10 object-cover" loading="lazy"/>) : (<div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600/25 to-amber-400/25 border border-black/10 dark:border-white/10"/>)}
      <span className="font-medium">{author}</span>
      {publishedAt ? (<span className="opacity-60">• {fmtDate(publishedAt)}</span>) : null}
    </div>);
}
