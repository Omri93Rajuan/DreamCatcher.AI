import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import AuthGateDialog from "@/components/auth/AuthGateDialog";

type ReactionType = "like" | "dislike";

type ReactionData = {
  likes: number;
  dislikes: number;
  viewsTotal: number;
  myReaction: ReactionType | null;
};

export default function ReactionsBar({
  dreamId,
  disabled,
  className,
}: {
  dreamId: string;
  disabled?: boolean;
  className?: string;
}) {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [authOpen, setAuthOpen] = React.useState(false);
  const isProcessingRef = React.useRef(false);

  const { data } = useQuery<ReactionData>({
    queryKey: ["reactions", dreamId],
    queryFn: () => DreamsApi.getReactions(dreamId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const likes = data?.likes ?? 0;
  const dislikes = data?.dislikes ?? 0;
  const viewsTotal = data?.viewsTotal ?? 0;
  const myReaction = data?.myReaction ?? null;

  const mutateReaction = useMutation({
    mutationFn: (type: ReactionType) => DreamsApi.react(dreamId, type),
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: ["reactions", dreamId] });
      const previous = qc.getQueryData<ReactionData>(["reactions", dreamId]);
      if (!previous) return { previous };

      const { likes, dislikes, viewsTotal, myReaction } = previous;
      let nextLikes = likes;
      let nextDislikes = dislikes;
      let nextMy: ReactionType | null = myReaction;

      if (type === "like") {
        if (myReaction === "like") {
          nextLikes -= 1;
          nextMy = null;
        } else {
          nextLikes += 1;
          if (myReaction === "dislike") nextDislikes -= 1;
          nextMy = "like";
        }
      } else if (type === "dislike") {
        if (myReaction === "dislike") {
          nextDislikes -= 1;
          nextMy = null;
        } else {
          nextDislikes += 1;
          if (myReaction === "like") nextLikes -= 1;
          nextMy = "dislike";
        }
      }

      qc.setQueryData(["reactions", dreamId], {
        likes: Math.max(0, nextLikes),
        dislikes: Math.max(0, nextDislikes),
        viewsTotal,
        myReaction: nextMy,
      });

      return { previous };
    },
    onError: (err: any, _type, ctx) => {
      if (err?.response?.status === 401) setAuthOpen(true);
      if (ctx?.previous) qc.setQueryData(["reactions", dreamId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reactions", dreamId] });
      isProcessingRef.current = false;
    },
  });

  const handleReact = (type: ReactionType) => {
    if (disabled) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    mutateReaction.mutate(type);
  };

  return (
    <>
      <div
        className={`flex items-center gap-4 text-sm ${className || ""}`}
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => handleReact("like")}
          disabled={disabled}
          aria-pressed={myReaction === "like"}
          title="לייק"
        >
          <ThumbsUp className="w-4 h-4 inline-block" /> {likes}
        </button>

        <button
          type="button"
          onClick={() => handleReact("dislike")}
          disabled={disabled}
          aria-pressed={myReaction === "dislike"}
          title="דיסלייק"
        >
          <ThumbsDown className="w-4 h-4 inline-block" /> {dislikes}
        </button>

        <span title="צפיות" aria-label={`צפיות: ${viewsTotal}`}>
          <Eye className="w-4 h-4 inline-block" /> {viewsTotal}
        </span>
      </div>

      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() =>
          qc.invalidateQueries({ queryKey: ["reactions", dreamId] })
        }
      />
    </>
  );
}
