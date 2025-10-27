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
    keepPreviousData: true,
  });

  // נרמול מינימלי לפני רנדר – מבטיחים dreamId ו-series + ערכי ברירת מחדל למונים
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
    <section className="max-w-7xl mx-auto px-4 mb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-amber-400" />
          <h2 className="text-3xl font-bold">החלומות הפופולריים ביותר</h2>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {([7, 30, 365] as WindowKind[]).map((n) => (
            <button
              key={n}
              onClick={() => setWindowKind(n)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                windowKind === n
                  ? "bg-amber-400 text-black"
                  : "hover:bg-white/10"
              }`}
            >
              {n === 7 ? "שבוע" : n === 30 ? "חודש" : "שנה"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <div className="font-semibold">שגיאה בטעינת פופולרים</div>
            <div className="text-sm opacity-75">{(error as Error).message}</div>
          </div>
        </div>
      ) : safeRows.length === 0 ? (
        <div className="text-white/70">אין נתונים לתקופה הזו עדיין.</div>
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
        <div className="mt-3 text-xs text-white/60">מרענן נתונים…</div>
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
