import React from "react";
import { useTranslation } from "react-i18next";
import DreamCard from "@/components/dreams/DreamCard";
import Pagination from "@/components/ui/Pagination";
import StatusCard from "@/components/ui/StatusCard";
import { getFriendlyErrorMessage } from "@/lib/api/errors";
import type { DreamsPage } from "@/lib/api/types";

type Props = {
  data?: DreamsPage;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
  view?: "grid" | "list";
};

export default function DreamsPaginated({
  data,
  isLoading,
  isFetching,
  error,
  onPageChange,
  onRetry,
  view = "grid",
}: Props) {
  const { t, i18n } = useTranslation();

  if (isLoading)
    return <StatusCard tone="loading" title={t("common.loading")} />;

  if (error)
    return (
      <StatusCard
        tone="error"
        title={t("common.errorGeneric")}
        message={getFriendlyErrorMessage(error, t, "dreams")}
        actionLabel={onRetry ? t("common.retry") : undefined}
        onAction={onRetry}
      />
    );

  const dreams = data?.dreams ?? [];
  const pages = data?.pages ?? 1;
  const page = data?.page ?? 1;

  if (!dreams.length)
    return (
      <StatusCard tone="empty" title={t("myDreams.empty")} />
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
