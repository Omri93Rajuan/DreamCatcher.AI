import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
export default function ReactionsBar({ dreamId, disabled, className, }: {
    dreamId: string;
    disabled?: boolean;
    className?: string;
}) {
    const qc = useQueryClient();
    const { isAuthenticated } = useAuthStore();
    const [authOpen, setAuthOpen] = React.useState(false);
    const { data } = useQuery({
        queryKey: ["reactions", dreamId],
        queryFn: () => DreamsApi.getReactions(dreamId),
    });
    const likes = data?.likes ?? 0;
    const dislikes = data?.dislikes ?? 0;
    const viewsTotal = data?.viewsTotal ?? 0;
    const myReaction = data?.myReaction ?? null;
    const mutateReaction = useMutation<void, any, "like" | "dislike">({
        mutationFn: (type: "like" | "dislike") => DreamsApi.react(dreamId, type),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["reactions", dreamId] }),
        onError: (err) => {
            if (err?.response?.status === 401)
                setAuthOpen(true);
        },
    });
    const handleReact = (type: "like" | "dislike") => {
        if (disabled)
            return;
        if (!isAuthenticated) {
            setAuthOpen(true);
            return;
        }
        mutateReaction.mutate(type);
    };
    const baseBtn = "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40";
    const disabledCls = disabled ? "opacity-50 cursor-not-allowed" : "";
    return (<>
      <div className={`flex items-center gap-4 text-sm ${className || ""}`} dir="rtl">
        
        <button type="button" onClick={() => handleReact("like")} disabled={disabled} aria-pressed={myReaction === "like"} title="לייק" className={[
            baseBtn,
            disabledCls,
            myReaction === "like"
                ?
                    "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 " +
                        "dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-400/20 dark:hover:bg-emerald-900/50"
                :
                    "text-slate-700 hover:bg-black/5 " +
                        "dark:text-white/80 dark:hover:bg-white/10",
        ].join(" ")}>
          <ThumbsUp className="w-4 h-4"/>
          {likes}
        </button>

        
        <button type="button" onClick={() => handleReact("dislike")} disabled={disabled} aria-pressed={myReaction === "dislike"} title="דיסלייק" className={[
            baseBtn,
            disabledCls,
            myReaction === "dislike"
                ?
                    "text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 " +
                        "dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-400/20 dark:hover:bg-rose-900/50"
                :
                    "text-slate-700 hover:bg-black/5 " +
                        "dark:text-white/80 dark:hover:bg-white/10",
        ].join(" ")}>
          <ThumbsDown className="w-4 h-4"/>
          {dislikes}
        </button>

        
        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-white/70" title="צפיות" aria-label={`צפיות: ${viewsTotal}`}>
          <Eye className="w-4 h-4"/>
          {viewsTotal}
        </span>
      </div>

      <AuthGateDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={() => qc.invalidateQueries({ queryKey: ["reactions", dreamId] })}/>
    </>);
}
