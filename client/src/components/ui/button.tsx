import * as React from "react";
import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary" // גרדיאנט סגול→ורוד→כתום (+glow) — כמו "הרשמה"
    | "share" // כתום→ורוד→פוקסיה — לשתף
    | "danger" // אדום גרדיאנטי — לאישור מחיקה/ביטול שיתוף
    | "outline" // זכוכית עדינה
    | "outlineDanger"; // קו אדום מעודן למחיקה לפני אישור
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-xl font-semibold transition-all select-none focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none gap-2";

    const sizes = {
      sm: "text-[13px] px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-5 py-2.5",
    }[size];

    const variants = {
      primary:
        "bg-gradient-to-r from-[#6D28D9] via-[#EA3A84] to-[#F59E0B] text-white " +
        "hover:brightness-110 shadow-[0_0_32px_rgba(234,58,132,0.35)]",
      share:
        "bg-gradient-to-r from-[#F59E0B] via-[#EA3A84] to-[#A855F7] text-black " +
        "hover:brightness-110 shadow-[0_0_28px_rgba(251,191,36,0.35)]",
      danger:
        "bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#7C3AED] text-white " +
        " shadow-[0_0_26px_rgba(239,68,68,0.35)] hover:bg-red-600 hover:text-white",
      outline:
        "bg-white/10 text-white border border-white/20 hover:bg-white/15",
      outlineDanger:
        "bg-transparent text-red-300 border border-red-400/40 hover:text-red-200 hover:border-red-400/60",
    }[variant];

    // מרווחים נכונים לאייקונים (RTL/LTR לא משנה — מיישר לפי flex-gap)
    const iconFix = "[&>svg]:w-4 [&>svg]:h-4";

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(base, sizes, variants, iconFix, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button;
