import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pages: number;
  onChange: (p: number) => void;
  disabled?: boolean;
};

function getPageWindow(page: number, pages: number, size = 5) {
  const half = Math.floor(size / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(pages, start + size - 1);
  if (end - start + 1 < size) start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, pages, onChange, disabled }: Props) {
  if (pages <= 1) return null;
  const windowPages = getPageWindow(page, pages);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        הקודם
      </Button>
      {windowPages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          onClick={() => onChange(p)}
          disabled={disabled}
          className={p === page ? "bg-purple-600 text-white" : ""}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= pages}
      >
        הבא
      </Button>
    </div>
  );
}
