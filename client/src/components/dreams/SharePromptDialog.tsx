import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { Dream } from "@/lib/api/types";
import { DreamsApi } from "@/lib/api/dreams";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream: Dream | null;
  onShared?: (updated: Dream) => void; // 👈 טיפוס מפורש
};

export default function SharePromptDialog({
  open,
  onOpenChange,
  dream,
  onShared,
}: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!open || !mounted || !dream) return null;

  const keepPrivate = () => onOpenChange(false);

  const shareNow = async () => {
    if (!dream) return;
    setBusy(true);
    try {
      const updated: Dream = await DreamsApi.update(dream._id, {
        isShared: true,
      });
      onShared?.(updated); // 👈 updated הוא מסוג Dream
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative min-h-full w-full flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          role="document"
          className="glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/25 bg-white/15 shadow-2xl text-white"
        >
          <div className="px-6 pt-5 pb-3 border-b border-white/15">
            <h3 className="text-base font-extrabold gradient-text">
              החלום נשמר! לשתף אותו לאחרים?
            </h3>
          </div>

          <div className="p-6 space-y-3">
            <p className="text-sm text-white/80">
              כבר שמרנו את החלום שלך כפרטי. אפשר לשתף כדי שיראו בפיד ויתנו
              תגובות.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white"
                onClick={keepPrivate}
                disabled={busy}
              >
                השאר פרטי
              </Button>
              <Button
                onClick={shareNow}
                disabled={busy}
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white"
              >
                שתף עכשיו
              </Button>
            </div>
          </div>

          <div className="px-6 pb-5 text-center text-[11px] text-white/70">
            תמיד אפשר לשנות את מצב השיתוף אחר־כך מהכרטיס של החלום.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
