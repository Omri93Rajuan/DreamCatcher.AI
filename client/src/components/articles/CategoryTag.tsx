"use client";
import * as React from "react";
import { CATEGORY_META } from "@/lib/api/categoryIcons";
type MetaEntry = {
    id: string;
    label: string;
    icon: any;
    gradient: string;
};
const LABEL_LOOKUP: Record<string, MetaEntry> = Object.entries(CATEGORY_META).reduce((acc, [id, meta]) => {
    acc[meta.label] = { id, ...meta };
    return acc;
}, {} as Record<string, MetaEntry>);
export type CategoryTagVariant = "default" | "overlay";
type Props = {
    tag: string;
    variant?: CategoryTagVariant;
};
export function resolveCategoryMeta(tag: string): MetaEntry | undefined {
    return LABEL_LOOKUP[tag];
}
export default function CategoryTag({ tag, variant = "default" }: Props) {
    const meta = resolveCategoryMeta(tag);
    const Icon = meta?.icon as React.ComponentType<any> | undefined;
    const gradientClass = meta ? `bg-gradient-to-r ${meta.gradient}` : "";
    const baseClasses = "inline-flex max-w-full items-center gap-1.5 rounded-full font-medium transition-colors whitespace-nowrap";
    const variantClasses = variant === "overlay"
        ? "px-2.5 py-0.5 text-[10px] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.45)] sm:text-[11px]"
        : "px-3.5 py-1.5 text-xs sm:text-sm shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)]";
    const withMetaClasses = meta
        ? `${gradientClass} text-white backdrop-blur-md border border-white/20`
        : "bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-white/80";
    return (<span className={`${baseClasses} ${variantClasses} ${withMetaClasses}`} title={tag}>
      {Icon ? <Icon className={variant === "overlay" ? "h-3.5 w-3.5" : "h-4 w-4"}/> : null}
      <span className="leading-none">{tag}</span>
    </span>);
}
