// src/services/dream.service.ts
import { Dream } from "../models/dream";
import { LLMOptions } from "../llm/llm.types";
import { getLLMProvider } from "../llm";
import { DreamCategory } from "../types/categories.interface";

type SortOrder = "asc" | "desc";

/** פרמטרים לשליפת רשימת חלומות (עם פג'ינציה וסינון) */
export interface GetDreamsQuery {
  /** מזהה המשתמש שמחובר (מה־auth) */
  viewerId?: string;
  /** מזהה היוצר שאת חלומותיו רוצים לראות (אם ריק ⇒ פיד ציבורי) */
  ownerId?: string;
  userId?: string; // alias נוסף ל-creatorId
  /** חיפוש טקסטואלי */
  search?: string;
  /** מיון */
  sortBy?: string;
  order?: SortOrder;
  /** עמוד/כמות */
  page?: number;
  limit?: number;
  /** סינון לפי קטגוריות */
  categories?: DreamCategory[];
}

/** פרמטרים לאנדפוינט הסטטיסטיקות */
export interface GetDreamStatsQuery {
  /** מזהה הצופה המחובר (לצורך ויזיביליות) */
  viewerId?: string;
  /** מזהה היוצר (אם ריק ⇒ פיד ציבורי) */
  userId?: string;
  /** סינונים זהים ל-getDreams */
  categories?: DreamCategory[];
  search?: string;
  /** חלון ימים למדדים "שבועיים" (ברירת מחדל 7) */
  windowDays?: number;
}

/* ------------------------------------------------------------------ */
/* 🧩 פונקציית עזר לבניית פילטר ויזיביליות + סינון משותף            */
/* ------------------------------------------------------------------ */
/**
 * ויזיביליות:
 * - אם יש userId (יוצר ספציפי):
 *   - viewerId === userId ⇒ כל החלומות של עצמי.
 *   - אחרת ⇒ רק isShared: true של אותו יוצר.
 * - אם אין userId (פיד כללי):
 *   ⇒ רק isShared: true
 *
 * בתוספת:
 * - חיפוש טקסטואלי (title/userInput/aiResponse)
 * - סינון לפי קטגוריות (any match via $in)
 */
