import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import DreamCard from "@/components/dreams/DreamCard";

type Props = {
  dreamId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DreamPreviewDialog({
  dreamId,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading } = useQuery<Dream>({
    queryKey: ["dream", dreamId],
    queryFn: () => DreamsApi.getById(dreamId as string),
    enabled: open && !!dreamId,
  });

  // רשום צפייה כאשר הדיאלוג נפתח
  React.useEffect(() => {
    if (open && dreamId) DreamsApi.recordActivity(dreamId, "view");
  }, [open, dreamId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{data?.title ?? "תצוגת חלום"}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="h-48 grid place-items-center text-white/60">
            טוען...
          </div>
        ) : (
          // ממחזר את כרטיס החלום שלך – מקבלים חוויה מלאה
          <DreamCard dream={data} showDate />
        )}
      </DialogContent>
    </Dialog>
  );
}
