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
      <div className="text-center text-purple-300 py-8">לא נמצאו חלומות.</div>
    );

  return (
    <div>
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {dreams.map((d) => (
          <DreamCard key={d._id} dream={d as any} />
        ))}
      </div>

      <Pagination
        page={page}
        pages={pages}
        onChange={onPageChange}
        disabled={isFetching}
      />
    </div>
  );
}
