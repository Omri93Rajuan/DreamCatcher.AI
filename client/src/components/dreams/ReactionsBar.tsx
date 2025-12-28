import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

function useAnimatedNumber(value: number | null, duration = 450) {
  const [display, setDisplay] = React.useState<number>(() => value ?? 0);
  const prevRef = React.useRef<number>(value ?? 0);

  React.useEffect(() => {
    if (value === null || Number.isNaN(value)) return;
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

export default function ReactionsBar({
  dreamId,
  disabled,
  className,
}: {
  dreamId: string;
  disabled?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const nf = React.useMemo(
    () => new Intl.NumberFormat(i18n.language === "he" ? "he-IL" : "en-US"),
    [i18n.language]
  );
  const { isAuthenticated } = useAuthStore();
  const [authOpen, setAuthOpen] = React.useState(false);
  const isProcessingRef = React.useRef(false);

  const { data, isLoading, isFetching, error } = useQuery<ReactionData>({
    queryKey: ["reactions", dreamId],
    queryFn: () => DreamsApi.getReactions(dreamId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    initialData: () => qc.getQueryData<ReactionData>(["reactions", dreamId]),
  });

  const hasData = !!data && !error;
  const showPlaceholder = !hasData && (isLoading || isFetching);
  const likes = hasData ? data?.likes ?? 0 : null;
  const dislikes = hasData ? data?.dislikes ?? 0 : null;
  const viewsTotal = hasData ? data?.viewsTotal ?? 0 : null;
  const likesAnimated = useAnimatedNumber(likes);
  const dislikesAnimated = useAnimatedNumber(dislikes);
  const viewsAnimated = useAnimatedNumber(viewsTotal);
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

  const renderValue = (value: number) =>
    showPlaceholder ? <span className="opacity-50">...</span> : nf.format(value);

  return (
    <>
      <div
        className={`flex items-center gap-4 text-sm ${className || ""}`}
        dir={i18n.dir()}
      >
        <button
          type="button"
          onClick={() => handleReact("like")}
          disabled={disabled}
          aria-pressed={myReaction === "like"}
          aria-busy={showPlaceholder}
          title={t("reactions.like")}
        >
          <ThumbsUp className="w-4 h-4 inline-block" />{" "}
          {renderValue(likesAnimated)}
        </button>

        <button
          type="button"
          onClick={() => handleReact("dislike")}
          disabled={disabled}
          aria-pressed={myReaction === "dislike"}
          aria-busy={showPlaceholder}
          title={t("reactions.dislike")}
        >
          <ThumbsDown className="w-4 h-4 inline-block" />{" "}
          {renderValue(dislikesAnimated)}
        </button>

        <span
          title={t("reactions.views")}
          aria-label={`${t("reactions.views")}: ${
            viewsTotal === null ? t("common.loading") : viewsTotal
          }`}
          aria-busy={showPlaceholder}
        >
          <Eye className="w-4 h-4 inline-block" />{" "}
          {renderValue(viewsAnimated)}
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

