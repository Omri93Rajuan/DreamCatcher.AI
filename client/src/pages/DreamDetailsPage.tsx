import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Moon, Sparkles } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import ReactionsBar from "@/components/dreams/ReactionsBar";
import { useTranslation } from "react-i18next";

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

export default function DreamDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dream", id],
    queryFn: () => DreamsApi.getById(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (id) {
      DreamsApi.recordActivity?.(id, "view").catch(() => {});
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10" dir={i18n.dir()}>
        <div className="h-72 rounded-2xl border border-black/10 bg-white/70 animate-pulse dark:border-white/10 dark:bg-white/[0.06]" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10" dir={i18n.dir()}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          <AlertTriangle className="mb-3 h-6 w-6" />
          <div className="font-semibold">{t("common.notFound")}</div>
        </div>
      </main>
    );
  }

  const dateLabel = formatDate(data.createdAt, i18n.language);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10" dir={i18n.dir()}>
      <article className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,.7)] dark:border-white/10 dark:bg-white/[0.06]">
        <header className="mb-6 border-b border-black/10 pb-5 dark:border-white/10">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-white/65">
            {dateLabel && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </span>
            )}
            {data._id && <ReactionsBar dreamId={data._id} />}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-slate-950 dark:text-white">
            {data.title || t("dreams.untitled")}
          </h1>
        </header>

        <div className="grid gap-6">
          <section className="rounded-xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Moon className="h-5 w-5 text-slate-500 dark:text-white/65" />
              {t("dreamDetails.dream")}
            </h2>
            <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-white/82">
              {data.userInput || "-"}
            </p>
          </section>

          <section className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-5 dark:border-amber-300/20 dark:bg-amber-300/10">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-200">
              <Sparkles className="h-5 w-5" />
              {t("dreamDetails.interpretation")}
            </h2>
            <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-white/85">
              {data.aiResponse || "-"}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
