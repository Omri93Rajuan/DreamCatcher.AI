import type { DreamSymbolInsight } from "../types/dreamAnalysis.interface";

type StringListOptions = {
  maxItems?: number;
  maxLength?: number;
};

type SymbolOptions = {
  maxItems?: number;
  symbolMaxLength?: number;
  meaningMaxLength?: number;
};

export const DREAM_ANALYSIS_LIMITS = {
  insights: { maxItems: 4, maxLength: 220 },
  emotions: { maxItems: 8, maxLength: 60 },
  llmEmotions: { maxItems: 6, maxLength: 60 },
  symbols: { maxItems: 5, symbolMaxLength: 80, meaningMaxLength: 240 },
} as const;

export function normalizeStringList(
  input: unknown,
  options: StringListOptions = {}
): string[] {
  if (!input) return [];

  const maxItems = options.maxItems ?? 6;
  const maxLength = options.maxLength ?? 180;
  const arr = Array.isArray(input) ? input : [input];
  const out: string[] = [];

  for (const item of arr) {
    const value = String(item ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
    if (value && !out.includes(value)) out.push(value);
    if (out.length >= maxItems) break;
  }

  return out;
}

export function normalizeKeySymbols(
  input: unknown,
  options: SymbolOptions = {}
): DreamSymbolInsight[] {
  if (!input) return [];

  const maxItems = options.maxItems ?? DREAM_ANALYSIS_LIMITS.symbols.maxItems;
  const symbolMaxLength =
    options.symbolMaxLength ?? DREAM_ANALYSIS_LIMITS.symbols.symbolMaxLength;
  const meaningMaxLength =
    options.meaningMaxLength ?? DREAM_ANALYSIS_LIMITS.symbols.meaningMaxLength;
  const arr = Array.isArray(input) ? input : [input];
  const out: DreamSymbolInsight[] = [];

  for (const item of arr) {
    if (typeof item === "string") {
      const symbol = normalizeText(item, symbolMaxLength);
      if (symbol && !hasSymbol(out, symbol)) {
        out.push({ symbol, meaning: "" });
      }
    } else if (item && typeof item === "object") {
      const raw = item as Record<string, unknown>;
      const symbol = normalizeText(
        raw.symbol ?? raw.name ?? raw.title ?? "",
        symbolMaxLength
      );
      const meaning = normalizeText(
        raw.meaning ?? raw.description ?? raw.insight ?? "",
        meaningMaxLength
      );
      if (symbol && !hasSymbol(out, symbol)) {
        out.push({ symbol, meaning });
      }
    }
    if (out.length >= maxItems) break;
  }

  return out;
}

function normalizeText(input: unknown, maxLength: number) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function hasSymbol(items: DreamSymbolInsight[], symbol: string) {
  return items.some((item) => item.symbol === symbol);
}

