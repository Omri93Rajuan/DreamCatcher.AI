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
export default function MyDreams() {
    const { t, i18n } = useTranslation();
    const qc = useQueryClient();
    const { user } = useAuthStore();
    const userId: string | undefined = (user as any)?._id ?? (user as any)?.id ?? undefined;
    const isReady = !!userId;
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(12);
    const [q, setQ] = React.useState("");
    const queryKey = ["my-dreams", userId, page, limit, q] as const;
    const { data, isLoading, isFetching } = useQuery<DreamsListResult>({
        queryKey,
        enabled: isReady,
        staleTime: 60000,
        placeholderData: keepPreviousData,
        queryFn: () => DreamsApi.listByUser(userId!, {
            page,
            limit,
            search: q.trim() || undefined,
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
        onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(queryKey, ctx.prev),
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
        onError: (_e, _v, ctx) => {
            ctx?.prev && qc.setQueryData(queryKey, ctx.prev);
            alert(t("common.errorGeneric"));
        },
        onSettled: () => qc.invalidateQueries({ queryKey }),
    });
    const onSearch = () => {
        setPage(1);
        qc.invalidateQueries({ queryKey });
    };
    if (!isReady) {
        return (<section dir={i18n.dir()} className="max-w-7xl mx-auto px-4 mb-20">
        <Header q={q} setQ={setQ} onSearch={onSearch} isFetching/>
        <SkeletonGrid />
      </section>);
    }
    return (<section dir={i18n.dir()} className="max-w-7xl mx-auto px-4 mb-20">
      <Header q={q} setQ={setQ} onSearch={onSearch} isFetching={isFetching}/>

      {isLoading ? (<SkeletonGrid />) : dreams.length === 0 ? (<div className="text-black dark:text-white/70 text-center py-20">
          {t("myDreams.empty")}
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((d) => (<DreamFlipCardMini key={d?._id ?? Math.random().toString(36)} dream={d} onToggleShare={(next) => mToggleShare.mutate({ id: d._id, next })} onDelete={() => mRemove.mutate(d._id)} maxWordsFront={30} maxWordsBack={30}/>))}
        </div>)}

      {pages > 1 && (<div className="flex justify-center gap-2 mt-10">
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
function Header({ q, setQ, onSearch, isFetching, }: {
    q: string;
    setQ: (v: string) => void;
    onSearch: () => void;
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
    return (<div className="flex items-center justify-between mb-8">
      <h2 className="
          font-extrabold leading-[1.1] tracking-tight
          text-2xl sm:text-2xl md:text-3xl
          bg-clip-text text-transparent
          bg-gradient-to-r from-[#D4A100] via-[#C4903A] to-[#B87E40]
          dark:from-purple-300 dark:via-purple-200 dark:to-amber-200
          drop-shadow-[0_1px_0_rgba(0,0,0,0.12)]
          dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.08)]
          mb-6
        ">
        {t("layout.nav.myDreams")}
      </h2>

      <div className="flex items-center gap-3">
        
        <div className="relative group">
          <Search className="
              pointer-events-none absolute right-3 top-2.5 w-4 h-4
              text-slate-500 dark:text-white/60
              group-focus-within:text-purple-600
              dark:group-focus-within:text-purple-300
            "/>
          <Input ref={inputRef} dir={i18n.dir()} placeholder={t("myDreams.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter")
                onSearch();
            if (e.key === "Escape" && q)
                setQ("");
        }} className="
              pr-9 w-72 rounded-xl
              bg-white/70 text-slate-900 placeholder:text-slate-500
              border border-black/10 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-purple-500/35 focus:border-purple-500/60

              dark:bg-white/[0.08] dark:text-white dark:placeholder:text-white/50
              dark:border-white/15 dark:focus:ring-purple-300/25 dark:focus:border-purple-300/40

              selection:bg-amber-200 selection:text-slate-900
              dark:selection:bg-amber-300/30 dark:selection:text-white
            "/>

          
          <div className="
              pointer-events-none absolute left-2 right-2 -bottom-[2px] h-[2px]
              rounded-full opacity-0 scale-x-75
              bg-gradient-to-r from-fuchsia-500 via-purple-500 to-amber-400
              transition-all duration-300
              group-focus-within:opacity-100 group-focus-within:scale-x-100
            "/>

          
          {q && (<button type="button" onClick={() => setQ("")} className="
                absolute left-2 top-2.5 inline-flex items-center justify-center
                w-6 h-6 rounded-md
                text-slate-600 hover:text-slate-800 hover:bg-black/5
                dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10
              " aria-label={t("myDreams.clearSearch")} title={t("myDreams.clearSearch")}>
              <XIcon className="w-4 h-4"/>
            </button>)}

          
          {isFetching && (<Loader2 className="
                absolute left-2 top-2.5 w-4 h-4 animate-spin
                text-purple-600 dark:text-purple-300
              "/>)}
        </div>

        <Button variant="primary" onClick={onSearch} disabled={isFetching} className="
            bg-gradient-to-r from-purple-600 to-amber-500
            hover:from-purple-500 hover:to-amber-400
            text-white shadow-md
            disabled:opacity-70 disabled:cursor-not-allowed
            dark:from-purple-500 dark:to-amber-400
            dark:hover:from-purple-400 dark:hover:to-amber-300
          " title={t("myDreams.searchTitle")}>
          {t("myDreams.search")}
        </Button>
      </div>
    </div>);
}
function SkeletonGrid() {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl bg-white/5 border border-white/10 animate-pulse h-[300px]"/>))}
    </div>);
}
