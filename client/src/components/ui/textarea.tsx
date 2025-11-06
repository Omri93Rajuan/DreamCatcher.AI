import * as React from "react";
import { clsx } from "clsx";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    return (<textarea ref={ref} className={clsx("w-full rounded-xl px-3.5 py-3 leading-relaxed", "outline-none transition-colors duration-200", "disabled:opacity-50 disabled:cursor-not-allowed", "bg-white text-black placeholder:text-slate-500 border border-black/15", "focus-visible:ring-2 focus-visible:ring-black/20", "dark:bg-white/10 dark:text-white dark:placeholder:text-white/50 dark:border-white/15", "dark:focus-visible:ring-2 dark:focus-visible:ring-purple-400/30", className)} {...props}/>);
});
Textarea.displayName = "Textarea";
export default Textarea;
