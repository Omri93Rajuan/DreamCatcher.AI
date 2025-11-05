// src/components/dreams/DreamFlipCardMini.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, Share2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Dream } from "@/lib/api/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import ReactionsBar from "@/components/dreams/ReactionsBar"; // ⬅️ חדש

type Props = {
  dream: Dream;
  onToggleShare?: (next: boolean) => void;
  onDelete?: () => void;
  bodyHeight?: number;
  maxWordsFront?: number;
  maxWordsBack?: number;
  /** הצג/הסתר ReactionsBar */
  showReactions?: boolean; // ⬅️ חדש
  /** מצב קומפקטי ל־bar אם ממומש בתוך ReactionsBar עצמו (לא חובה) */
  reactionsVariant?: "default" | "compact"; // ⬅️ אופציונלי
};

const truncateWords = (text: string, maxWords: number) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
};

export default function DreamFlipCardMini({
  dream,
  onToggleShare,
  onDelete,
  bodyHeight = 220,
  maxWordsFront = 55,
  maxWordsBack = 70,
  showReactions = true, // ⬅️ חדש
  reactionsVariant = "default", // ⬅️ חדש
}: Props) {
  const [flipped, setFlipped] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [fullOpen, setFullOpen] = React.useState<null | "dream" | "solution">(
    null
  );

  const title = (dream?.title ?? "חלום ללא כותרת") as string;
  const dreamText = (dream as any)?.userInput ?? (dream as any)?.text ?? "";
  const solution =
    (dream as any)?.aiResponse ?? (dream as any)?.interpretation ?? "";
  const createdAt = dream?.createdAt ? new Date(dream.createdAt) : null;
  const isShared = !!(dream as any)?.isShared;
  const dreamId = dream?._id as string | undefined;

  const frontTrunc = truncateWords(dreamText, maxWordsFront);
  const backTrunc = truncateWords(solution, maxWordsBack);
  const frontOver =
    dreamText && dreamText.trim().split(/\s+/).length > maxWordsFront;
  const backOver =
    solution && solution.trim().split(/\s+/).length > maxWordsBack;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl overflow-visible"
    >
      {/* הילה בהובר */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-amber-400 blur-lg opacity-0 group-hover:opacity-25 transition-all duration-500 pointer-events-none" />

      {/* מעטפת הכרטיס */}
      <Card
        className="
          relative rounded-2xl overflow-hidden
          border bg-white/85 border-black/10 backdrop-blur-sm
          shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)]
          dark:bg-white/[0.10] dark:border-white/15 dark:backdrop-blur-md
          dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,.45)]
        "
      >
        {/* אזור הפליפ */}
        <div
          className="relative w-full [transform-style:preserve-3d] cursor-pointer"
          style={{
            height: bodyHeight,
            perspective: 1200,
            transition: "transform .6s cubic-bezier(.22,.61,.36,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          dir="rtl"
          onClick={() => setFlipped((f) => !f)}
          aria-label="הפוך כרטיס"
        >
          {/* FRONT — החלום */}
          <CardContent
            className="
              absolute inset-0 p-5
              [backface-visibility:hidden]
              bg-white/60 dark:bg-white/10
              selection:bg-amber-200 selection:text-slate-900
              dark:selection:bg-amber-300/30 dark:selection:text-white
            "
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">
                {title}
              </h3>
              <span
                className={[
                  "px-2 py-1 rounded-md text-[11px]",
                  isShared
                    ? "bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    : "bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white/70",
                ].join(" ")}
              >
                {isShared ? "משותף" : "פרטי"}
              </span>
            </div>

            {createdAt && (
              <div className="mt-1 text-sm flex items-center gap-2 text-slate-700 dark:text-white/85">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            <div className="mt-3 h-full">
              <h4 className="font-semibold mb-1 text-amber-800 dark:text-amber-300">
                החלום:
              </h4>
              <p className="leading-relaxed whitespace-pre-line line-clamp-6 text-slate-900 dark:text-white">
                {frontTrunc}
              </p>
            </div>

            {frontOver && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullOpen("dream");
                }}
                className="
                  absolute bottom-2 left-1/2 -translate-x-1/2
                  text-[11px] px-2 py-1 rounded-full
                  bg-black/10 hover:bg-black/15 text-slate-900 border border-black/15
                  dark:bg-white/15 dark:hover:bg-white/20 dark:text-white dark:border-white/20
                "
              >
                עוד…
              </button>
            )}

            <div className="absolute bottom-3 left-4 text-sm text-amber-700 dark:text-amber-300">
              הפוך להצגה
            </div>
          </CardContent>

          {/* BACK — הפתרון */}
          <CardContent
            className="
              absolute inset-0 p-5
              [backface-visibility:hidden] [transform:rotateY(180deg)]
              bg-white/60 dark:bg-white/10
              selection:bg-amber-200 selection:text-slate-900
              dark:selection:bg-amber-300/30 dark:selection:text-white
            "
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">
                {title}
              </h3>
              <span
                className={[
                  "px-2 py-1 rounded-md text-[11px]",
                  isShared
                    ? "bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    : "bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white/70",
                ].join(" ")}
              >
                {isShared ? "משותף" : "פרטי"}
              </span>
            </div>

            {createdAt && (
              <div className="mt-1 text-sm flex items-center gap-2 text-slate-700 dark:text-white/85">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            <div className="mt-3 h-full">
              <h4 className="font-semibold mb-1 text-rose-800 dark:text-rose-300">
                הפתרון:
              </h4>
              <p className="leading-relaxed whitespace-pre-line line-clamp-6 text-slate-900 dark:text-white/90">
                {backTrunc || "—"}
              </p>
            </div>

            {backOver && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullOpen("solution");
                }}
                className="
                  absolute bottom-2 left-1/2 -translate-x-1/2
                  text-[11px] px-2 py-1 rounded-full
                  bg-black/10 hover:bg-black/15 text-slate-900 border border-black/15
                  dark:bg-white/15 dark:hover:bg-white/20 dark:text-white dark:border-white/20
                "
              >
                עוד…
              </button>
            )}

            <div className="absolute bottom-3 left-4 text-sm text-amber-700 dark:text-amber-300">
              הפוך חזרה
            </div>
          </CardContent>
        </div>

        {/* Footer — כאן הוספנו את ReactionsBar */}
        <CardContent
          className="
            pt-4 pb-5 flex items-center justify-between gap-3
            border-t border-black/10 dark:border-white/15
          "
          dir="rtl"
        >
          {/* צד שמאל: Reactions */}
          {showReactions && dreamId && (
            <div className="min-w-0">
              {/* אם יש לך מצב קומפקטי בתוך ReactionsBar, אפשר להעביר prop כמו size='sm' */}
              <ReactionsBar
                dreamId={
                  dreamId
                } /* size={reactionsVariant === "compact" ? "sm" : "md"} */
              />
            </div>
          )}

          {/* צד ימין: פעולות */}
          <div className="flex items-center gap-2">
            {onToggleShare && (
              <Button
                onClick={() => onToggleShare(!isShared)}
                title={isShared ? "בטל שיתוף" : "שתף"}
                className="
                  inline-flex items-center gap-2
                  bg-black/10 hover:bg-black/15 text-slate-900
                  dark:bg-white/15 dark:hover:bg-white/20 dark:text-white
                "
                variant="ghost"
              >
                <Share2 className="w-4 h-4" />
                {isShared ? "בטל שיתוף" : "שתף"}
              </Button>
            )}

            {onDelete && (
              <>
                <Button
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  title="מחק חלום"
                  className="
                    bg-black/10 hover:bg-black/15 text-slate-900
                    dark:bg-white/15 dark:hover:bg-white/20 dark:text-white
                  "
                  variant="ghost"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {confirmOpen && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div
                      className="
                        w-full max-w-sm rounded-2xl p-6
                        bg-white/95 border border-rose-500/25 text-slate-900 shadow-xl
                        dark:bg-white/[0.10] dark:text-white dark:border-rose-500/30
                      "
                    >
                      <h2 className="text-xl font-bold mb-3 text-rose-700 dark:text-rose-300">
                        למחוק את החלום הזה?
                      </h2>
                      <p className="text-slate-600 dark:text-white/70 mb-6 text-sm">
                        אין דרך לשחזר לאחר המחיקה.
                      </p>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmOpen(false)}
                          className="
                            border-black/15 text-slate-800
                            dark:border-white/20 dark:text-white
                          "
                        >
                          ביטול
                        </Button>
                        <Button
                          onClick={() => {
                            setConfirmOpen(false);
                            setTimeout(() => onDelete?.(), 100);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          מחק
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* מודאל קריאה מלאה — הוספת ReactionsBar ליד הכותרת */}
      {fullOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setFullOpen(null)}
        >
          <div
            className="
              relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl p-6
              bg-white/90 border border-black/10 text-slate-900
              dark:bg-white/[0.10] dark:border-white/15 dark:text-white
              selection:bg-amber-200 selection:text-slate-900
              dark:selection:bg-amber-300/30 dark:selection:text-white
            "
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setFullOpen(null)}
              className="
                absolute left-3 top-3 p-1.5 rounded-md
                bg-black/10 hover:bg-black/15 text-slate-900
                dark:bg-white/15 dark:hover:bg-white/20 dark:text-white
              "
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-2xl font-extrabold">{title}</h3>
              {showReactions && dreamId && (
                <div className="pt-1">
                  <ReactionsBar
                    dreamId={
                      dreamId
                    } /* size={reactionsVariant === "compact" ? "sm" : "md"} */
                  />
                </div>
              )}
            </div>

            {createdAt && (
              <div className="text-sm mb-4 flex items-center gap-2 text-slate-700 dark:text-white/85">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            <div className="space-y-6">
              <section id="dreamFull">
                <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-300">
                  החלום:
                </h4>
                <p className="leading-relaxed whitespace-pre-line">
                  {dreamText || "—"}
                </p>
              </section>

              <section id="solutionFull">
                <h4 className="font-semibold mb-2 text-rose-800 dark:text-rose-300">
                  הפתרון:
                </h4>
                <p className="leading-relaxed whitespace-pre-line">
                  {solution || "—"}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
