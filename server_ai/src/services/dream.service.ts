import { getLLMProvider } from "../llm";
import { LLMOptions } from "../llm/llm.types";
import { Dream } from "../models/dream";
import { DreamCategory } from "../types/categories.interface";

type SortOrder = "asc" | "desc";

export interface GetDreamsQuery {
  viewerId?: string;
  ownerId?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  order?: SortOrder;
  page?: number;
  limit?: number;
  categories?: DreamCategory[];
}

export interface GetDreamStatsQuery {
  viewerId?: string;
  userId?: string;
  categories?: DreamCategory[];
  search?: string;
  windowDays?: number;
}

const DEFAULT_TITLE = "Untitled dream";

function buildFilter(input: {
  viewerId?: string;
  userId?: string;
  categories?: DreamCategory[];
  search?: string;
}) {
  const { viewerId, userId, categories, search } = input;
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

  const cats = Array.isArray(categories) ? categories.filter(Boolean) : [];
  const categoriesFilter = cats.length ? { categories: { $in: cats } } : null;
  const andFilters = [baseFilter, searchFilter, categoriesFilter].filter(
    Boolean
  );

  return andFilters.length > 1
    ? { $and: andFilters }
    : andFilters[0] || baseFilter;
}

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

  const title = (titleOverride && titleOverride.trim()) || DEFAULT_TITLE;
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
  llmOptions?: LLMOptions & {
    isShared?: boolean;
  }
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
    DEFAULT_TITLE;
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
