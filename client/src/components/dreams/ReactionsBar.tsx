// components/dreams/ReactionsBar.tsx
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import AuthGateDialog from "@/components/auth/AuthGateDialog";

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
      if (err?.response?.status === 401) setAuthOpen(true);
    },
  });

  const handleReact = (type: "like" | "dislike") => {
    if (disabled) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    mutateReaction.mutate(type);
  };

  return (
    <>
      <div className={`flex items-center gap-4 text-sm ${className || ""}`}>
        <button
          type="button"
          onClick={() => handleReact("like")}
          disabled={disabled}
          className={`inline-flex items-center gap-1 transition ${
            myReaction === "like"
              ? "text-emerald-400"
              : "hover:text-emerald-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title="לייק"
        >
          <ThumbsUp className="w-4 h-4" />
          {likes}
        </button>

        <button
          type="button"
          onClick={() => handleReact("dislike")}
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
