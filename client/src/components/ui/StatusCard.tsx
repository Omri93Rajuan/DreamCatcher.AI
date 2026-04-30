import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StatusTone = "error" | "empty" | "loading" | "info";

type StatusCardProps = {
  tone?: StatusTone;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
  icon?: LucideIcon;
};

const toneStyles: Record<StatusTone, string> = {
  error:
    "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100",
  empty:
    "border-black/10 bg-white/70 text-slate-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80",
  loading:
    "border-black/10 bg-white/60 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70",
  info:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100",
};

const iconStyles: Record<StatusTone, string> = {
  error: "text-rose-500 dark:text-rose-300",
  empty: "text-slate-500 dark:text-white/60",
  loading: "text-amber-600 dark:text-amber-300",
  info: "text-amber-600 dark:text-amber-200",
};

function defaultIcon(tone: StatusTone) {
  if (tone === "error") return AlertTriangle;
  if (tone === "loading") return Loader2;
  return Inbox;
}

export default function StatusCard({
  tone = "info",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  className,
  icon,
}: StatusCardProps) {
  const Icon = icon ?? defaultIcon(tone);
  const isLoading = tone === "loading";
  const role = tone === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={clsx(
        "flex items-start gap-3 rounded-2xl border shadow-sm",
        compact ? "px-4 py-3" : "px-5 py-5",
        toneStyles[tone],
        className
      )}
    >
      <Icon
        className={clsx(
          "mt-0.5 h-5 w-5 shrink-0",
          isLoading && "animate-spin",
          iconStyles[tone]
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-6">{title}</div>
        {message && <div className="mt-1 text-sm opacity-80">{message}</div>}
        {actionLabel && onAction && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAction}
            className="mt-4 gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
