// src/components/dreams/PopularDreams.tsx
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import FlipDreamCard, {
  PopularRowForFlip,
} from "@/components/dreams/FlipDreamCard";

type WindowKind = 7 | 30 | 365;

export default function PopularDreams() {
  // ברירת מחדל: חודש
  const [windowKind, setWindowKind] = React.useState<WindowKind>(30);

  const windowLabel = React.useMemo(
    () => (windowKind === 7 ? "שבוע" : windowKind === 30 ? "חודש" : "שנה"),
    [windowKind]
  );

  const {
    data = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<PopularRowForFlip[] | any[]>({
    queryKey: ["popular", windowKind],
    queryFn: () => DreamsApi.getPopular(windowKind),
    staleTime: 60_000,
  });

  // נרמול מינימלי לפני רנדר
  const safeRows: PopularRowForFlip[] = (Array.isArray(data) ? data : [])
    .filter(Boolean)
    .map((raw: any, idx: number) => {
      const dreamId = raw?.dreamId ?? raw?.id ?? raw?._id ?? "";
      const series = Array.isArray(raw?.series) ? raw.series : [];
      return {
        rank: Number(raw?.rank ?? idx + 1),
        dreamId,
        title: String(raw?.title ?? "חלום"),
        isShared: Boolean(raw?.isShared ?? true),
        views: Number(raw?.views ?? 0),
        likes: Number(raw?.likes ?? 0),
        score: Number(raw?.score ?? 0),
        percentChange:
          raw?.percentChange === null || raw?.percentChange === undefined
            ? null
            : Number(raw.percentChange),
        series,
      };
    })
    .filter((r) => !!r.dreamId);

  return (
    <section className="max-w-7xl mx-auto px-4 mb-20" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            החלומות הפופולריים ביותר
          </h2>
        </div>

        {/* Window toggle */}
        <div
          className="flex items-center gap-2 rounded-xl p-1 border
                        bg-white/80 border-black/10 backdrop-blur-sm
                        dark:bg-white/[0.06] dark:border-white/10 dark:backdrop-blur-md"
        >
          {([7, 30, 365] as WindowKind[]).map((n) => (
            <button
              key={n}
              onClick={() => setWindowKind(n)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm transition",
                windowKind === n
                  ? "bg-amber-400 text-slate-900"
                  : "text-slate-700 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10",
              ].join(" ")}
            >
              {n === 7 ? "שבוע" : n === 30 ? "חודש" : "שנה"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : error ? (
        <div
          className="flex items-center gap-2 rounded-xl p-4 border
                        text-rose-800 bg-rose-50 border-rose-200
                        dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30"
        >
          <AlertTriangle className="w-5 h-5" />
          <div>
            <div className="font-semibold">שגיאה בטעינת פופולרים</div>
            <div className="text-sm opacity-75">{(error as Error).message}</div>
          </div>
        </div>
      ) : safeRows.length === 0 ? (
        <div className="text-slate-700 dark:text-white/70">
          אין נתונים לתקופה הזו עדיין.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeRows.map((row, i) => (
            <motion.div
              key={`${row.dreamId}-${row.rank}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <FlipDreamCard row={row} windowDaysLabel={windowLabel} />
            </motion.div>
          ))}
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="mt-3 text-xs text-slate-600 dark:text-white/60">
          מרענן נתונים…
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
          className="h-64 rounded-2xl animate-pulse border
                     bg-white/70 border-black/10
                     dark:bg-white/[0.06] dark:border-white/10"
        />
      ))}
    </div>
  );
}
