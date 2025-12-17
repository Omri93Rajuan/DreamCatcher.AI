import * as React from "react";
import { motion } from "framer-motion";
import {
  Gauge,
  Heart,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type SeriesPoint = {
  day: string;
  views: number;
  likes: number;
  score: number;
};
export type PopularRowForFlip = {
  rank: number;
  dreamId?: string;
  id?: string;
  _id?: string;
  title: string;
  isShared?: boolean;
  views: number;
  likes: number;
  score: number;
  percentChange: number | null;
  series?: SeriesPoint[];
};

const fmtLabel = (iso: string, locale: string) => {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7) || "1") - 1;
  const d = Number((iso[7] && iso.slice(8, 10)) || "1");
  const dt = new Date(y, m, d);
  const fallback = locale === "he" ? "he-IL" : "en-US";
  return dt.toLocaleDateString(
    fallback,
    iso.length >= 10
      ? { day: "2-digit", month: "2-digit" }
      : { month: "2-digit", year: "2-digit" }
  );
};

export default function FlipDreamCard({
  row,
  windowDaysLabel,
  hideRank = false,
  hideChartIfEmpty = true,
}: {
  row: PopularRowForFlip;
  windowDaysLabel: string;
  hideRank?: boolean;
  hideChartIfEmpty?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dreamId = (row?.dreamId ?? row?.id ?? row?._id) as string | undefined;
  const nf = React.useMemo(
    () => new Intl.NumberFormat(i18n.language === "he" ? "he-IL" : "en-US"),
    [i18n.language]
  );
  if (!dreamId) return null;

  const [flipped, setFlipped] = React.useState(false);
  const loadedRef = React.useRef(false);
  const { data: dream } = useQuery<Dream>({
    queryKey: ["dream", dreamId],
    queryFn: () => DreamsApi.getById(dreamId),
    enabled: flipped && !loadedRef.current,
  });
  React.useEffect(() => {
    if (flipped && !loadedRef.current) {
      loadedRef.current = true;
      DreamsApi.recordActivity?.(dreamId, "view").catch(() => {});
    }
  }, [flipped, dreamId]);
  React.useEffect(() => {
    if (dreamId) DreamsApi.recordActivity(dreamId, "view");
  }, [dreamId]);

  const userInput = (dream?.userInput ?? "").trim();
  const interpretation = (
    (dream as any)?.aiResponse ?? (dream as any)?.interpretation ?? ""
  ).trim();
  const series = Array.isArray(row.series) ? row.series : [];

  return (
    <div
      className="
        relative h-64 rounded-2xl overflow-hidden cursor-pointer select-none
        border bg-white/80 border-black/10 backdrop-blur-sm
        dark:bg-white/[0.06] dark:border-white/10 dark:backdrop-blur-md
        shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,.35)]
      "
      onClick={() => setFlipped((v) => !v)}
      role="button"
      aria-label={t("myDreams.flipAria")}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((v) => !v)}
      style={{ perspective: 1000 }}
      dir={i18n.dir()}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 p-4" style={{ backfaceVisibility: "hidden" }}>
          {!hideRank && (
            <div className="absolute top-3 right-3 z-10 text-xs font-bold bg-amber-400 text-slate-900 rounded-full px-2 py-1">
              #{row.rank}
            </div>
          )}

          <h3 className="text-lg font-semibold line-clamp-2 pr-8 text-slate-900 dark:text-white">
            {row.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-white/85">
              <Gauge className="w-4 h-4" />
              {nf.format(row.score)}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-white/85">
              <Clock className="w-4 h-4" />
              {windowDaysLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-white/85">
              <Heart className="w-4 h-4" />
              {nf.format(row.likes)}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-white/85">
              <Eye className="w-4 h-4" />
              {nf.format(row.views)}
            </span>
            {row.percentChange !== null && (
              <span
                className={[
                  "inline-flex items-center gap-1",
                  (row.percentChange ?? 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                ].join(" ")}
                title={t("dreams.card.change")}
              >
                {(row.percentChange ?? 0) >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(row.percentChange ?? 0).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="h-28 mt-3 rounded-md text-sky-600 dark:text-sky-300">
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${dreamId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: any) => [nf.format(Number(v)), t("dreams.card.score")]}
                    labelFormatter={(label) =>
                      typeof label === "string" ? fmtLabel(label, i18n.language) : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill={`url(#grad-${dreamId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : hideChartIfEmpty ? null : (
              <div className="h-full w-full rounded-md bg-black/5 dark:bg-white/5" />
            )}
          </div>

          <div className="absolute bottom-3 left-4 text-sm text-amber-600 dark:text-amber-300">
            {t("myDreams.flip")}
          </div>
        </div>

        <div
          className="
            absolute inset-0 p-4
            bg-white/80 border-t border-black/10
            dark:bg-white/[0.06] dark:border-white/10
          "
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            {t("dreams.card.fullDream")}
          </h3>

          <div className="grid grid-rows-[1fr_auto] h-[calc(100%-2rem)]">
            <div
              className="
                overflow-y-auto pr-1 space-y-3
                scrollbar-thin scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20
              "
            >
              {userInput ? (
                <div>
                  <div className="text-sm text-slate-600 dark:text-white/70 mb-1">
                    {t("dreams.card.dream")}
                  </div>
                  <p className="leading-relaxed text-slate-900 dark:text-white">
                    {userInput}
                  </p>
                </div>
              ) : (
                <div className="text-slate-600 dark:text-white/60">
                  {t("common.loading")}
                </div>
              )}

              {interpretation ? (
                <div>
                  <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">
                    {t("dreams.card.ai")}
                  </div>
                  <p className="leading-relaxed text-slate-900 dark:text-white">
                    {interpretation}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="pt-2 text-right text-sm text-amber-700 dark:text-amber-300">
              {t("myDreams.flipBack")}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
