"use client";
import * as React from "react";
import { CATEGORY_META } from "@/lib/api/categoryIcons";
import { useTranslation } from "react-i18next";
type MetaEntry = {
    id: string;
    labelKey: string;
    icon: any;
    gradient: string;
};
export type CategoryTagVariant = "default" | "overlay";
type Props = {
    tag: string;
    variant?: CategoryTagVariant;
};
export default function CategoryTag({ tag, variant = "default" }: Props) {
    const { t } = useTranslation();
    const meta = React.useMemo<MetaEntry | undefined>(() => {
        const match = Object.entries(CATEGORY_META).find(([id, meta]) => {
            const label = t(meta.labelKey);
            return tag === label || tag === id || tag === meta.labelKey;
        });
        if (!match)
            return undefined;
        return { id: match[0], ...match[1] };
    }, [tag, t]);
    const Icon = meta?.icon as React.ComponentType<any> | undefined;
    const gradientClass = meta ? `bg-gradient-to-r ${meta.gradient}` : "";
    const label = meta ? t(meta.labelKey) : tag;
    const baseClasses = "inline-flex max-w-full items-center gap-1.5 rounded-full font-medium transition-colors whitespace-nowrap";
    const variantClasses = variant === "overlay"
        ? "px-2.5 py-0.5 text-[10px] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.45)] sm:text-[11px]"
        : "px-3.5 py-1.5 text-xs sm:text-sm shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)]";
    const withMetaClasses = meta
        ? `${gradientClass} text-white backdrop-blur-md border border-white/20`
        : "bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-white/80";
    return (<span className={`${baseClasses} ${variantClasses} ${withMetaClasses}`} title={label}>
      {Icon ? <Icon className={variant === "overlay" ? "h-3.5 w-3.5" : "h-4 w-4"}/> : null}
      <span className="leading-none">{label}</span>
    </span>);
}
