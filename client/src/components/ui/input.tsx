import * as React from "react";
import { clsx } from "clsx";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      "w-full rounded-md bg-white/10 text-white placeholder:text-purple-300 border border-purple-500/30 px-3 py-2 focus:outline-none focus:border-purple-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
