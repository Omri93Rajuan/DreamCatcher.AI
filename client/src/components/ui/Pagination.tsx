import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pages: number;
  onChange: (p: number) => void;
  disabled?: boolean;
};

function getPageWindow(page: number, pages: number, size = 5) {
  const half = Math.floor(size / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(pages, start + size - 1);
  if (end - start + 1 < size) start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, pages, onChange, disabled }: Props) {
  if (pages <= 1) return null;
  const windowPages = getPageWindow(page, pages);

  const baseBtn =
    "h-11 min-w-[48px] px-5 text-base rounded-xl font-medium " +
    "transition-[background,transform] hover:scale-[1.02] active:scale-95 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/40";

  // outline מותאם לשתי התמות (לא “לבן על לבן”)
  const outlineBtn =
    "border bg-white text-slate-800 border-black/10 hover:bg-black/5 " +
    "dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/20";

  // עמוד פעיל בצבע זהב המותג
  const activeBtn =
    "bg-[var(--brand)] text-[color:var(--brand-fg)] shadow-[0_0_14px_rgba(201,162,58,0.35)] hover:brightness-105";

  const prev = () => page > 1 && onChange(page - 1);
  const next = () => page < pages && onChange(page + 1);

  return (
    <div className="flex items-center justify-center gap-3 mt-10" dir="rtl">
      <Button
        onClick={prev}
        className={`${baseBtn} ${outlineBtn} ${
          page <= 1 ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        הקודם
      </Button>

      {windowPages.map((p) => (
        <Button
          key={p}
          onClick={() => onChange(p)}
          className={`${baseBtn} ${p === page ? activeBtn : outlineBtn}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Button>
      ))}

      <Button
        onClick={next}
        className={`${baseBtn} ${outlineBtn} ${
          page >= pages ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        הבא
      </Button>
    </div>
  );
}
