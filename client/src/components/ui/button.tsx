import * as React from "react";
import { clsx } from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" &&
          "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 focus:ring-purple-400",
        variant === "outline" &&
          "border border-purple-500/30 text-purple-200 hover:bg-purple-500/10 px-4 py-2",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
