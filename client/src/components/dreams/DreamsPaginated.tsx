import React from "react";
import DreamCard from "@/components/dreams/DreamCard";
import Pagination from "@/components/ui/Pagination";
import type { DreamsPage } from "@/lib/api/types";

type Props = {
  data?: DreamsPage;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  view?: "grid" | "list";
};

export default function DreamsPaginated({
  data,
  isLoading,
  isFetching,
  onPageChange,
  view = "grid",
}: Props) {
  if (isLoading) return <div className="text-center py-12">טוען...</div>;

  const dreams = data?.dreams ?? [];
  const pages = data?.pages ?? 1;
  const page = data?.page ?? 1;

  if (!dreams.length)
    return (
      <div className="text-center py-8 text-slate-600 dark:text-white/70">
        לא נמצאו חלומות.
      </div>
    );

  return (
    <div dir="rtl">
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
            : "flex flex-col gap-5"
        }
      >
        {dreams.map((d) => (
          <DreamCard key={d._id} dream={d as any} />
        ))}
      </div>

      {/* רק ריווח/מרכוז – הלוגיקה של Pagination נשארת */}
      <div className="mt-10">
        <Pagination
          page={page}
          pages={pages}
          onChange={onPageChange}
          disabled={isFetching}
        />

        <div
          className={`mt-3 text-xs ${
            isFetching ? "opacity-100" : "opacity-0"
          } transition-opacity text-slate-600 dark:text-white/60`}
          aria-live="polite"
        >
          מרענן נתונים…
        </div>
      </div>
    </div>
  );
}
