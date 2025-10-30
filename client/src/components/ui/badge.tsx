import React from "react";
import { clsx } from "clsx";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
        className
      )}
      {...props}
    />
  );
}
