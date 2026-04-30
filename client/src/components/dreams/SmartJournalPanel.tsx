import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Brain, CalendarDays, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DreamsApi } from "@/lib/api/dreams";
import type { JournalCategoryInsight, SmartJournalInsights } from "@/lib/api/types";
import { CATEGORY_META } from "@/lib/api/categoryIcons";
import StatusCard from "@/components/ui/StatusCard";
import { getFriendlyErrorMessage } from "@/lib/api/errors";

const WINDOW_DAYS = 30;

function categoryLabel(category: string, t: ReturnType<typeof useTranslation>["t"]) {
  const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
  return meta ? t(meta.labelKey) : category;
}

function buildInsightLines(data: SmartJournalInsights, t: ReturnType<typeof useTranslation>["t"]) {
  const lines: string[] = [];
  const top = data.topCategories[0];
  const rising = data.risingCategories[0];

  if (data.dataQuality === "light") {
    lines.push(t("journal.insights.light"));
  }

  if (top) {
    lines.push(
      t("journal.insights.topCategory", {
        category: categoryLabel(top.category, t),
        count: top.count,
      })
    );
  }

  if (rising) {
    lines.push(
      t("journal.insights.risingCategory", {
        category: categoryLabel(rising.category, t),
        delta: rising.trendDelta,
      })
    );
  }

  if (data.latestStreakDays > 1) {
    lines.push(t("journal.insights.streak", { count: data.latestStreakDays }));
  }

  if (data.recentDreams > data.previousDreams) {
    lines.push(t("journal.insights.moreActive"));
  } else if (data.recentDreams === 0 && data.totalDreams > 0) {
    lines.push(t("journal.insights.noRecent"));
  }

  if (!lines.length) {
    lines.push(t("journal.insights.keepWriting"));
  }

  return lines.slice(0, 4);
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-white/55">
        <Icon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
        {label}
      </div>
      <div className="text-2xl font-extrabold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

function ThemeRow({ item, maxCount }: { item: JournalCategoryInsight; maxCount: number }) {
  const { t } = useTranslation();
  const label = categoryLabel(item.category, t);
  const width = maxCount > 0 ? Math.max(8, Math.round((item.count / maxCount) * 100)) : 8;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-800 dark:text-white/90">{label}</span>
        <span className="text-slate-500 dark:text-white/55">
          {t("journal.themeCount", { count: item.count })}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ActivityBars({ data }: { data: SmartJournalInsights }) {
  const { t, i18n } = useTranslation();
  const max = Math.max(1, ...data.weeklyActivity.map((point) => point.count));
  const locale = i18n.language === "he" ? "he-IL" : "en-US";

  return (
    <div className="flex h-32 items-end gap-2" aria-label={t("journal.activity")}>
      {data.weeklyActivity.map((point) => {
        const height = Math.max(10, Math.round((point.count / max) * 100));
        const label = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
          new Date(point.startISO)
        );

        return (
          <div key={point.startISO} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-fuchsia-500"
                style={{ height: `${height}%` }}
                title={t("journal.weekCount", { count: point.count })}
              />
            </div>
            <span className="max-w-full truncate text-[11px] text-slate-500 dark:text-white/50">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SmartJournalPanel({ enabled }: { enabled: boolean }) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["smart-journal-insights", WINDOW_DAYS],
    queryFn: () => DreamsApi.getSmartJournalInsights(WINDOW_DAYS),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  if (!enabled) return null;

  if (isLoading) {
    return (
      <section className="mb-8" dir={i18n.dir()}>
        <StatusCard tone="loading" title={t("journal.loading")} />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mb-8" dir={i18n.dir()}>
        <StatusCard
          tone="error"
          title={t("journal.errorTitle")}
          message={getFriendlyErrorMessage(error, t, "journal")}
          actionLabel={t("common.retry")}
          onAction={() => void refetch()}
        />
      </section>
    );
  }

  if (data.dataQuality === "empty") {
    return (
      <section className="mb-8" dir={i18n.dir()}>
        <StatusCard tone="empty" title={t("journal.emptyTitle")} message={t("journal.emptyBody")} />
      </section>
    );
  }

  const topCount = Math.max(1, data.topCategories[0]?.count ?? 1);
  const insightLines = buildInsightLines(data, t);
  const focusCategory = data.suggestedFocusCategory
    ? categoryLabel(data.suggestedFocusCategory, t)
    : t("journal.fallbackFocus");
  const themeRows = data.recurringCategories.length
    ? data.recurringCategories
    : data.topCategories.slice(0, 4);

  return (
    <section
      dir={i18n.dir()}
      className="mb-8 overflow-hidden rounded-2xl border border-black/10 bg-white/75 shadow-[0_20px_55px_-38px_rgba(15,23,42,.75)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]"
    >
      <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
              <Brain className="h-4 w-4" />
              {t("journal.badge")}
            </div>
            <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {t("journal.title")}
            </h3>
          </div>
          <div className="text-sm text-slate-500 dark:text-white/60">
            {t("journal.period", { days: data.windowDays })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric icon={Sparkles} label={t("journal.metrics.total")} value={data.totalDreams} />
            <Metric icon={CalendarDays} label={t("journal.metrics.recent")} value={data.recentDreams} />
            <Metric icon={Flame} label={t("journal.metrics.streak")} value={data.latestStreakDays} />
            <Metric icon={BarChart3} label={t("journal.metrics.activeDays")} value={data.activeDays} />
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {t("journal.insightsTitle")}
            </h4>
            <div className="grid gap-2">
              {insightLines.map((line) => (
                <div
                  key={line}
                  className="rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              {t("journal.activity")}
            </h4>
            <ActivityBars data={data} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
              {t("journal.recurringTitle")}
            </h4>
            <div className="space-y-4">
              {themeRows.length ? (
                themeRows.map((item) => (
                  <ThemeRow key={item.category} item={item} maxCount={topCount} />
                ))
              ) : (
                <div className="text-sm leading-6 text-slate-600 dark:text-white/65">
                  {t("journal.noThemes")}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-4 dark:border-amber-300/20 dark:bg-amber-300/10">
            <h4 className="mb-3 text-sm font-bold text-amber-900 dark:text-amber-100">
              {t("journal.promptsTitle")}
            </h4>
            <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-white/75">
              <li>{t("journal.prompts.category", { category: focusCategory })}</li>
              <li>{t("journal.prompts.pattern")}</li>
              <li>{t("journal.prompts.nextDream")}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
