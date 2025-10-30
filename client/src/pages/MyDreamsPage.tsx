import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DreamsApi, DreamsListResult } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import { useAuthStore } from "@/stores/useAuthStore";
import DreamFlipCardMini from "@/components/dreams/DreamFlipCardMini";

/* ================================
   MyDreams — Grid of Flip Cards
   ================================ */

export default function MyDreams() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const userId: string | undefined =
    (user as any)?._id ?? (user as any)?.id ?? undefined;
  const isReady = !!userId;

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [q, setQ] = React.useState("");

  const queryKey = ["my-dreams", userId, page, limit, q] as const;

  const { data, isLoading, isFetching } = useQuery<DreamsListResult>({
    queryKey,
    enabled: isReady,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: () =>
      DreamsApi.listByUser(userId!, {
        page,
        limit,
        search: q.trim() || undefined,
      }),
  });

  const dreams: Dream[] = data?.dreams ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? limit)));

  // toggle share
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
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(queryKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  // remove
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
    onError: (_e, _v, ctx) => {
      ctx?.prev && qc.setQueryData(queryKey, ctx.prev);
      alert("מחיקה נכשלה");
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const onSearch = () => {
    setPage(1);
    qc.invalidateQueries({ queryKey });
  };

  if (!isReady) {
    return (
      <section dir="rtl" className="max-w-7xl mx-auto px-4 mb-20">
        <Header q={q} setQ={setQ} onSearch={onSearch} isFetching />
        <SkeletonGrid />
      </section>
    );
  }

  return (
    <section dir="rtl" className="max-w-7xl mx-auto px-4 mb-20">
      <Header q={q} setQ={setQ} onSearch={onSearch} isFetching={isFetching} />

      {isLoading ? (
        <SkeletonGrid />
      ) : dreams.length === 0 ? (
        <div className="text-white/70 text-center py-20">
          אין חלומות להצגה כרגע.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((d) => (
            <DreamFlipCardMini
              key={d?._id ?? Math.random().toString(36)}
              dream={d}
              onToggleShare={(next) => mToggleShare.mutate({ id: d._id, next })}
              onDelete={() => mRemove.mutate(d._id)}
              maxWordsFront={30}
              maxWordsBack={30}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            הקודם
          </Button>
          <span className="text-white/80 text-sm py-2">
            עמוד {page} מתוך {pages}
          </span>
          <Button
            variant="outline"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            הבא
          </Button>
        </div>
      )}
    </section>
  );
}

function Header({
  q,
  setQ,
  onSearch,
  isFetching,
}: {
  q: string;
  setQ: (v: string) => void;
  onSearch: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-purple-200 to-rose-200 bg-clip-text text-transparent">
        החלומות שלי
      </h2>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-purple-300" />
          <Input
            dir="rtl"
            placeholder="חיפוש לפי טקסט/כותרת…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pr-9 w-72 bg-white/5 border-white/15 text-white focus:border-purple-400/60"
          />
        </div>
        <Button variant="primary" onClick={onSearch} disabled={isFetching}>
          חפש
        </Button>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 animate-pulse h-[300px]"
        />
      ))}
    </div>
  );
}
