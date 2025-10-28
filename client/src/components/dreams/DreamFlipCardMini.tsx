// src/components/dreams/DreamFlipCardMini.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, Share2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Dream } from "@/lib/api/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";

type Props = {
  dream: Dream;
  onToggleShare?: (next: boolean) => void;
  onDelete?: () => void;
  bodyHeight?: number; // גובה אזור הפליפ (ברירת מחדל 220)
  maxWordsFront?: number; // מקס’ מילים לצד הקדמי (החלום)
  maxWordsBack?: number; // מקס’ מילים לצד האחורי (הפתרון)
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
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-amber-400 blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none" />

      <Card className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#2A0953]/80 via-[#23084A]/70 to-[#1A073C]/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(88,28,135,0.35)]">
        {/* אזור הפליפ — גובה קבוע לאחידות */}
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
        >
          {/* FRONT — החלום */}
          <CardContent className="absolute inset-0 p-5 text-white [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">{title}</h3>
              <span
                className={`px-2 py-1 rounded-md text-[11px] ${
                  isShared
                    ? "bg-emerald-600/30 text-emerald-100"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {isShared ? "משותף" : "פרטי"}
              </span>
            </div>

            {createdAt && (
              <div className="mt-1 text-sm text-purple-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            <div className="mt-3 h-full">
              <h4 className="text-amber-300 font-semibold mb-1">החלום:</h4>
              <p className="text-purple-100 leading-relaxed whitespace-pre-line line-clamp-6">
                {frontTrunc}
              </p>
            </div>

            {/* כפתור "עוד…" צף, לא משנה גובה */}
            {frontOver && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullOpen("dream");
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 text-purple-200 border border-white/20"
              >
                עוד…
              </button>
            )}
          </CardContent>

          {/* BACK — הפתרון */}
          <CardContent className="absolute inset-0 p-5 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">{title}</h3>
              <span
                className={`px-2 py-1 rounded-md text-[11px] ${
                  isShared
                    ? "bg-emerald-600/30 text-emerald-100"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {isShared ? "משותף" : "פרטי"}
              </span>
            </div>

            {createdAt && (
              <div className="mt-1 text-sm text-purple-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            <div className="mt-3 h-full">
              <h4 className="text-rose-300 font-semibold mb-1">הפתרון:</h4>
              <p className="text-purple-200 leading-relaxed whitespace-pre-line line-clamp-6">
                {backTrunc || "—"}
              </p>
            </div>

            {backOver && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullOpen("solution");
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 text-purple-200 border border-white/20"
              >
                עוד…
              </button>
            )}
          </CardContent>
        </div>

        {/* Footer קבוע */}
        <CardContent className="pt-4 pb-5 border-top border-t border-white/10 flex items-center justify-end gap-2">
          {onToggleShare && (
            <Button
              variant={isShared ? "danger" : "share"}
              onClick={() => onToggleShare(!isShared)}
              title={isShared ? "בטל שיתוף" : "שתף"}
            >
              <Share2 />
              {isShared ? "בטל שיתוף" : "שתף"}
            </Button>
          )}

          {onDelete && (
            <>
              <Button
                variant="outlineDanger"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                title="מחק חלום"
              >
                <Trash2 />
              </Button>

              {/* מודאל אישור מחיקה */}
              {confirmOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                  <div className="bg-[#1D062F] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm text-white shadow-xl">
                    <h2 className="text-xl font-bold mb-3 text-red-300">
                      למחוק את החלום הזה?
                    </h2>
                    <p className="text-white/60 mb-6 text-sm">
                      אין דרך לשחזר לאחר המחיקה.
                    </p>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmOpen(false)}
                      >
                        ביטול
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setConfirmOpen(false);
                          setTimeout(() => onDelete?.(), 100);
                        }}
                      >
                        מחק
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* מודאל קריאה מלאה — לא שובר גובה כרטיס */}
      {fullOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setFullOpen(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl bg-gradient-to-b from-[#2A0953]/85 to-[#1A073C]/85 border border-purple-500/30 p-6 text-white"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setFullOpen(null)}
              className="absolute left-3 top-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20"
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-extrabold mb-2">{title}</h3>
            {createdAt && (
              <div className="text-sm text-purple-300 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(createdAt, "d MMMM yyyy", { locale: he })}
              </div>
            )}

            {/* מציגים תמיד את שני הקטעים, מתחילים לגלול לעוגן רלוונטי אם תרצה */}
            <div className="space-y-6">
              <section id="dreamFull">
                <h4 className="text-amber-300 font-semibold mb-2">החלום:</h4>
                <p className="text-purple-100 leading-relaxed whitespace-pre-line">
                  {dreamText || "—"}
                </p>
              </section>

              <section id="solutionFull">
                <h4 className="text-rose-300 font-semibold mb-2">הפתרון:</h4>
                <p className="text-purple-200 leading-relaxed whitespace-pre-line">
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
