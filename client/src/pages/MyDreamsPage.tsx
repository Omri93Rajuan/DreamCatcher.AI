import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Loader2,
  RefreshCw,
  Search,
  X as XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DreamFlipCardMini from "@/components/dreams/DreamFlipCardMini";
import SmartJournalPanel from "@/components/dreams/SmartJournalPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusCard from "@/components/ui/StatusCard";
import { DreamsApi, DreamsListResult } from "@/lib/api/dreams";
import { getFriendlyErrorMessage } from "@/lib/api/errors";
import type { Dream } from "@/lib/api/types";
import { useAuthStore } from "@/stores/useAuthStore";

export default function MyDreams() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const userId: string | undefined =
    (user as any)?._id ?? (user as any)?.id ?? undefined;
  const isReady = !!userId;
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");

  const queryKey = React.useMemo(
    () => ["my-dreams", userId, page, limit, search] as const,
    [userId, page, limit, search]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<DreamsListResult>({
      queryKey,
      enabled: isReady,
      staleTime: 60000,
      placeholderData: keepPreviousData,
      queryFn: () =>
        DreamsApi.listByUser(userId!, {
          page,
          limit,
          search: search || undefined,
        }),
    });

  const dreams: Dream[] = data?.dreams ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? limit)));

  const mToggleShare = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      DreamsApi.setShare(id, next),
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<DreamsListResult>(queryKey);
      qc.setQueryData<DreamsListResult>(queryKey, (curr) =>
        curr
          ? {
              ...curr,
              dreams: curr.dreams.map((d) =>
                d._id === id ? { ...d, isShared: next } : d
              ),
            }
          : curr
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      ctx?.prev && qc.setQueryData(queryKey, ctx.prev);
      toast.error(getFriendlyErrorMessage(e, t, "myDreams"));
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const mRemove = useMutation({
    mutationFn: (id: string) => DreamsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<DreamsListResult>(queryKey);
      qc.setQueryData<DreamsListResult>(queryKey, (curr) =>
        curr
          ? {
              ...curr,
              dreams: curr.dreams.filter((d) => d._id !== id),
              total: Math.max(0, (curr.total ?? 0) - 1),
            }
          : curr
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      ctx?.prev && qc.setQueryData(queryKey, ctx.prev);
      toast.error(getFriendlyErrorMessage(e, t, "deleteDream"));
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const onSearch = () => {
    const next = q.trim();
    setPage(1);
    setSearch(next);
    if (next === search) qc.invalidateQueries({ queryKey });
  };

  const clearSearch = () => {
    setQ("");
    setPage(1);
    setSearch("");
  };

  if (!isReady) {
    return (
      <main dir={i18n.dir()} className="mx-auto max-w-7xl px-4 pb-20">
        <Header
          q={q}
          setQ={setQ}
          onSearch={onSearch}
          onClear={clearSearch}
          isFetching
          total={0}
          page={1}
          pages={1}
          search={search}
        />
        <SkeletonGrid />
      </main>
    );
  }

  return (
    <main dir={i18n.dir()} className="mx-auto max-w-7xl px-4 pb-20">
      <Header
        q={q}
        setQ={setQ}
        onSearch={onSearch}
        onClear={clearSearch}
        isFetching={isFetching}
        total={total}
        page={page}
        pages={pages}
        search={search}
      />

      <SmartJournalPanel enabled={isReady} />

      <section className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t("myDreams.listEyebrow")}
            </p>
            <h2 className="text-2xl font-extrabold leading-tight text-slate-950 dark:text-white">
              {t("myDreams.listTitle")}
            </h2>
          </div>
          <div className="text-sm text-slate-500 dark:text-white/60">
            {t("myDreams.pageSummary", { page, pages, total })}
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <StatusCard
            tone="error"
            title={t("common.errorGeneric")}
            message={getFriendlyErrorMessage(error, t, "myDreams")}
            actionLabel={t("common.retry")}
            onAction={() => void refetch()}
          />
        ) : dreams.length === 0 ? (
          <StatusCard tone="empty" title={t("myDreams.empty")} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dreams.map((d, index) => (
              <DreamFlipCardMini
                key={d?._id || `${page}-${index}`}
                dream={d}
                onToggleShare={(next) => mToggleShare.mutate({ id: d._id, next })}
                onDelete={() => mRemove.mutate(d._id)}
                maxWordsFront={28}
                maxWordsBack={34}
                bodyHeight={250}
              />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("pagination.prev")}
            </Button>
            <span className="py-2 text-sm font-medium text-slate-600 dark:text-white/70">
              {t("myDreams.pageLabel", { page, pages })}
            </span>
            <Button
              variant="outline"
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("pagination.next")}
            </Button>
          </nav>
        )}
      </section>
    </main>
  );
}

function Header({
  q,
  setQ,
  onSearch,
  onClear,
  isFetching,
  total,
  page,
  pages,
  search,
}: {
  q: string;
  setQ: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isFetching: boolean;
  total: number;
  page: number;
  pages: number;
  search: string;
}) {
  const { t, i18n } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="mb-7 rounded-xl border border-black/10 bg-white/75 px-5 py-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/65">
            <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            {t("myDreams.eyebrow")}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-4xl">
            {t("layout.nav.myDreams")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/65 md:text-base">
            {t("myDreams.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <MetricPill
            icon={CalendarDays}
            label={t("myDreams.totalLabel")}
            value={String(total)}
          />
          <MetricPill
            icon={BookOpen}
            label={t("myDreams.currentPage")}
            value={`${page}/${pages}`}
          />
          <MetricPill
            icon={RefreshCw}
            label={t("myDreams.syncLabel")}
            value={isFetching ? t("myDreams.syncing") : t("myDreams.synced")}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-white/55" />
          <Input
            ref={inputRef}
            dir={i18n.dir()}
            placeholder={t("myDreams.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
              if (e.key === "Escape" && q) onClear();
            }}
            className="h-11 rounded-lg border-black/10 bg-white pr-10 text-slate-900 shadow-none placeholder:text-slate-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/25 dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:placeholder:text-white/45"
          />
          {q && (
            <button
              type="button"
              onClick={onClear}
              className="absolute left-2 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={t("myDreams.clearSearch")}
              title={t("myDreams.clearSearch")}
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {search && (
            <span className="text-xs font-medium text-slate-500 dark:text-white/55">
              {t("myDreams.searchActive", { query: search })}
            </span>
          )}
          <Button
            variant="primary"
            onClick={onSearch}
            disabled={isFetching}
            className="h-11 w-full gap-2 text-white sm:w-auto"
            title={t("myDreams.searchTitle")}
          >
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("myDreams.search")}
          </Button>
        </div>
      </div>
    </header>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-28 rounded-lg border border-black/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-white/50">
        <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
        {label}
      </div>
      <div className="text-sm font-bold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[336px] animate-pulse rounded-xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.06]"
        />
      ))}
    </div>
  );
}
