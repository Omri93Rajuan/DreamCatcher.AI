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

const CHART_WIDTH = 320;
const CHART_HEIGHT = 112;
const CHART_PAD = 8;

function SparklineChart({
  series,
  label,
}: {
  series: SeriesPoint[];
  label: string;
}) {
  const chart = React.useMemo(() => {
    const points = series
      .map((point) => Number(point.score))
      .filter((score) => Number.isFinite(score));

    if (!points.length) return null;

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const usableWidth = CHART_WIDTH - CHART_PAD * 2;
    const usableHeight = CHART_HEIGHT - CHART_PAD * 2;
    const plotted = points.map((score, index) => {
      const x =
        CHART_PAD +
        (points.length === 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth);
      const y = CHART_PAD + (1 - (score - min) / range) * usableHeight;
      return { x, y };
    });

    const linePath =
      plotted.length === 1
        ? `M ${plotted[0].x - 18} ${plotted[0].y} L ${plotted[0].x + 18} ${plotted[0].y}`
        : plotted.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

    const areaPath =
      plotted.length > 1
        ? `M ${plotted[0].x} ${CHART_HEIGHT - CHART_PAD} ` +
          plotted.map((point) => `L ${point.x} ${point.y}`).join(" ") +
          ` L ${plotted[plotted.length - 1].x} ${CHART_HEIGHT - CHART_PAD} Z`
        : "";

    return { areaPath, linePath, first: plotted[0], last: plotted[plotted.length - 1] };
  }, [series]);

  if (!chart) return null;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
    >
      {chart.areaPath && <path d={chart.areaPath} fill="currentColor" opacity={0.12} />}
      <path
        d={chart.linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={chart.first.x} cy={chart.first.y} r="3" fill="currentColor" opacity={0.45} />
      <circle cx={chart.last.x} cy={chart.last.y} r="4" fill="currentColor" />
    </svg>
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
              <SparklineChart series={series} label={t("dreams.card.score")} />
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
