import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";

export function useDreamReactions(dreamId: string) {
  const qc = useQueryClient();
  const key = ["dream-reactions", dreamId];

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => DreamsApi.getReactions(dreamId),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (type: "like" | "dislike") => DreamsApi.react(dreamId, type),
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key) as any;
      if (prev) {
        const next = { ...prev };
        if (prev.myReaction === type) {
          next.myReaction = null;
          if (type === "like") next.likes = Math.max(0, next.likes - 1);
          else next.dislikes = Math.max(0, next.dislikes - 1);
        } else if (prev.myReaction == null) {
          next.myReaction = type;
          if (type === "like") next.likes += 1;
          else next.dislikes += 1;
        } else {
          next.myReaction = type;
          if (type === "like") {
            next.likes += 1;
            next.dislikes = Math.max(0, next.dislikes - 1);
          } else {
            next.dislikes += 1;
            next.likes = Math.max(0, next.likes - 1);
          }
        }
        qc.setQueryData(key, next);
      }
      return { prev };
    },
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return {
    likes: data?.likes ?? 0,
    dislikes: data?.dislikes ?? 0,
    viewsTotal: data?.viewsTotal ?? 0,
    myReaction: data?.myReaction ?? null,
    isLoading,
    error,
    react: mutation.mutate,
    isPending: mutation.isPending,
  };
}
