import { DREAM_CATEGORIES } from "../types/categories.interface";
import {
  DreamSymbolInsight,
  LLMOptions,
  LLMProvider,
  LLMResult,
} from "./llm.types";
import { sleep, stripFences, tryParseJsonLike } from "./llm.utils";
export type OpenRouterProviderConfig = {
  apiKey: string;
  models?: string[];
  maxAttemptsPerModel?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
};
type DreamCategory = (typeof DREAM_CATEGORIES)[number];
const apiUrl =
  process.env.OPENROUTER_API_URL ||
  "https://openrouter.ai/api/v1/chat/completions";
if (!apiUrl) {
  throw new Error(
    "Missing OPENROUTER_API_URL in environment variables (e.g., https://openrouter.ai/api/v1/chat/completions)"
  );
}
export class OpenRouterProvider implements LLMProvider {
  private readonly apiKey: string;
  private readonly models: string[];
  private readonly maxAttemptsPerModel: number;
  private readonly baseDelayMs: number;
  private readonly timeoutMs: number;
  constructor(cfg: OpenRouterProviderConfig) {
    if (!cfg.apiKey) throw new Error("Missing OPENROUTER_API_KEY");
    this.apiKey = cfg.apiKey;
    const envList = process.env.OPENROUTER_MODELS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const single = process.env.OPENROUTER_MODEL?.trim();
    this.models = cfg.models?.length
      ? cfg.models
      : envList?.length
      ? envList
      : single
      ? [single]
      : [];
    this.maxAttemptsPerModel = cfg.maxAttemptsPerModel ?? 4;
    this.baseDelayMs = cfg.baseDelayMs ?? 1200;
    this.timeoutMs = cfg.timeoutMs ?? 45000;
  }
  async interpretDream(
    userInput: string,
    options?: LLMOptions
  ): Promise<LLMResult> {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), this.timeoutMs);
    const models = options?.modelOverride
      ? [options.modelOverride, ...this.models]
      : this.models;
    if (!models.length) {
      throw new Error(
        "No models configured. Set OPENROUTER_MODEL or OPENROUTER_MODELS, or pass modelOverride."
      );
    }
    try {
      for (const model of models) {
        for (let attempt = 1; attempt <= this.maxAttemptsPerModel; attempt++) {
          try {
            return await this.callOnce(model, userInput, controller.signal);
          } catch (e: any) {
            const status = e?.status;
            const retryable = status === 429 || (status >= 500 && status < 600);
            const retryAfterSec = Number.isFinite(e?.retryAfterSec)
              ? e.retryAfterSec
              : undefined;
            if (status === 404) {
              console.warn(
                `[LLM] model=${model} not found (404). Skipping to next.`
              );
              break;
            }
            if (!retryable || attempt === this.maxAttemptsPerModel) {
              if (!retryable) throw e;
              console.warn(`[LLM] model=${model} retry attempts exhausted.`);
              break;
            }
            const backoff = retryAfterSec
              ? Math.max(1000, retryAfterSec * 1000)
              : Math.round(
                  this.baseDelayMs * Math.pow(2, attempt - 1) +
                    Math.random() * 300
                );
            console.warn(
              `[LLM] model=${model} attempt=${attempt} status=${status} → retry in ${backoff}ms`
            );
            await sleep(backoff);
          }
        }
      }
      throw new Error(
        "All models are currently rate-limited or unavailable. Please try again later."
      );
    } finally {
      clearTimeout(to);
    }
  }
  private async callOnce(
    model: string,
    userInput: string,
    signal: AbortSignal
  ): Promise<LLMResult> {
    const categoryList = JSON.stringify(DREAM_CATEGORIES);
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(process.env.APP_URL ? { "HTTP-Referer": process.env.APP_URL } : {}),
        ...(process.env.APP_NAME ? { "X-Title": process.env.APP_NAME } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: [
              "You are DreamCatcher.AI, a careful Hebrew dream interpretation assistant.",
              "Return STRICT JSON with keys:",
              ' - "title": string (Hebrew, up to 6 words)',
              ' - "interpretation": string (Hebrew, 2-4 short paragraphs, warm and practical)',
              ' - "insights": array of 3 concise Hebrew strings with practical reflections',
              ' - "keySymbols": array of 2-5 objects: {"symbol": string, "meaning": string}',
              ' - "emotions": array of 2-6 short Hebrew emotion labels',
              ` - "categories": array of strings; each must be one of ${categoryList}`,
              ' - "categoryScores": object mapping category->confidence float in [0,1] (optional)',
              "Avoid diagnosis, certainty, fortune-telling, or medical/legal advice.",
              "Do not include any extra text or markdown. JSON only.",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              `חלמתי: "${userInput}".`,
              "החזר JSON בלבד עם השדות: title, interpretation, insights, keySymbols, emotions, categories ו-categoryScores.",
              "הקפד שכל התוכן למשתמש יהיה בעברית טבעית, אישי אך לא נחרץ, ובגובה העיניים.",
            ].join("\n"),
          },
        ],
      }),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      const retryAfter = resp.headers.get("retry-after");
      const err = new Error(
        `OpenRouter error: ${resp.status} ${resp.statusText} ${text}`
      ) as any;
      err.retryAfterSec = retryAfter ? Number(retryAfter) : undefined;
      err.status = resp.status;
      throw err;
    }
    const data: any = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    if (!raw) throw new Error("LLM response missing content");
    const cleaned = stripFences(raw);
    let parsed = tryParseJsonLike(cleaned);
    if (!parsed) {
      const titleMatch =
        cleaned.match(/"(?:title|כותרת)"\s*:\s*"([^"]+)"/i) ||
        cleaned.match(/(?:כותרת|Title)[:\-]?\s*(.*)/i);
      const interpMatch =
        cleaned.match(/"(?:interpretation|פירוש)"\s*:\s*"([^"]+)"/i) ||
        cleaned.match(/(?:interpretation|פירוש)[:\-]?\s*([\s\S]+)/i);
      let cats: string[] = [];
      const catJsonMatch = cleaned.match(
        /"(?:categories|קטגוריות)"\s*:\s*\[([\s\S]*?)\]/i
      );
      if (catJsonMatch?.[1]) {
        cats = catJsonMatch[1]
          .split(/[,]+/g)
          .map((s) => s.replace(/["'\s]/g, "").trim())
          .filter(Boolean);
      } else {
        const catLineMatch = cleaned.match(
          /(?:categories|קטגוריות)[:\-]\s*([^\n]+)/i
        );
        if (catLineMatch?.[1]) {
          cats = catLineMatch[1]
            .split(/[,\u05BE;|]+/g)
            .map((s) => s.replace(/["'\s]/g, "").trim())
            .filter(Boolean);
        }
      }
      parsed = {
        title: titleMatch?.[1]?.trim(),
        interpretation: (interpMatch?.[1] ?? cleaned).trim(),
        categories: cats,
      };
    }
    const title = (parsed.title as string | undefined)?.trim();
    const interpretation = (
      parsed.interpretation as string | undefined
    )?.trim();
    const insights = normalizeStringArray(parsed.insights, 4, 220);
    const keySymbols = normalizeKeySymbols(
      parsed.keySymbols ?? parsed.symbols ?? parsed.centralSymbols
    );
    const emotions = normalizeStringArray(parsed.emotions, 6, 60);
    const allowed = new Set<string>(DREAM_CATEGORIES);
    const rawCats = Array.isArray(parsed.categories) ? parsed.categories : [];
    const categories: DreamCategory[] = uniqueStrings(
      rawCats.map((c) => String(c || "").trim()).filter((c) => allowed.has(c))
    ).slice(0, 4) as DreamCategory[];
    const rawScores =
      parsed.categoryScores && typeof parsed.categoryScores === "object"
        ? (parsed.categoryScores as Record<string, unknown>)
        : undefined;
    const categoryScores = rawScores
      ? Object.fromEntries(
          Object.entries(rawScores)
            .filter(([k]) => allowed.has(k))
            .map(([k, v]) => [k, clamp01(Number(v))])
        )
      : undefined;
    if (!interpretation) throw new Error("Missing interpretation");
    return {
      title,
      interpretation,
      insights,
      keySymbols,
      emotions,
      categories,
      categoryScores,
    } as LLMResult;
  }
}
function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function uniqueStrings(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
function normalizeStringArray(
  input: unknown,
  maxItems: number,
  maxLength: number
) {
  const arr = Array.isArray(input) ? input : [];
  return uniqueStrings(
    arr
      .map((item) =>
        String(item ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, maxLength)
      )
      .filter(Boolean)
  ).slice(0, maxItems);
}
function normalizeKeySymbols(input: unknown): DreamSymbolInsight[] {
  const arr = Array.isArray(input) ? input : [];
  const out: DreamSymbolInsight[] = [];
  for (const item of arr) {
    if (typeof item === "string") {
      const symbol = item.replace(/\s+/g, " ").trim().slice(0, 80);
      if (symbol && !out.some((existing) => existing.symbol === symbol)) {
        out.push({ symbol, meaning: "" });
      }
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const symbol = String(raw.symbol ?? raw.name ?? raw.title ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    const meaning = String(raw.meaning ?? raw.description ?? raw.insight ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
    if (symbol && !out.some((existing) => existing.symbol === symbol)) {
      out.push({ symbol, meaning });
    }
    if (out.length >= 5) break;
  }
  return out.slice(0, 5);
}
