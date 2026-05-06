import ReactMarkdown, { type Components } from "react-markdown";

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="mb-3 mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h2 className="mb-3 mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h2>
  ),
  h4: ({ children }) => (
    <h3 className="mb-3 mt-6 text-xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h3>
  ),
  h5: ({ children }) => (
    <h3 className="mb-3 mt-6 text-xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h3>
  ),
  h6: ({ children }) => (
    <h3 className="mb-3 mt-6 text-xl font-extrabold text-slate-900 dark:text-white">
      {children}
    </h3>
  ),
};

export default function ArticleBody({ content }: { content: string }) {
  return (
    <div className="px-4 sm:px-6 pb-10">
      <div className="max-w-3xl mx-auto text-[17px] sm:text-lg leading-8 sm:leading-9 text-slate-800 dark:text-white/90">
        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-extrabold prose-p:my-4 prose-li:my-1">
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
