import * as React from "react";
import { clsx } from "clsx";
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "outline" | "ghost";
};
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, size = "md", variant = "primary", disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all " +
        "focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 " +
        "select-none shrink-0 active:scale-[0.98]";
    const sizes: Record<"sm" | "md" | "lg", string> = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-14 px-7 text-lg",
    };
    const variants: Record<"primary" | "outline" | "ghost", string> = {
        primary: "bg-[var(--brand)] text-[var(--brand-fg)] " +
            "hover:brightness-105 dark:hover:brightness-110",
        outline: "border border-[var(--brand)]/40 text-[var(--brand)] " +
            "hover:bg-[var(--brand)]/10 dark:hover:bg-[var(--brand)]/20 " +
            "dark:text-[var(--brand)]",
        ghost: "text-[var(--brand)] hover:bg-[var(--brand)]/10 " +
            "dark:hover:bg-[var(--brand)]/20",
    };
    const disabledStyles = "opacity-40 cursor-not-allowed pointer-events-none";
    return (<button ref={ref} disabled={disabled} className={clsx(base, sizes[size], variants[variant], disabled && disabledStyles, className)} {...props}/>);
});
Button.displayName = "Button";
