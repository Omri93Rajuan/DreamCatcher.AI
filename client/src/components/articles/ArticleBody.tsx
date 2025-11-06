"use client";
import * as React from "react";

// תמיכה אופציונלית ב-Markdown (אם מותקן)
let ReactMarkdown: any;
try {
  // @ts-ignore
  ReactMarkdown = require("react-markdown").default;
} catch {
  /* לא חובה */
}

export default function ArticleBody({ content }: { content: string }) {
  return (
    <div className="px-4 sm:px-6 pb-10">
      <div className="max-w-3xl mx-auto text-[17px] sm:text-lg leading-8 sm:leading-9 text-slate-800 dark:text-white/90">
        {ReactMarkdown ? (
          <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-extrabold prose-h2:text-2xl prose-h3:text-xl prose-p:my-4 prose-li:my-1">
            {/* @ts-ignore */}
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          // פולבק: מפצל שורות וכותרות "###"
          content.split("\n").map((p, i) =>
            p.trim().startsWith("###") ? (
              <h3 key={i} className="mt-6 mb-3 text-xl font-extrabold">
                {p.replace(/^#+\s*/, "")}
              </h3>
            ) : (
              <p key={i} className="my-4">
                {p}
              </p>
            )
          )
        )}
      </div>
    </div>
  );
}
