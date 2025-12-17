import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
export type GlobalDreamStats = {
    totalAll: number;
    newSince: number;
    publishedSince: number;
    windowDays: number;
    sinceISO?: string;
};
type Period = "week" | "month" | "year";
type Props = {
    stats: GlobalDreamStats;
    className?: string;
    showPeriodToggle?: boolean;
    period?: Period;
    onPeriodChange?: (p: Period) => void;
    accent?: string;
    numberGradient?: string;
    animateFromZero?: boolean;
    animationDurationMs?: number;
};
function PeriodToggle({ value, onChange, accent = "#F2C94C", }: {
    value: Period;
    onChange?: (v: Period) => void;
    accent?: string;
}) {
    const { t, i18n } = useTranslation();
    const items: Array<{
        key: Period;
        label: string;
    }> = [
        { key: "week", label: t("stats.period.week") },
        { key: "month", label: t("stats.period.month") },
        { key: "year", label: t("stats.period.year") },
    ];
    return (<div className="
        inline-flex gap-2 rounded-full p-1 border
        bg-white/80 border-black/10
        dark:bg-white/[0.06] dark:border-white/10
      " dir={i18n.dir()}>
      {items.map((it) => {
            const active = it.key === value;
            return (<button key={it.key} type="button" onClick={() => onChange?.(it.key)} className={[
                    "px-3 py-1.5 text-sm rounded-full transition-all",
                    active
                        ? "text-slate-900 dark:text-slate-900"
                        : "text-slate-700 hover:bg-black/5 dark:text-white/80 hover:dark:bg-white/10",
                ].join(" ")} style={{ background: active ? accent : "transparent" }} aria-pressed={active}>
            {it.label}
          </button>);
        })}
    </div>);
}
function AnimatedNumber({ value, enabled = true, duration = 600, from = 0, }: {
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
        let raf = 0 as unknown as number;
        const start = performance.now();
        const fromVal = from;
        const to = value;
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(fromVal + (to - fromVal) * eased));
            if (p < 1)
                raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, enabled, duration, from]);
    return <>{display.toLocaleString()}</>;
}
export default function StatsPanelUltraCompact({ stats, className, showPeriodToggle = false, period = "month", onPeriodChange, accent = "#F2C94C", numberGradient, animateFromZero = true, animationDurationMs = 700, }: Props) {
    const { t, i18n } = useTranslation();
    const KPIs: Array<{
        value: number;
        caption: string;
    }> = [
        { value: stats.totalAll, caption: t("stats.total") },
        { value: stats.newSince, caption: t("stats.newSince", { days: stats.windowDays }) },
        {
            value: stats.publishedSince,
            caption: t("stats.publishedSince", { days: stats.windowDays }),
        },
    ];
    const numGradient = numberGradient ||
        "linear-gradient(180deg, #FFE08A 0%, #F5B948 55%, #F0941F 100%)";
    return (<section dir={i18n.dir()} className={className} aria-label={t("stats.aria")}>
      {showPeriodToggle && (<div className="mb-3">
          <PeriodToggle value={period} onChange={onPeriodChange} accent={accent}/>
        </div>)}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KPIs.map((k, idx) => (<Card key={idx} className="relative rounded-3xl overflow-hidden">
            <CardContent className="relative h-32">
              
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <span className="font-extrabold leading-none tabular-nums select-none" style={{
                fontSize: "72px",
                backgroundImage: numGradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 2px 12px rgba(245, 166, 35, 0.15)",
            }}>
                  <AnimatedNumber value={k.value} enabled duration={animationDurationMs} from={animateFromZero ? 0 : k.value}/>
                </span>
              </div>

              
              <div className="relative z-[1] h-0">
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-base md:text-lg whitespace-nowrap
                                text-slate-700 dark:text-white/75">
                  {k.caption}
                </div>
              </div>

              
              <div className="pointer-events-none absolute inset-0 rounded-3xl border
                              border-black/10 dark:border-white/10"/>
            </CardContent>
          </Card>))}
      </div>
    </section>);
}
