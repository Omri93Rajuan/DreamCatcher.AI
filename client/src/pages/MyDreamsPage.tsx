// src/components/dreams/MyDreams.tsx
import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DreamsApi, DreamsListResult } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import { useAuthStore } from "@/stores/useAuthStore";
import FlipDreamCard, {
  PopularRowForFlip,
} from "@/components/dreams/FlipDreamCard";

export default function MyDreams() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  // קח מזהה בטוח משני השדות הנפוצים
  const userId = React.useMemo(() => user?.id ?? user?._id ?? null, [user]);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [q, setQ] = React.useState("");

  const queryKey = ["my-dreams", userId, page, limit, q] as const;

  const { data, isLoading, isFetching } = useQuery<DreamsListResult>({
    queryKey,
    enabled: !!userId, // <- היה !!user?._id
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: () =>
      DreamsApi.listByUser(userId!, {
        // <- היה user!._id
        page,
        limit,
        search: q.trim() || undefined,
      }),
  });

  const dreams: Dream[] = data?.dreams ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? limit)));

  const rows: PopularRowForFlip[] = dreams.map((d) => ({
    rank: 0, // נסתיר ב-Flip
    dreamId: d._id,
    title: d.title || "חלום",
    isShared: d.isShared,
    views: 0,
    likes: 0,
    score: 0,
    percentChange: null,
    series: [],
  }));

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

  return (
    <section dir="rtl" className="max-w-7xl mx-auto px-4 mb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">החלומות שלי</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-purple-300" />
            <Input
              dir="rtl"
              placeholder="חיפוש לפי טקסט/כותרת…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pr-9 w-64 font-he"
            />
          </div>
          <Button
            onClick={onSearch}
            disabled={isFetching}
            className="bg-purple-700 hover:bg-purple-800"
          >
            חפש
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : rows.length === 0 ? (
        <div className="text-white/70">אין חלומות להצגה כרגע.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((row) => {
            const d = dreams.find((x) => x._id === row.dreamId)!;
            return (
              <motion.div
                key={row.dreamId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-white/10 bg-white/5 text-white p-4 flex flex-col"
              >
                {/* הכרטיס — בלי מספור, בלי גרף ריק */}
                <FlipDreamCard
                  row={row}
                  windowDaysLabel="האוסף שלי"
                  hideRank
                  hideChartIfEmpty
                />

                {/* פוטר קבוע למטה */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      d.isShared ? "bg-emerald-700/40" : "bg-white/10"
                    }`}
                  >
                    {d.isShared ? "משותף" : "פרטי"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        mToggleShare.mutate({ id: d._id, next: !d.isShared });
                      }}
                      title={d.isShared ? "הפסק שיתוף" : "שתף עם כולם"}
                    >
                      {d.isShared ? (
                        <>
                          <Share2 className="w-4 h-4 ml-1" /> הפסק שיתוף
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 ml-1" /> שתף
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("למחוק את החלום הזה לצמיתות?"))
                          mRemove.mutate(d._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 ml-1" /> מחיקה
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            variant="secondary"
          >
            הקודם
          </Button>
          <span className="text-white/80 text-sm px-2 py-2">
            עמוד {page} מתוך {pages}
          </span>
          <Button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            variant="secondary"
          >
            הבא
          </Button>
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 animate-pulse h-64"
        />
      ))}
    </div>
  );
}
