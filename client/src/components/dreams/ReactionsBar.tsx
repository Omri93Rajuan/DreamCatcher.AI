import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";

type Props = {
  dreamId: string;
  disabled?: boolean; // למשל אם לא שותף/כלל שאסור להגיב עליו
  className?: string;
};

export default function ReactionsBar({ dreamId, disabled, className }: Props) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reactions", dreamId],
    queryFn: () => DreamsApi.getReactions(dreamId),
  });

  const likes = data?.likes ?? 0;
  const dislikes = data?.dislikes ?? 0;
  const viewsTotal = data?.viewsTotal ?? 0;
  const myReaction = data?.myReaction ?? null;

  const mutateReaction = useMutation({
    mutationFn: (type: "like" | "dislike") => DreamsApi.react(dreamId, type),
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: ["reactions", dreamId] });
      const prev = qc.getQueryData(["reactions", dreamId]) as any;

      // אופטימיות: עדכן מיידית
      const next = {
        ...(prev ?? { likes: 0, dislikes: 0, viewsTotal: 0, myReaction: null }),
      };
      if (type === "like") {
        if (next.myReaction === "like") {
          next.likes = Math.max(0, next.likes - 1);
          next.myReaction = null;
        } else {
          next.likes += 1;
          if (next.myReaction === "dislike")
            next.dislikes = Math.max(0, next.dislikes - 1);
          next.myReaction = "like";
        }
      } else {
        if (next.myReaction === "dislike") {
          next.dislikes = Math.max(0, next.dislikes - 1);
          next.myReaction = null;
        } else {
          next.dislikes += 1;
          if (next.myReaction === "like")
            next.likes = Math.max(0, next.likes - 1);
          next.myReaction = "dislike";
        }
      }

      qc.setQueryData(["reactions", dreamId], next);
      return { prev };
    },
    onError: (err: any, _type, ctx) => {
      // החזר מצב קודם
      if (ctx?.prev) qc.setQueryData(["reactions", dreamId], ctx.prev);

      // אם צריך התחברות — הודעה ידידותית
      if (err?.code === "AUTH_REQUIRED" || err?.message === "AUTH_REQUIRED") {
        // החלף ב-toast/modal שלך אם יש
        alert("רק משתמשים רשומים יכולים להגיב. היכנסו או הרשמו 🙂");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reactions", dreamId] });
    },
  });

  const onLike = () => {
    if (disabled || isLoading) return;
    mutateReaction.mutate("like");
  };
  const onDislike = () => {
    if (disabled || isLoading) return;
    mutateReaction.mutate("dislike");
  };

  return (
    <div className={`flex items-center gap-4 text-sm ${className || ""}`}>
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        className={`inline-flex items-center gap-1 transition ${
          myReaction === "like" ? "text-emerald-400" : "hover:text-emerald-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="לייק"
      >
        <ThumbsUp className="w-4 h-4" />
        {likes}
      </button>

      <button
        type="button"
        onClick={onDislike}
        disabled={disabled}
        className={`inline-flex items-center gap-1 transition ${
          myReaction === "dislike" ? "text-rose-400" : "hover:text-rose-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="דיסלייק"
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikes}
      </button>

      <span
        className="inline-flex items-center gap-1 text-white/70"
        title="צפיות"
      >
        <Eye className="w-4 h-4" />
        {viewsTotal}
      </span>
    </div>
  );
}
