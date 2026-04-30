import * as React from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData, } from "@tanstack/react-query";
import { Search, Loader2, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DreamsApi, DreamsListResult } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import { useAuthStore } from "@/stores/useAuthStore";
import DreamFlipCardMini from "@/components/dreams/DreamFlipCardMini";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import StatusCard from "@/components/ui/StatusCard";
import { getFriendlyErrorMessage } from "@/lib/api/errors";
export default function MyDreams() {
    const { t, i18n } = useTranslation();
    const qc = useQueryClient();
    const { user } = useAuthStore();
    const userId: string | undefined = (user as any)?._id ?? (user as any)?.id ?? undefined;
    const isReady = !!userId;
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(12);
    const [q, setQ] = React.useState("");
    const [search, setSearch] = React.useState("");
    const queryKey = React.useMemo(
        () => ["my-dreams", userId, page, limit, search] as const,
        [userId, page, limit, search]
    );
    const { data, isLoading, isFetching, error, refetch } = useQuery<DreamsListResult>({
        queryKey,
        enabled: isReady,
        staleTime: 60000,
        placeholderData: keepPreviousData,
        queryFn: () => DreamsApi.listByUser(userId!, {
            page,
            limit,
            search: search || undefined,
        }),
    });
    const dreams: Dream[] = data?.dreams ?? [];
    const total = data?.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / (data?.limit ?? limit)));
    const mToggleShare = useMutation({
        mutationFn: ({ id, next }: {
            id: string;
            next: boolean;
        }) => DreamsApi.setShare(id, next),
        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({ queryKey });
            const prev = qc.getQueryData<DreamsListResult>(queryKey);
            qc.setQueryData<DreamsListResult>(queryKey, (curr) => curr
                ? {
                    ...curr,
                    dreams: curr.dreams.map((d) => d._id === id ? { ...d, isShared: next } : d),
                }
                : curr);
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
            qc.setQueryData<DreamsListResult>(queryKey, (curr) => curr
                ? {
                    ...curr,
                    dreams: curr.dreams.filter((d) => d._id !== id),
                    total: Math.max(0, (curr.total ?? 0) - 1),
                }
                : curr);
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
        if (next === search)
            qc.invalidateQueries({ queryKey });
    };
    const clearSearch = () => {
        setQ("");
        setPage(1);
        setSearch("");
    };
    if (!isReady) {
        return (<section dir={i18n.dir()} className="max-w-7xl mx-auto px-4 mb-20">
        <Header q={q} setQ={setQ} onSearch={onSearch} onClear={clearSearch} isFetching/>
        <SkeletonGrid />
      </section>);
    }
    return (<section dir={i18n.dir()} className="max-w-7xl mx-auto px-4 mb-20">
      <Header q={q} setQ={setQ} onSearch={onSearch} onClear={clearSearch} isFetching={isFetching}/>

      {isLoading ? (<SkeletonGrid />) : error ? (<StatusCard tone="error" title={t("common.errorGeneric")} message={getFriendlyErrorMessage(error, t, "myDreams")} actionLabel={t("common.retry")} onAction={() => void refetch()}/>) : dreams.length === 0 ? (<StatusCard tone="empty" title={t("myDreams.empty")}/>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((d, index) => (<DreamFlipCardMini key={d?._id || `${page}-${index}`} dream={d} onToggleShare={(next) => mToggleShare.mutate({ id: d._id, next })} onDelete={() => mRemove.mutate(d._id)} maxWordsFront={30} maxWordsBack={30}/>))}
        </div>)}

      {pages > 1 && (<div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            {t("pagination.prev")}
          </Button>
          <span className="text-black/80 dark:text-white text-lg py-2">
            {t("myDreams.pageLabel", { page, pages })}
          </span>
          <Button variant="outline" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
            {t("pagination.next")}
          </Button>
        </div>)}
    </section>);
}
function Header({ q, setQ, onSearch, onClear, isFetching, }: {
    q: string;
    setQ: (v: string) => void;
    onSearch: () => void;
    onClear: () => void;
    isFetching: boolean;
}) {
    const { t, i18n } = useTranslation();
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement)?.tagName === "INPUT")
                return;
            if (e.key === "/") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
        {t("layout.nav.myDreams")}
      </h2>

      <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:items-center">
        
        <div className="relative group">
          <Search className="
              pointer-events-none absolute right-3 top-2.5 w-4 h-4
              text-slate-500 dark:text-white/60
              group-focus-within:text-amber-600
              dark:group-focus-within:text-amber-300
            "/>
          <Input ref={inputRef} dir={i18n.dir()} placeholder={t("myDreams.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter")
                onSearch();
            if (e.key === "Escape" && q)
                onClear();
        }} className="
              pr-9 w-full sm:w-80 rounded-xl
              bg-white/70 text-slate-900 placeholder:text-slate-500
              border border-black/10 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-amber-500/35 focus:border-amber-500/60

              dark:bg-white/[0.08] dark:text-white dark:placeholder:text-white/50
              dark:border-white/15 dark:focus:ring-amber-300/25 dark:focus:border-amber-300/40

              selection:bg-amber-200 selection:text-slate-900
              dark:selection:bg-amber-300/30 dark:selection:text-white
            "/>

          
          {q && (<button type="button" onClick={onClear} className="
                absolute left-2 top-2.5 inline-flex items-center justify-center
                w-6 h-6 rounded-md
                text-slate-600 hover:text-slate-800 hover:bg-black/5
                dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10
              " aria-label={t("myDreams.clearSearch")} title={t("myDreams.clearSearch")}>
              <XIcon className="w-4 h-4"/>
            </button>)}

          
          {isFetching && !q && (<Loader2 className="
                absolute left-2 top-2.5 w-4 h-4 animate-spin
                text-amber-600 dark:text-amber-300
              "/>)}
        </div>

        <Button variant="primary" onClick={onSearch} disabled={isFetching} className="
            w-full sm:w-auto text-white shadow-sm
            disabled:opacity-70 disabled:cursor-not-allowed
          " title={t("myDreams.searchTitle")}>
          {t("myDreams.search")}
        </Button>
      </div>
    </div>);
}
function SkeletonGrid() {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border border-black/10 bg-white/70 animate-pulse h-[300px] dark:bg-white/[0.06] dark:border-white/10"/>))}
    </div>);
}
