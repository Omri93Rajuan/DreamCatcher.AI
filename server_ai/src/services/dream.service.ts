// services/dream.service.ts
// ----------------------------------------------------
// שירות החלומות: שמירה, שליפה, עדכון, מחיקה, ויצירה דרך LLM
// ----------------------------------------------------

import fetch from "node-fetch";
import { Dream } from "../models/dream";
import { LLMOptions } from "../llm/llm.types";
import { getLLMProvider } from "../llm";

// טיפוסים פנימיים
type SortOrder = "asc" | "desc";

export interface GetDreamsQuery {
  viewerId?: string; // 👈 מי הצופה
  ownerId?: string; // 👈 סינון לפי בעלים (alias ל-userId אם תרצה)
  userId?: string; // 👈 סינון לפי יוצר
  search?: string;
  sortBy?: string;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export const saveDream = async (
  userId: string,
  title: string,
  userInput: string,
  aiResponse: string,
  isShared: boolean = false // 👈 ברירת מחדל: פרטי
) => {
  const dream = new Dream({
    userId,
    title,
    userInput,
    aiResponse,
    isShared,
    sharedAt: isShared ? new Date() : null,
  });
  return await dream.save();
};

export const updateDream = async (
  id: string,
  data: Partial<{
    title: string;
    userInput: string;
    aiResponse: string;
    isShared: boolean;
  }>
) => {
  const patch: any = { ...data };
  if (typeof data.isShared === "boolean") {
    patch.sharedAt = data.isShared ? new Date() : null;
  }
  return await Dream.findByIdAndUpdate(id, patch, { new: true });
};

/**
 * שליפה עם אכיפת פרטיות:
 * - אם אין viewerId ⇒ מחזירים רק isShared: true
 * - אם יש viewerId ⇒ מחזירים (isShared: true) או (userId === viewerId)
 * בנוסף תומך בחיפוש חופשי בכותרת/טקסט/מענה, מיון ודפדוף.
 */
export const getDreams = async (query: GetDreamsQuery) => {
  const {
    viewerId,
    userId,
    ownerId,
    search,
    sortBy,
    order = "desc",
    page = 1,
    limit = 10,
  } = query;

  // 🔒 פילטר נראות לפי זהות הצופה
  const visibilityFilter = viewerId
    ? { $or: [{ isShared: true }, { userId: viewerId }] }
    : { isShared: true };

  // 🎯 סינון לפי יוצר אם התבקש (ownerId הוא alias)
  const creatorId = userId || ownerId;
  const creatorFilter = creatorId ? { userId: creatorId } : {};

  // 🔎 חיפוש (לא רק בכותרת, גם בתוכן והתגובה של ה-AI)
  const searchFilter = search?.trim()
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { userInput: { $regex: search, $options: "i" } },
          { aiResponse: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const filter = { $and: [visibilityFilter, creatorFilter, searchFilter] };

  // ↕️ מיון (ברירת מחדל createdAt יורד)
  const sort: Record<string, 1 | -1> = sortBy
    ? { [sortBy]: order === "asc" ? 1 : -1 }
    : { createdAt: -1 };

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;

  const [dreams, total] = await Promise.all([
    Dream.find(filter)
      .sort(sort)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Dream.countDocuments(filter),
  ]);

  return {
    dreams,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
  };
};

export const getDreamById = async (id: string) => {
  return await Dream.findById(id);
};

export const deleteDream = async (id: string) => {
  return await Dream.findByIdAndDelete(id);
};

// ----------------------------------------------------
// עוזרים לניקוי/פרסור פלט מה-LLM
// ----------------------------------------------------

function stripFences(s: string): string {
  if (!s) return s;
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const trimmed = s.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("json")) return trimmed.slice(4).trim();
  return trimmed;
}

function tryParseJsonLike(s: string): any | null {
  if (!s) return null;
  let t = s.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (t.startsWith("{") && t.endsWith("}")) {
    try {
      return JSON.parse(t);
    } catch {}
  }
  return null;
}

async function callLLMForDream(
  userInput: string
): Promise<{ title?: string; interpretation: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const model =
    process.env.OPENROUTER_MODEL || "tngtech/deepseek-r1t2-chimera:free";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Return a strict JSON object with keys: title (string, up to 6 Hebrew words) and interpretation (string). No extra text.",
          },
          {
            role: "user",
            content: `חלמתי: "${userInput}". החזר JSON בלבד עם השדות: title, interpretation.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(
        `OpenRouter error: ${resp.status} ${resp.statusText} ${text}`
      );
    }

    const data: any = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    if (!raw) throw new Error("LLM response missing content");

    const cleaned = stripFences(raw);
    let parsed = tryParseJsonLike(cleaned);

    if (!parsed) {
      let title: string | undefined;
      let interpretation = cleaned;

      const titleMatch =
        cleaned.match(/"(?:title|כותרת)"\s*:\s*"([^"]+)"/i) ||
        cleaned.match(/(?:כותרת|Title)[:\-]?\s*(.*)/i);
      if (titleMatch?.[1]) title = titleMatch[1].trim();

      const interpMatch =
        cleaned.match(/"(?:interpretation|פירוש)"\s*:\s*"([^"]+)"/i) ||
        cleaned.match(/(?:interpretation|פירוש)[:\-]?\s*([\s\S]+)/i);
      if (interpMatch?.[1]) interpretation = interpMatch[1].trim();

      parsed = { title, interpretation };
    }

    const title = (parsed.title as string | undefined)?.trim();
    const interpretation = (
      parsed.interpretation as string | undefined
    )?.trim();
    if (!interpretation) throw new Error("Missing interpretation");

    return { title, interpretation };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * יצירה דרך LLM עם תמיכה ב־isShared:
 * - אפשר להעביר isShared ב־llmOptions (למשל מה־controller).
 */
export const createDreamWithAI = async (
  userId: string,
  userInput: string,
  titleOverride?: string,
  llmOptions?: LLMOptions & { isShared?: boolean } // 👈 הוספתי isShared אופציונלי
) => {
  if (!userId) throw new Error("userId is required");
  if (!userInput) throw new Error("userInput is required");

  const llm = getLLMProvider();
  const { title, interpretation } = await llm.interpretDream(
    userInput,
    llmOptions
  );

  const finalTitle =
    (titleOverride && titleOverride.trim()) ||
    (title && title.trim()) ||
    "חלום ללא כותרת";

  // 👇 שימור/קביעת isShared אם הועבר, אחרת נשאר false כברירת מחדל
  const isShared =
    typeof llmOptions?.isShared === "boolean" ? llmOptions!.isShared : false;

  return await saveDream(
    userId,
    finalTitle,
    userInput,
    interpretation,
    isShared
  );
};
