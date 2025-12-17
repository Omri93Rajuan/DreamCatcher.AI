import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  if (isLoading)
    return <div className="text-center py-12">{t("common.loading")}</div>;

  const dreams = data?.dreams ?? [];
  const pages = data?.pages ?? 1;
  const page = data?.page ?? 1;

  if (!dreams.length)
    return (
      <div className="text-center py-8 text-slate-600 dark:text-white/70">
        {t("myDreams.empty")}
      </div>
    );

  return (
    <div dir={i18n.dir()}>
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

      <div className="mt-10">
        <Pagination page={page} pages={pages} onChange={onPageChange} disabled={isFetching} />

        <div
          className={`mt-3 text-xs ${
            isFetching ? "opacity-100" : "opacity-0"
          } transition-opacity text-slate-600 dark:text-white/60`}
          aria-live="polite"
        >
          {t("dreams.refreshing")}
        </div>
      </div>
    </div>
  );
}