function buildFilter(input: {
  viewerId?: string;
  userId?: string; // creatorId
  categories?: DreamCategory[];
  search?: string;
}) {
  const { viewerId, userId, categories, search } = input;

  // בסיס הוויזיביליות
  let baseFilter: any;
  if (userId) {
    if (viewerId && String(userId) === String(viewerId)) {
      baseFilter = { userId };
    } else {
      baseFilter = { userId, isShared: true };
    }
  } else {
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

  // קטגוריות (אופציונלי)
  const cats = Array.isArray(categories) ? categories.filter(Boolean) : [];
  const categoriesFilter = cats.length ? { categories: { $in: cats } } : null;

  const andFilters = [baseFilter, searchFilter, categoriesFilter].filter(
    Boolean
  );
  return andFilters.length > 1
    ? { $and: andFilters }
    : andFilters[0] || baseFilter;
}

/* ------------------------------------------------------------------ */
/* 💾 CRUD + יצירה עם AI                                              */
/* ------------------------------------------------------------------ */

export const saveDream = async (
  userId: string,
  title: string,
  userInput: string,
  aiResponse: string,
  isShared: boolean = false,
  categories: DreamCategory[] = [],
  categoryScores?: Record<string, number>
) => {
  const dream = new Dream({
    userId,
    title,
    userInput,
    aiResponse,
    isShared,
    sharedAt: isShared ? new Date() : null,
    categories,
    categoryScores,
  });
  return dream.save();
};

export const createDreamFromInterpretation = async (
  userId: string,
  userInput: string,
  interpretation: string,
  titleOverride?: string,
  opts?: {
    isShared?: boolean;
    categories?: DreamCategory[];
    categoryScores?: Record<string, number>;
  }
) => {
  if (!userId) throw new Error("userId is required");
  if (!userInput) throw new Error("userInput is required");
  if (!interpretation) throw new Error("interpretation is required");

  const title = (titleOverride && titleOverride.trim()) || "חלום ללא כותרת";
  const isShared = typeof opts?.isShared === "boolean" ? opts.isShared : false;

  return saveDream(
    userId,
    title,
    userInput,
    interpretation,
    isShared,
    opts?.categories ?? [],
    opts?.categoryScores
  );
};

export const createDreamWithAI = async (
  userId: string,
  userInput: string,
  titleOverride?: string,
  llmOptions?: LLMOptions & { isShared?: boolean }
) => {
  if (!userId) throw new Error("userId is required");
  if (!userInput) throw new Error("userInput is required");

  const llm = getLLMProvider();
  const {
    title,
    interpretation,
    categories = [],
    categoryScores,
  } = await llm.interpretDream(userInput, llmOptions);

  const finalTitle =
    (titleOverride && titleOverride.trim()) ||
    (title && title.trim()) ||
    "חלום ללא כותרת";

  const isShared =
    typeof llmOptions?.isShared === "boolean" ? llmOptions.isShared : false;

  return saveDream(
    userId,
    finalTitle,
    userInput,
    interpretation,
    isShared,
    categories,
    categoryScores
  );
};

export const updateDream = async (
  id: string,
  data: Partial<{
    title: string;
    userInput: string;
    aiResponse: string;
    isShared: boolean;
    categories: DreamCategory[];
    categoryScores: Record<string, number>;
  }>
) => {
  const patch: any = { ...data };
  if (typeof data.isShared === "boolean") {
    patch.sharedAt = data.isShared ? new Date() : null;
  }
  return Dream.findByIdAndUpdate(id, patch, { new: true });
};

export const getDreamById = async (id: string) => Dream.findById(id);
export const deleteDream = async (id: string) => Dream.findByIdAndDelete(id);

/* ------------------------------------------------------------------ */
/* 📄 שליפה עם פג'ינציה                                              */
/* ------------------------------------------------------------------ */
/**
 * 🔎 שליפה עם ויזיביליות נכונה:
 * - אם יש creatorId (userId/ownerId):
 *   - viewerId === creatorId ⇒ כל החלומות של עצמי.
 *   - אחרת ⇒ רק isShared: true של היוצר המבוקש.
 * - אם אין creatorId (פיד כללי):
 *   ⇒ תמיד רק isShared: true (ציבורי).
 * + חיפוש/קטגוריות/מיון/פג'ינציה.
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
    categories,
  } = query;

  const creatorId = userId || ownerId;
  const filter = buildFilter({
    viewerId,
    userId: creatorId,
    categories,
    search,
  });

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
    limit: safeLimit,
  };
};

/* ------------------------------------------------------------------ */
/* 📊 סטטיסטיקות בלי תלות בפג'ינציה                                   */
/* ------------------------------------------------------------------ */
/**
 * מחזיר אגרגציות גלובליות בהתאם לוויזיביליות וסינונים:
 * - total: מספר החלומות הכולל בטווח/פילטר הנתון
 * - weeklyNew: כמה נוצרו ב-windowDays האחרונים
 * - weeklyPublished: כמה פורסמו ב-windowDays האחרונים
 *
 * "פורסמו" מעדיף sharedAt; אם אין—נופל ל-createdAt כל עוד isShared: true.
 */
export const getDreamStats = async (query: GetDreamStatsQuery) => {
  const windowDays = Math.max(1, query.windowDays ?? 7);
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $facet: {
        totalAll: [{ $count: "n" }],

        totalPublic: [{ $match: { isShared: true } }, { $count: "n" }],

        newSince: [{ $match: { createdAt: { $gte: since } } }, { $count: "n" }],

        publishedSince: [
          {
            $match: {
              $or: [
                { sharedAt: { $gte: since } },
                {
                  sharedAt: { $exists: false },
                  isShared: true,
                  createdAt: { $gte: since },
                },
              ],
            },
          },
          { $count: "n" },
        ],

        uniqueUsers: [{ $group: { _id: "$userId" } }, { $count: "n" }],
      },
    },
    // ממפה תוצאות ריקות ל-0 כדי לא לקבל undefined
    {
      $project: {
        totalAll: { $ifNull: [{ $arrayElemAt: ["$totalAll.n", 0] }, 0] },
        totalPublic: { $ifNull: [{ $arrayElemAt: ["$totalPublic.n", 0] }, 0] },
        newSince: { $ifNull: [{ $arrayElemAt: ["$newSince.n", 0] }, 0] },
        publishedSince: {
          $ifNull: [{ $arrayElemAt: ["$publishedSince.n", 0] }, 0],
        },
        uniqueUsers: { $ifNull: [{ $arrayElemAt: ["$uniqueUsers.n", 0] }, 0] },
      },
    },
  ];

  const [doc] = await Dream.aggregate(pipeline).allowDiskUse(true);
  return {
    totalAll: doc?.totalAll ?? 0,
    totalPublic: doc?.totalPublic ?? 0,
    newSince: doc?.newSince ?? 0,
    publishedSince: doc?.publishedSince ?? 0,
    uniqueUsers: doc?.uniqueUsers ?? 0,
    windowDays,
    sinceISO: since.toISOString(),
  };
};
