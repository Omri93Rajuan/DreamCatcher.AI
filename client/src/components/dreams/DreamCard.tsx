import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { Dream } from "@/lib/api/types";
import { useDreamReactions } from "@/hooks/useDreamReactions";

type Props = {
  dream: Dream;
  showDate?: boolean;
  currentUserId?: string | null;
  onShare?: (dreamId: string) => void;
};

const safe = (v: unknown) => (typeof v === "string" ? v : "");
const truncate = (txt: unknown, max = 140) => {
  const s = safe(txt);
  if (!s) return "";
  const arr = [...s];
  return arr.length > max ? arr.slice(0, max).join("") + "…" : s;
};

export default function DreamCard({
  dream,
  showDate = false,
  currentUserId,
  onShare,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwner = !!currentUserId && dream.userId === currentUserId;

  // נתוני Activity אמיתיים
  const { likes, dislikes, viewsTotal, myReaction, react, isPending } =
    useDreamReactions(dream._id);

  const title = safe(dream.title) || "חלום ללא כותרת";
  const dreamText = safe(dream.userInput);
  const interpretation = safe(
    (dream as any).aiResponse ?? (dream as any).interpretation
  );
  const created = dream.createdAt ? new Date(dream.createdAt) : null;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card
        className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all h-full overflow-hidden"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <CardContent className="p-6 flex flex-col h-full justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-white truncate max-w-[80%]">
                {title}
              </h3>

              {isOwner && onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(dream._id);
                  }}
                  className="text-amber-300 hover:text-amber-400 transition"
                  title="שתף חלום"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-5 text-sm">
              <span className="inline-flex items-center gap-1 text-purple-300">
                <Eye className="w-4 h-4" /> {viewsTotal}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  react("like");
                }}
                disabled={isPending}
                className={`inline-flex items-center gap-1 transition ${
                  myReaction === "like"
                    ? "text-emerald-300"
                    : "text-purple-300 hover:text-emerald-200"
                }`}
                title="אהבתי"
              >
                <ThumbsUp className="w-4 h-4" />
                {likes}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  react("dislike");
                }}
                disabled={isPending}
                className={`inline-flex items-center gap-1 transition ${
                  myReaction === "dislike"
                    ? "text-rose-300"
                    : "text-purple-300 hover:text-rose-200"
                }`}
                title="לא אהבתי"
              >
                <ThumbsDown className="w-4 h-4" />
                {dislikes}
              </button>
            </div>
          </div>

          {/* Dream text */}
          {dreamText && (
            <div className="mt-4">
              <h4 className="font-bold text-base mb-1 text-white/90">החלום:</h4>
              <p className="text-purple-100 leading-relaxed">
                {isExpanded ? dreamText : truncate(dreamText, 180)}
              </p>
            </div>
          )}

          {/* Interpretation */}
          {interpretation && (
            <div className="mt-4">
              <h4 className="font-bold text-lg mb-2 text-amber-300">
                הפרשנות:
              </h4>
              <p className="text-purple-200 leading-relaxed">
                {isExpanded ? interpretation : truncate(interpretation, 220)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-purple-400 pt-4 mt-4 border-t border-purple-500/20">
            {showDate && created && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(created, "d MMMM yyyy", { locale: he })}</span>
              </div>
            )}
            <span className="ml-auto text-purple-300">
              {isExpanded ? "לחץ להקטנה" : "לחץ להרחבה"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
