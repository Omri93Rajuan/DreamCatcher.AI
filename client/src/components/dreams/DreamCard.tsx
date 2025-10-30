import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Share2, Eye, Moon, X, Sparkles } from "lucide-react";
import type { Dream } from "@/lib/api/types";
import ReactionsBar from "@/components/dreams/ReactionsBar";

type Props = {
  dream: Dream;
  showDate?: boolean;
  currentUserId?: string | null;
  onShare?: (dreamId: string) => void;
  compact?: boolean;
};

const safe = (v: unknown) => (typeof v === "string" ? v : "");

const formatDate = (date: Date): string => {
  const months = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function DreamCard({
  dream,
  showDate = false,
  currentUserId,
  onShare,
  compact = true,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const isOwner = !!currentUserId && dream.userId === currentUserId;
  const title = safe(dream.title) || "חלום ללא כותרת";
  const dreamText = safe(dream.userInput);
  const interpretation = safe(
    (dream as any).aiResponse ?? (dream as any).interpretation
  );
  const created = dream.createdAt ? new Date(dream.createdAt) : null;

  const dreamPreviewLength = compact ? 100 : 200;
  const interpretationPreviewLength = compact ? 120 : 180;

  const dreamNeedsMore = dreamText.length > dreamPreviewLength;
  const interpretationNeedsMore =
    interpretation.length > interpretationPreviewLength;
  const hasMore = dreamNeedsMore || interpretationNeedsMore;

  return (
    <>
      {/* Compact Card */}
      <Card className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 border border-purple-500/20 rounded-xl hover:border-purple-400/40 transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Moon className="w-4 h-4 text-purple-300 flex-shrink-0" />
              <h3 className="font-semibold text-lg text-white truncate">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showDate && created && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-400/20">
                  <Calendar className="w-3 h-3 text-purple-300" />
                  <span className="text-xs text-purple-200">
                    {formatDate(created)}
                  </span>
                </div>
              )}

              {isOwner && onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(dream._id);
                  }}
                  className="p-1.5 rounded-md bg-purple-500/10 border border-purple-400/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-colors"
                  title="שתף חלום"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reactions */}
          <div className="mb-4">
            <ReactionsBar dreamId={dream._id} />
          </div>

          {/* Dream Preview */}
          {dreamText && (
            <div className="mb-3">
              <div className="text-xs font-medium text-purple-300 mb-1 opacity-70">
                החלום
              </div>
              <p className="text-purple-100/90 text-sm leading-relaxed">
                {dreamText.slice(0, dreamPreviewLength)}
                {dreamNeedsMore && "..."}
              </p>
            </div>
          )}

          {/* Interpretation Preview */}
          {interpretation && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <div className="text-xs font-medium text-amber-300 opacity-70">
                  פרשנות AI
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/20">
                <p className="text-amber-100/90 text-sm leading-relaxed">
                  {interpretation.slice(0, interpretationPreviewLength)}
                  {interpretationNeedsMore && "..."}
                </p>
              </div>
            </div>
          )}

          {/* Read More Button */}
          {hasMore && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 hover:border-purple-400/40 text-purple-300 hover:text-purple-200 text-sm transition-all"
            >
              קרא עוד ←
            </button>
          )}
        </CardContent>
      </Card>

      {/* Full Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-purple-900/95 border-2 border-purple-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-purple-900/80 backdrop-blur-md border-b border-purple-500/20 p-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Moon className="w-6 h-6 text-purple-300 flex-shrink-0" />
                <h2 className="font-bold text-2xl text-white">{title}</h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6 space-y-6">
              {/* Date and Reactions */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {showDate && created && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30">
                    <Calendar className="w-4 h-4 text-purple-300" />
                    <span className="text-sm text-purple-200">
                      {formatDate(created)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <ReactionsBar dreamId={dream._id} />
                </div>

                {isOwner && onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(dream._id);
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">שתף</span>
                  </button>
                )}
              </div>

              <div className="h-px bg-purple-500/20" />

              {/* Dream Text */}
              {dreamText && (
                <div>
                  <h3 className="text-base font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                    החלום המלא
                  </h3>
                  <div className="text-purple-50 text-base leading-relaxed whitespace-pre-wrap">
                    {dreamText}
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {interpretation && (
                <div>
                  <h3 className="text-base font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    פרשנות AI מלאה
                  </h3>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/20">
                    <p className="text-amber-50/90 text-base leading-relaxed whitespace-pre-wrap">
                      {interpretation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
