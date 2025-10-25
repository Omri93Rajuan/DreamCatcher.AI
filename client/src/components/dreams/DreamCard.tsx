import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { Dream } from "@/lib/api/types";

export default function DreamCard({
  dream,
  showDate = false,
}: {
  dream: Dream;
  showDate?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncate = (t: string, n = 120) =>
    t.length <= n ? t : `${t.slice(0, n)}...`;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card
        className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer h-full overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 text-white">{dream.title}</h3>
            <p className="text-purple-100 leading-relaxed">
              {isExpanded ? dream.userInput : truncate(dream.userInput)}
            </p>
          </div>

          <div className="mb-3">
            <h4 className="font-bold text-lg mb-2 text-amber-300">הפרשנות:</h4>
            <p className="text-purple-200 leading-relaxed">
              {isExpanded ? dream.aiResponse : truncate(dream.aiResponse, 180)}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-purple-400 pt-4 border-t border-purple-500/20">
            {showDate && dream.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(dream.createdAt), "d MMMM yyyy", {
                    locale: he,
                  })}
                </span>
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
