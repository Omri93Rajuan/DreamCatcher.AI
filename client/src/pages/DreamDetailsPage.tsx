import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  HeartPulse,
  Lightbulb,
  Loader2,
  Moon,
  RefreshCw,
  Share2,
  Sparkles,
  Tags,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactionsBar from "@/components/dreams/ReactionsBar";
import { Button } from "@/components/ui/button";
import StatusCard from "@/components/ui/StatusCard";
import { DreamsApi } from "@/lib/api/dreams";
import { getFriendlyErrorMessage } from "@/lib/api/errors";
import type { Dream, DreamSymbolInsight } from "@/lib/api/types";

function formatDate(date: string | Date | undefined, locale: string) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

function hasItems<T>(items?: T[] | null): items is T[] {
  return Array.isArray(items) && items.length > 0;
}

export default function DreamDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const queryKey = ["dream", id] as const;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => DreamsApi.getById(id!),
    enabled: !!id,
  });

  const shareMutation = useMutation({
    mutationFn: ({ dreamId, next }: { dreamId: string; next: boolean }) =>
      DreamsApi.setShare(dreamId, next),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ["my-dreams"] });
    },
  });

  React.useEffect(() => {
    if (id) {
      DreamsApi.recordActivity?.(id, "view").catch(() => {});
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10" dir={i18n.dir()}>
        <div className="h-72 animate-pulse rounded-xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.06]" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10" dir={i18n.dir()}>
        <StatusCard
          tone="error"
          title={t("dreamDetails.errorTitle")}
          message={
            error
              ? getFriendlyErrorMessage(error, t, "dreamDetails")
              : t("errors.notFound")
          }
          actionLabel={t("common.retry")}
          onAction={() => void refetch()}
        />
      </main>
    );
  }

  const dateLabel = formatDate(data.createdAt, i18n.language);
  const categories = hasItems(data.categories) ? data.categories : [];
  const insights = hasItems(data.insights) ? data.insights : [];
  const emotions = hasItems(data.emotions) ? data.emotions : [];
  const keySymbols = hasItems(data.keySymbols) ? data.keySymbols : [];
  const hasRichAnalysis =
    insights.length > 0 || emotions.length > 0 || keySymbols.length > 0;

  const toggleShare = () => {
    if (!data?._id || shareMutation.isPending) return;
    shareMutation.mutate({ dreamId: data._id, next: !data.isShared });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8" dir={i18n.dir()}>
      <header className="mb-7 rounded-xl border border-black/10 bg-white/80 px-5 py-5 shadow-[0_18px_46px_-34px_rgba(15,23,42,.8)] dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-white/70">
              {dateLabel && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.07] dark:text-white/75">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                {data.isShared
                  ? t("dreamDetails.sharedStatus")
                  : t("dreamDetails.privateStatus")}
              </span>
              {data._id && <ReactionsBar dreamId={data._id} />}
            </div>

            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-4xl">
              {data.title || t("dreams.untitled")}
            </h1>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            <Button
              variant="outline"
              onClick={() => navigate("/me/dreams")}
              className="gap-2 bg-white/80 dark:bg-white/[0.04]"
            >
              <BookmarkCheck className="h-4 w-4" />
              {t("dreamDetails.savedCta")}
            </Button>
            <Button
              variant="outline"
              onClick={toggleShare}
              disabled={shareMutation.isPending}
              className="gap-2 bg-white/80 dark:bg-white/[0.04]"
            >
              {shareMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {data.isShared
                ? t("dreamDetails.unshareCta")
                : t("dreamDetails.shareCta")}
            </Button>
            <Button onClick={() => navigate("/")} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("dreamDetails.newInterpretation")}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="space-y-7">
          <TextSection
            icon={Moon}
            title={t("dreamDetails.dream")}
            body={data.userInput || "-"}
          />

          <TextSection
            icon={Sparkles}
            title={t("dreamDetails.interpretation")}
            body={data.aiResponse || "-"}
            accent
          />

          {insights.length > 0 && (
            <section className="space-y-3">
              <SectionTitle icon={Lightbulb} title={t("dreamDetails.insights")} />
              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((insight, index) => (
                  <article
                    key={`${insight}-${index}`}
                    className="rounded-lg border border-black/10 bg-white/75 p-4 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
                  >
                    <div className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="leading-7">{insight}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-7">
          {keySymbols.length > 0 && <SymbolsSection symbols={keySymbols} />}
          {emotions.length > 0 && (
            <ChipSection
              icon={HeartPulse}
              title={t("dreamDetails.emotions")}
              items={emotions}
              tone="rose"
            />
          )}
          {categories.length > 0 && (
            <ChipSection
              icon={Tags}
              title={t("dreamDetails.categories")}
              items={categories.map((category) =>
                t(`categories.${category}`, { defaultValue: category })
              )}
              tone="slate"
            />
          )}
          {!hasRichAnalysis && (
            <div className="rounded-xl border border-black/10 bg-white/70 p-5 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65">
              {t("dreamDetails.richAnalysisFallback")}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function TextSection({
  icon: Icon,
  title,
  body,
  accent = false,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <section
      className={[
        "rounded-xl border p-5 shadow-[0_16px_38px_-32px_rgba(15,23,42,.7)]",
        accent
          ? "border-amber-200/70 bg-amber-50/70 dark:border-amber-300/20 dark:bg-amber-300/10"
          : "border-black/10 bg-white/75 dark:border-white/10 dark:bg-white/[0.04]",
      ].join(" ")}
    >
      <h2
        className={[
          "mb-3 flex items-center gap-2 text-lg font-bold",
          accent
            ? "text-amber-800 dark:text-amber-200"
            : "text-slate-900 dark:text-white",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
        {title}
      </h2>
      <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-white/85">
        {body}
      </p>
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
      <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
      {title}
    </h2>
  );
}

function SymbolsSection({ symbols }: { symbols: DreamSymbolInsight[] }) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3">
      <SectionTitle icon={Sparkles} title={t("dreamDetails.keySymbols")} />
      <div className="grid gap-3">
        {symbols.map((item, index) => (
          <article
            key={`${item.symbol}-${index}`}
            className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
          >
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {item.symbol}
            </h3>
            {item.meaning && (
              <p className="mt-2 leading-7 text-slate-700 dark:text-white/75">
                {item.meaning}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ChipSection({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone: "rose" | "slate";
}) {
  const chipClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-100"
      : "border-slate-200 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80";

  return (
    <section className="space-y-3">
      <SectionTitle icon={icon} title={title} />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={[
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold",
              chipClass,
            ].join(" ")}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
