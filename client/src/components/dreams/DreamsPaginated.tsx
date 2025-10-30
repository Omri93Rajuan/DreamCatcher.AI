import React from "react";
import DreamCard from "@/components/dreams/DreamCard";
import Pagination from "@/components/ui/Pagination";
import type { DreamsPage } from "@/lib/api/types";

type Props = {
  data?: DreamsPage;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (p: number) => void;
};

export default function DreamsPaginated({
  data,
  isLoading,
  isFetching,
  onPageChange,
}: Props) {
  if (isLoading) return <div className="text-center py-12">טוען...</div>;

  const dreams = data?.dreams ?? [];
  if (!dreams.length)
    return (
      <div className="text-center text-purple-300 py-8">לא נמצאו חלומות.</div>
    );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dreams.map((d) => (
          <DreamCard key={d._id} dream={d as any} />
        ))}
      </div>

      <Pagination
        page={Number(data?.page ?? 1)}
        pages={Number(data?.pages ?? 1)}
        onChange={onPageChange}
        disabled={isFetching}
      />
    </>
  );
}
