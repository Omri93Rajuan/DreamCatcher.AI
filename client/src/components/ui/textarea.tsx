import * as React from "react";
import { clsx } from "clsx";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      "w-full rounded-md bg-white/10 text-white placeholder:text-purple-300 border border-purple-500/30 px-3 py-2 min-h-32 resize-y focus:outline-none focus:border-purple-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
