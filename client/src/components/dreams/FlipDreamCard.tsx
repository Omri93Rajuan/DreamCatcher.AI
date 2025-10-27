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
  dreamId?: string; // עשוי להגיע כשדה אחר – לכן אופציונלי כאן
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

const nf = new Intl.NumberFormat("he-IL");
const fmtLabel = (iso: string) => {
  // אם זו נקודה יומית נקבל YYYY-MM-DD; אם חודשית – YYYY-MM
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7) || "1") - 1;
  const d = Number((iso[7] && iso.slice(8, 10)) || "1");
  const dt = new Date(y, m, d);
  return dt.toLocaleDateString(
    "he-IL",
    iso.length >= 10
      ? { day: "2-digit", month: "2-digit" }
      : { month: "2-digit", year: "2-digit" }
  );
};

export default function FlipDreamCard({
  row,
  windowDaysLabel,
}: {
  row: PopularRowForFlip;
  windowDaysLabel: string;
}) {
  // ← מזהה בטוח מהשורה
  const dreamId = (row?.dreamId ?? row?.id ?? row?._id) as string | undefined;
  if (!dreamId) return null; // בלי מזהה אין מה לרנדר

  const [flipped, setFlipped] = React.useState(false);
  const loadedRef = React.useRef(false);

  // נטען את החלום רק לאחר היפוך ראשון
  const { data: dream } = useQuery<Dream>({
    queryKey: ["dream", dreamId],
    queryFn: () => DreamsApi.getById(dreamId),
    enabled: flipped && !loadedRef.current,
  });

  React.useEffect(() => {
    if (flipped && !loadedRef.current) {
      loadedRef.current = true;
      // רישום צפייה, לא קריטי אם נכשל
      DreamsApi.recordActivity?.(dreamId, "view").catch(() => {});
    }
  }, [flipped, dreamId]);

  const userInput = (dream?.userInput ?? "").trim();
  const interpretation = (
    (dream as any)?.aiResponse ??
    (dream as any)?.interpretation ??
    ""
  ).trim();

  const series = Array.isArray(row.series) ? row.series : [];

  return (
    <div
      className="relative h-64 rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer select-none"
      onClick={() => setFlipped((v) => !v)}
      role="button"
      aria-label="הפוך כרטיס"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && setFlipped((v) => !v)
      }
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* קדמי: מדדים + גרף */}
        <div
          className="absolute inset-0 p-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-3 right-3 z-10 text-xs font-bold bg-amber-400 text-black rounded-full px-2 py-1">
            #{row.rank}
          </div>

          <h3 className="text-lg font-semibold line-clamp-2 pr-8">
            {row.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
            <span className="inline-flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              {nf.format(row.score)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {windowDaysLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {nf.format(row.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {nf.format(row.views)}
            </span>
            {row.percentChange !== null && (
              <span
                className={`inline-flex items-center gap-1 ${
                  (row.percentChange ?? 0) >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
                title="שינוי מול התקופה הקודמת"
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

          <div className="h-28 mt-3 rounded-md">
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`grad-${dreamId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#60a5fa"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="#60a5fa"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: any) => [nf.format(Number(v)), "ציון"]}
                    labelFormatter={(label) =>
                      typeof label === "string" ? fmtLabel(label) : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7dd3fc"
                    strokeWidth={2}
                    fill={`url(#grad-${dreamId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-md bg-white/5" />
            )}
          </div>

          <div className="absolute bottom-3 left-4 text-amber-300">
            הפוך להצגה
          </div>
        </div>

        {/* אחורי: טקסט חלום + פרשנות */}
        <div
          className="absolute inset-0 p-4 bg-white/5"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <h3 className="text-lg font-semibold mb-2">תצוגת חלום</h3>

          <div className="grid grid-rows-[1fr_auto] h-[calc(100%-2rem)]">
            <div className="overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
              {userInput ? (
                <div>
                  <div className="text-sm text-white/70 mb-1">החלום</div>
                  <p className="leading-relaxed">{userInput}</p>
                </div>
              ) : (
                <div className="text-white/60">טוען חלום…</div>
              )}
              {interpretation ? (
                <div>
                  <div className="text-sm text-amber-300 mb-1">הפרשנות</div>
                  <p className="leading-relaxed">{interpretation}</p>
                </div>
              ) : null}
            </div>

            <div className="pt-2 text-right text-sm text-amber-300">
              הפוך חזרה
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
