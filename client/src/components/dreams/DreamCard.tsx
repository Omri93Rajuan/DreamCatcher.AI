import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { Dream } from "@/lib/api/types";

type Props = {
  dream: Dream & {
    // אופציונלי מהשרת / with-metrics / popular-week
    metrics?: {
      viewsTotal?: number;
      likes?: number;
      dislikes?: number;
    };
  };
  showDate?: boolean;
};

const safe = (v: unknown) => (typeof v === "string" ? v : "");
const truncate = (txt: unknown, max = 140) => {
  const s = safe(txt);
  if (!s) return "";
  const arr = [...s]; // כדי לא לשבור אימוג'י/RTL
  return arr.length > max ? arr.slice(0, max).join("") + "…" : s;
};

export default function DreamCard({ dream, showDate = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // שדות בטוחים
  const title = safe(dream.title) || "חלום ללא כותרת";
  const dreamText = safe(dream.userInput);
  const interpretation = safe(
    (dream as any).aiResponse ?? (dream as any).interpretation
  );
  const created = dream.createdAt ? new Date(dream.createdAt) : null;

  const views = dream.metrics?.viewsTotal ?? (dream as any).search_count ?? 0;
  const likes = dream.metrics?.likes ?? 0;
  const dislikes = dream.metrics?.dislikes ?? 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card
        className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer h-full overflow-hidden"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <CardContent className="p-6">
          {/* Header: כותרת + מונים */}
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>

            {(views > 0 || likes > 0 || dislikes > 0) && (
              <div className="flex items-center gap-4 text-sm text-purple-300">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {views}
                </span>
                {likes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" /> {likes}
                  </span>
                )}
                {dislikes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4" /> {dislikes}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dream text */}
          {dreamText && (
            <div className="mb-4">
              <h4 className="font-bold text-base mb-1 text-white/90">החלום:</h4>
              <p className="text-purple-100 leading-relaxed">
                {isExpanded ? dreamText : truncate(dreamText, 180)}
              </p>
            </div>
          )}

          {/* Interpretation */}
          {interpretation && (
            <div className="mb-3">
              <h4 className="font-bold text-lg mb-2 text-amber-300">
                הפרשנות:
              </h4>
              <p className="text-purple-200 leading-relaxed">
                {isExpanded ? interpretation : truncate(interpretation, 220)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-purple-400 pt-4 border-t border-purple-500/20">
            {showDate && created && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(created, "d MMMM yyyy", { locale: he })}</span>
              </div>
            )}

            <span className="mr-auto text-purple-300">
              {isExpanded ? "לחץ להקטנה" : "לחץ להרחבה"}
            </span>

            <Badge
              className={
                dream.isShared
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-purple-500/20 text-purple-300 border-purple-500/30"
              }
            >
              {dream.isShared ? "שותף" : "פרטי"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
