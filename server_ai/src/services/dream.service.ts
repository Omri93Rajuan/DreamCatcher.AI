// src/services/dream.service.ts
import { Dream } from "../models/dream";
import { LLMOptions } from "../llm/llm.types";
import { getLLMProvider } from "../llm";

type SortOrder = "asc" | "desc";

export interface GetDreamsQuery {
  /** מזהה המשתמש שמחובר (מה־auth) */
  viewerId?: string;
  /** מזהה היוצר שאת חלומותיו רוצים לראות (אם ריק → פיד כללי) */
  ownerId?: string;
  userId?: string;
  /** חיפוש טקסטואלי */
  search?: string;
  /** מיון */
  sortBy?: string;
  order?: SortOrder;
  /** עמוד/כמות */
  page?: number;
  limit?: number;
}

export const saveDream = async (
  userId: string,
  title: string,
  userInput: string,
  aiResponse: string,
  isShared: boolean = false
) => {
  const dream = new Dream({
    userId,
    title,
    userInput,
    aiResponse,
    isShared,
    sharedAt: isShared ? new Date() : null,
  });
  return dream.save();
};

/** 🔹 שמירה ישירה כשכבר יש פירוש */
export const createDreamFromInterpretation = async (
  userId: string,
  userInput: string,
  interpretation: string,
  titleOverride?: string,
  opts?: { isShared?: boolean }
) => {
  if (!userId) throw new Error("userId is required");
  if (!userInput) throw new Error("userInput is required");
  if (!interpretation) throw new Error("interpretation is required");

  const title = (titleOverride && titleOverride.trim()) || "חלום ללא כותרת";
  const isShared = typeof opts?.isShared === "boolean" ? opts.isShared : false;

  return saveDream(userId, title, userInput, interpretation, isShared);
};

/** 🔹 שמירה עם LLM */
export const createDreamWithAI = async (
  userId: string,
  userInput: string,
  titleOverride?: string,
  llmOptions?: LLMOptions & { isShared?: boolean }
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

  const isShared =
    typeof llmOptions?.isShared === "boolean" ? llmOptions.isShared : false;

  return saveDream(userId, finalTitle, userInput, interpretation, isShared);
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
  return Dream.findByIdAndUpdate(id, patch, { new: true });
};

/**
 * 🔎 שליפה עם ויזיביליות נכונה:
 * - אם יש creatorId (userId/ownerId):
 *   - viewerId === creatorId ⇒ כל החלומות של עצמי.
 *   - אחרת ⇒ רק isShared: true של היוצר המבוקש.
 * - אם אין creatorId (פיד כללי):
 *   ⇒ תמיד רק isShared: true (ציבורי), גם אם מחובר.
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

  const creatorId = userId || ownerId;

  // בסיס הוויזיביליות
  let baseFilter: any;
  if (creatorId) {
    if (viewerId && String(creatorId) === String(viewerId)) {
      // “החלומות שלי” → הכל
      baseFilter = { userId: creatorId };
    } else {
      // משתמש אחר → רק משותפים שלו
      baseFilter = { userId: creatorId, isShared: true };
    }
  } else {
    // פיד כללי → תמיד רק ציבורי, בלי קשר להתחברות
    baseFilter = { isShared: true };
  }

  // חיפוש טקסטואלי (אופציונלי)
  const trimmed = (search ?? "").trim();
  const searchFilter =
    trimmed.length > 0
      ? {
          $or: [
            { title: { $regex: trimmed, $options: "i" } },
            { userInput: { $regex: trimmed, $options: "i" } },
            { aiResponse: { $regex: trimmed, $options: "i" } },
          ],
        }
      : null;

  const filter = searchFilter
    ? { $and: [baseFilter, searchFilter] }
    : baseFilter;

  // מיון/פג'ינציה
  const sort: Record<string, 1 | -1> = sortBy
    ? { [sortBy]: order === "asc" ? 1 : -1 }
    : { createdAt: -1 };

  const safePage = Number.isFinite(page) && page && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit && limit > 0 ? limit : 10;

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
    pages: Math.ceil(total / safeLimit) || 1,
  };
};

export const getDreamById = async (id: string) => Dream.findById(id);
export const deleteDream = async (id: string) => Dream.findByIdAndDelete(id);
