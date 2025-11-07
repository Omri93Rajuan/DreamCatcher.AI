import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Share2, Moon, X, Sparkles, Plus } from "lucide-react";
import type { Dream } from "@/lib/api/types";
import ReactionsBar from "@/components/dreams/ReactionsBar";
import { CATEGORY_META } from "@/lib/api/categoryIcons";
type CategoryKey = keyof typeof CATEGORY_META;
type Props = {
    dream: Dream & {
        categories?: CategoryKey[];
    };
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
function TagPill({ k }: {
    k: CategoryKey;
}) {
    const meta = CATEGORY_META[k];
    const Icon = meta.icon;
    return (<span className={[
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
            "bg-gradient-to-r",
            meta.gradient,
            "text-white",
            "ring-1 ring-black/10 dark:ring-white/10",
            "shadow-sm",
        ].join(" ")} title={meta.label}>
      <Icon className="w-3 h-3 opacity-90"/>
      {meta.label}
    </span>);
}
function TagsRow({ categories, maxVisible, align = "left", }: {
    categories: CategoryKey[];
    maxVisible: number;
    align?: "left" | "right";
}) {
    if (!categories?.length)
        return null;
    const visible = categories.slice(0, maxVisible);
    const rest = categories.length - visible.length;
    return (<div className={`flex flex-wrap items-center gap-1.5 ${align === "left" ? "justify-start" : "justify-end"}`} dir="rtl">
      {visible.map((c) => (<TagPill key={c} k={c}/>))}
      {rest > 0 && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium
            bg-black/5 text-slate-700 border border-black/10
            dark:bg-white/10 dark:text-white/90 dark:border-white/15" title={`ועוד ${rest} תגיות`}>
          <Plus className="w-3 h-3"/>
          {`+${rest}`}
        </span>)}
    </div>);
}
export default function DreamCard({ dream, showDate = false, currentUserId, onShare, compact = true, }: Props) {
    const [showModal, setShowModal] = useState(false);
    const isOwner = !!currentUserId && dream.userId === currentUserId;
    const title = safe(dream.title) || "חלום ללא כותרת";
    const dreamText = safe(dream.userInput);
    const interpretation = safe((dream as any).aiResponse ?? (dream as any).interpretation);
    const created = dream.createdAt ? new Date(dream.createdAt) : null;
    const categories = useMemo<CategoryKey[]>(() => {
        const raw = Array.isArray((dream as any)?.categories)
            ? (dream as any).categories
            : [];
        return raw.filter((candidate: unknown): candidate is CategoryKey => typeof candidate === "string" &&
            Object.prototype.hasOwnProperty.call(CATEGORY_META, candidate));
    }, [dream]);
    const dreamPreviewLength = compact ? 100 : 200;
    const interpretationPreviewLength = compact ? 120 : 180;
    const dreamNeedsMore = dreamText.length > dreamPreviewLength;
    const interpretationNeedsMore = interpretation.length > interpretationPreviewLength;
    const hasMore = dreamNeedsMore || interpretationNeedsMore;
    return (<>
      
      <Card className={[
            "relative rounded-xl overflow-hidden transition-all duration-300 group",
            "bg-white border-black/10 text-slate-900 hover:border-black/20",
            "dark:bg-gradient-to-br dark:from-purple-900/30 dark:via-purple-800/20 dark:to-purple-900/30",
            "dark:border-purple-500/20 dark:hover:border-purple-400/40 dark:text-white",
        ].join(" ")}>
        
        {categories.length > 0 && (<div className="absolute left-3 top-3 z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <TagsRow categories={categories} maxVisible={compact ? 3 : 6} align="left"/>
            </div>
          </div>)}

        <CardContent className="p-5">
          {categories.length > 0 && <div className="h-6"/>}

          
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Moon className="w-4 h-4 text-slate-500 dark:text-purple-300 flex-shrink-0"/>
              <h3 className="font-semibold text-lg truncate text-slate-900 dark:text-white">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showDate && created && (<div className="flex items-center gap-1 px-2 py-0.5 rounded-md
                                bg-black/5 border border-black/10
                                dark:bg-purple-500/10 dark:border-purple-400/20">
                  <Calendar className="w-3 h-3 text-slate-500 dark:text-purple-300"/>
                  <span className="text-xs text-slate-700 dark:text-purple-200">
                    {formatDate(created)}
                  </span>
                </div>)}

              {isOwner && onShare && (<button onClick={(e) => {
                e.stopPropagation();
                onShare(dream._id);
            }} className="p-1.5 rounded-md
                             bg-black/5 text-slate-700 border border-black/10 hover:bg-black/10
                             dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-400/20 dark:hover:bg-purple-500/20 dark:hover:text-purple-200
                             transition-colors" title="שתף חלום">
                  <Share2 className="w-3.5 h-3.5"/>
                </button>)}
            </div>
          </div>

          
          <div className="mb-4">
            <ReactionsBar dreamId={dream._id}/>
          </div>

          
          {dreamText && (<div className="mb-3">
              <div className="text-xs font-medium text-slate-500 dark:text-purple-300 mb-1 opacity-70">
                החלום
              </div>
              <p className="text-slate-800 dark:text-purple-100/90 text-sm leading-relaxed">
                {dreamText.slice(0, dreamPreviewLength)}
                {dreamNeedsMore && "..."}
              </p>
            </div>)}

          
          {interpretation && (<div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400"/>
                <div className="text-xs font-medium text-slate-600 dark:text-amber-300 opacity-70">
                  פרשנות AI
                </div>
              </div>
              <div className="p-3 rounded-lg
                              bg-black/5 border border-black/10
                              dark:bg-gradient-to-br dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-500/20">
                <p className="text-slate-800 dark:text-amber-100/90 text-sm leading-relaxed">
                  {interpretation.slice(0, interpretationPreviewLength)}
                  {interpretationNeedsMore && "..."}
                </p>
              </div>
            </div>)}

          
          {hasMore && (<button onClick={() => setShowModal(true)} className="w-full mt-2 py-2 px-3 rounded-lg text-sm transition-colors
                         border border-black/10 bg-black/5 text-slate-800 hover:bg-black/10
                         dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-400/20 dark:hover:bg-purple-500/20 dark:hover:text-purple-200">
              קרא עוד ←
            </button>)}
        </CardContent>
      </Card>

      
      {showModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden
                       bg-white border border-black/10
                       dark:bg-gradient-to-br dark:from-purple-900/95 dark:via-purple-800/90 dark:to-purple-900/95 dark:border-2 dark:border-purple-500/30" onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 p-6 flex items-start justify-between gap-4 border-b
                            bg-white/90 backdrop-blur-md border-black/10
                            dark:bg-purple-900/80 dark:border-purple-500/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Moon className="w-6 h-6 text-slate-600 dark:text-purple-300 flex-shrink-0"/>
                <h2 className="font-bold text-2xl text-slate-900 dark:text-white">
                  {title}
                </h2>
              </div>

              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-colors
                           bg-black/5 hover:bg-black/10
                           dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-300 dark:hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {showDate && created && (<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                    bg-black/5 border border-black/10
                                    dark:bg-purple-500/20 dark:border-purple-400/30">
                      <Calendar className="w-4 h-4 text-slate-600 dark:text-purple-300"/>
                      <span className="text-sm text-slate-700 dark:text-purple-200">
                        {formatDate(created)}
                      </span>
                    </div>)}
                  {categories.length > 0 && (<TagsRow categories={categories} maxVisible={99} align="left"/>)}
                </div>

                <div className="flex-1">
                  <ReactionsBar dreamId={dream._id}/>
                </div>

                {isOwner && onShare && (<button onClick={(e) => {
                    e.stopPropagation();
                    onShare(dream._id);
                }} className="px-4 py-2 rounded-lg flex items-center gap-2
                               border border-black/10 bg-black/5 text-slate-800 hover:bg-black/10
                               dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400/30 dark:hover:bg-purple-500/30 dark:hover:text-purple-200">
                    <Share2 className="w-4 h-4"/>
                    <span className="text-sm">שתף</span>
                  </button>)}
              </div>

              <div className="h-px bg-black/10 dark:bg-purple-500/20"/>

              {dreamText && (<div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-purple-200">
                    <div className="w-1 h-5 rounded-full bg-slate-400 dark:bg-gradient-to-b dark:from-purple-400 dark:to-pink-400"/>
                    החלום המלא
                  </h3>
                  <div className="text-slate-800 dark:text-purple-50 text-base leading-relaxed whitespace-pre-wrap">
                    {dreamText}
                  </div>
                </div>)}

              {interpretation && (<div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-amber-300">
                    <Sparkles className="w-5 h-5"/>
                    פרשנות AI מלאה
                  </h3>
                  <div className="p-5 rounded-xl
                                  border border-black/10 bg-black/5
                                  dark:bg-gradient-to-br dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-500/20">
                    <p className="text-slate-800 dark:text-amber-50/90 text-base leading-relaxed whitespace-pre-wrap">
                      {interpretation}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
        </div>)}
    </>);
}
