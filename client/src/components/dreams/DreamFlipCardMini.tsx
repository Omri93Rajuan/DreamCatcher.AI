import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe2,
  Lock,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import ReactionsBar from "@/components/dreams/ReactionsBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Dream } from "@/lib/api/types";

type Props = {
  dream: Dream;
  onToggleShare?: (next: boolean) => void;
  onDelete?: () => void;
  bodyHeight?: number;
  maxWordsFront?: number;
  maxWordsBack?: number;
  showReactions?: boolean;
  reactionsVariant?: "default" | "compact";
};

const truncateWords = (text: string, maxWords: number) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
};

export default function DreamFlipCardMini({
  dream,
  onToggleShare,
  onDelete,
  bodyHeight = 250,
  maxWordsFront = 42,
  maxWordsBack = 48,
  showReactions = true,
}: Props) {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = React.useState<"dream" | "ai">("dream");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [fullOpen, setFullOpen] = React.useState<null | "dream" | "solution">(
    null
  );

  const title = (dream?.title ?? t("dreams.untitled")) as string;
  const dreamText = (dream as any)?.userInput ?? (dream as any)?.text ?? "";
  const solution =
    (dream as any)?.aiResponse ?? (dream as any)?.interpretation ?? "";
  const createdAt = dream?.createdAt ? new Date(dream.createdAt) : null;
  const isShared = !!(dream as any)?.isShared;
  const dreamId = dream?._id as string | undefined;
  const openDetailsLabel = t("myDreams.openDetails", {
    defaultValue: i18n.language?.startsWith("he")
      ? "פתח ניתוח מלא"
      : "Open full analysis",
  });

  const isDreamView = activeView === "dream";
  const content = isDreamView ? dreamText : solution;
  const contentType = isDreamView ? "dream" : "solution";
  const maxWords = isDreamView ? maxWordsFront : maxWordsBack;
  const truncated = truncateWords(content, maxWords);
  const isOverLimit = content.trim().split(/\s+/).filter(Boolean).length > maxWords;
  const locale = i18n.language?.startsWith("he") ? he : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="h-full min-w-0"
      dir={i18n.dir()}
    >
      <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white/88 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-white/[0.06]">
        <CardContent className="flex min-w-0 flex-1 flex-col p-0">
          <header className="border-b border-black/10 px-3 py-4 dark:border-white/10 sm:px-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold leading-7 text-slate-950 dark:text-white">
                  {title}
                </h3>
                {createdAt && (
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 dark:text-white/55">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {format(createdAt, "d MMMM yyyy", { locale })}
                    </span>
                  </div>
                )}
              </div>

              <span
                className={[
                  "inline-flex max-w-[48%] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  isShared
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                    : "border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-white/60",
                ].join(" ")}
              >
                {isShared ? (
                  <Globe2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">
                  {isShared ? t("myDreams.shared") : t("myDreams.private")}
                </span>
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-2 rounded-lg border border-black/10 bg-slate-100/80 p-1 text-sm dark:border-white/10 dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveView("dream")}
                className={[
                  "inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md px-2 font-semibold transition",
                  isDreamView
                    ? "bg-white text-slate-950 shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-white/55 dark:hover:text-white",
                ].join(" ")}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("dreams.card.dream")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("ai")}
                className={[
                  "inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md px-2 font-semibold transition",
                  !isDreamView
                    ? "bg-white text-slate-950 shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-white/55 dark:hover:text-white",
                ].join(" ")}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("dreams.card.ai")}</span>
              </button>
            </div>
          </header>

          <section
            className="flex min-w-0 flex-1 flex-col px-3 py-4 sm:px-4"
            style={{ minHeight: bodyHeight }}
          >
            <p className="line-clamp-7 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-white/72">
              {truncated || "-"}
            </p>

            {isOverLimit && (
              <button
                type="button"
                onClick={() => setFullOpen(contentType)}
                className="mt-3 self-start text-sm font-semibold text-amber-700 underline-offset-4 hover:underline dark:text-amber-300"
              >
                {t("myDreams.more")}
              </button>
            )}
          </section>

          <footer className="mt-auto flex min-w-0 flex-col gap-3 border-t border-black/10 px-3 py-3 dark:border-white/10 sm:px-4">
            {showReactions && dreamId && (
              <ReactionsBar
                dreamId={dreamId}
                className="min-w-0 flex-wrap justify-end gap-x-4 gap-y-1 text-slate-500 dark:text-white/60"
              />
            )}

            <div className="grid min-w-0 gap-2">
              {dreamId && (
                <Link
                  to={`/dreams/${dreamId}`}
                  className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100"
                  title={openDetailsLabel}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{openDetailsLabel}</span>
                </Link>
              )}

              {(onToggleShare || onDelete) && (
                <div
                  className={
                    onToggleShare
                      ? "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"
                      : "flex justify-end"
                  }
                >
                  {onToggleShare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleShare(!isShared)}
                      title={
                        isShared
                          ? t("myDreams.shareDisable")
                          : t("myDreams.shareEnable")
                      }
                      className="w-full min-w-0 gap-2 border-amber-500/35 bg-white/70 text-amber-800 dark:border-amber-300/25 dark:bg-white/[0.04] dark:text-amber-100"
                    >
                      <Share2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {isShared
                          ? t("myDreams.shareDisable")
                          : t("myDreams.shareEnable")}
                      </span>
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmOpen(true)}
                      title={t("myDreams.delete")}
                      aria-label={t("myDreams.delete")}
                      className="h-9 w-9 shrink-0 px-0 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </footer>
        </CardContent>
      </Card>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-6 text-slate-900 shadow-xl dark:border-rose-500/25 dark:bg-slate-950 dark:text-white">
            <h2 className="mb-3 text-xl font-bold text-rose-700 dark:text-rose-300">
              {t("myDreams.deleteTitle")}
            </h2>
            <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-white/70">
              {t("myDreams.deleteWarning")}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpen(false);
                  setTimeout(() => onDelete?.(), 100);
                }}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                {t("myDreams.deleteConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {fullOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setFullOpen(null)}
        >
          <div
            className="relative max-h-[82vh] w-full max-w-2xl overflow-auto rounded-xl border border-black/10 bg-white p-6 text-slate-900 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-white"
            onClick={(e) => e.stopPropagation()}
            dir={i18n.dir()}
          >
            <button
              type="button"
              onClick={() => setFullOpen(null)}
              className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-black/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 pe-10">
              <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
              {createdAt && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  {format(createdAt, "d MMMM yyyy", { locale })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                  <FileText className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  {t("dreams.card.dream")}
                </h4>
                <p className="whitespace-pre-line text-sm leading-8 text-slate-700 dark:text-white/75">
                  {dreamText || "-"}
                </p>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  {t("dreams.card.ai")}
                </h4>
                <p className="whitespace-pre-line text-sm leading-8 text-slate-700 dark:text-white/75">
                  {solution || "-"}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
}
