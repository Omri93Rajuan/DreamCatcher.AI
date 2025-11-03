import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export type GlobalDreamStats = {
  totalAll: number; // סה"כ חלומות
  newSince: number; // חדשים ב־N ימים
  publishedSince: number; // פורסמו ב־N ימים
  windowDays: number; // N
  sinceISO?: string;
};

type Period = "week" | "month" | "year";

type Props = {
  stats: GlobalDreamStats;
  className?: string;
  showPeriodToggle?: boolean;
  period?: Period;
  onPeriodChange?: (p: Period) => void;
  accent?: string; // למשל זהב #F2C94C
  /** צבע המספרים בגרדיאנט צהוב-כתום */
  numberGradient?: string;
  /** להנפיש מכלום בכל Mount / Refresh */
  animateFromZero?: boolean;
  /** משך אנימציית המספרים במ״ש */
  animationDurationMs?: number;
};

function PeriodToggle({
  value,
  onChange,
  accent = "#F2C94C",
}: {
  value: Period;
  onChange?: (v: Period) => void;
  accent?: string;
}) {
  const items: Array<{ key: Period; label: string }> = [
    { key: "week", label: "שבוע" },
    { key: "month", label: "חודש" },
    { key: "year", label: "שנה" },
  ];
  return (
    <div
      className="inline-flex gap-2 rounded-full bg-white/5 p-1 border border-white/10"
      dir="rtl"
    >
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange?.(it.key)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              active ? "text-black" : "text-white/80"
            }`}
            style={{ background: active ? accent : "transparent" }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function AnimatedNumber({
  value,
  enabled = true,
  duration = 600,
  from = 0,
}: {
  value: number;
  enabled?: boolean;
  duration?: number;
  from?: number;
}) {
  const [display, setDisplay] = React.useState<number>(() => Math.round(from));
  React.useEffect(() => {
    if (!enabled) {
      setDisplay(Math.round(value));
      return;
    }
    const start = performance.now();
    const fromVal = from;
    const to = value;
    let raf = 0 as number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(fromVal + (to - fromVal) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, enabled, duration, from]);
  return <>{display.toLocaleString()}</>;
}

export default function StatsPanelUltraCompact({
  stats,
  className,
  showPeriodToggle = false,
  period = "month",
  onPeriodChange,
  accent = "#F2C94C",
  numberGradient,
  animateFromZero = true,
  animationDurationMs = 700,
}: Props) {
  const KPIs: Array<{ value: number; caption: string }> = [
    { value: stats.totalAll, caption: 'סה"כ חלומות' },
    { value: stats.newSince, caption: `חדשים ב-${stats.windowDays} ימים` },
    {
      value: stats.publishedSince,
      caption: `פורסמו ב-${stats.windowDays} ימים`,
    },
  ];

  const numGradient =
    numberGradient ||
    "linear-gradient(180deg, #FFE08A 0%, #F5B948 55%, #F0941F 100%)";

  return (
    <section dir="rtl" className={className} aria-label="מדדים עיקריים">
      {showPeriodToggle && (
        <div className="mb-3">
          <PeriodToggle
            value={period}
            onChange={onPeriodChange}
            accent={accent}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KPIs.map((k, idx) => (
          <Card
            key={idx}
            className="relative rounded-3xl border border-white/15 bg-white/5 overflow-hidden"
          >
            <CardContent className=" relative h-32">
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <span
                  className="font-extrabold leading-none tabular-nums select-none"
                  style={{
                    fontSize: "72px",
                    backgroundImage: numGradient,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 2px 12px rgba(245, 166, 35, 0.15)",
                  }}
                >
                  <AnimatedNumber
                    value={k.value}
                    enabled
                    duration={animationDurationMs}
                    from={animateFromZero ? 0 : k.value}
                  />
                </span>
              </div>

              <div className="relative z-[1] h-0">
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-base md:text-lg text-white/75 whitespace-nowrap">
                  {k.caption}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
