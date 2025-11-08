import * as React from "react";
import { clsx } from "clsx";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (<input ref={ref} className={clsx("w-full rounded-lg border px-3 py-2 text-sm transition outline-none", "bg-white border-black/15 text-slate-900 placeholder:text-slate-400", "dark:bg-white/[0.06] dark:border-white/15 dark:text-white dark:placeholder:text-white/40", "focus:ring-2 ring-amber-400/50 dark:focus:ring-amber-400/40", className)} {...props}/>));
Input.displayName = "Input";
