import { Types } from "mongoose";
import { getLLMProvider } from "../llm";
import { LLMOptions } from "../llm/llm.types";
import { Dream } from "../models/dream";
import { DREAM_CATEGORIES, DreamCategory } from "../types/categories.interface";

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

export type JournalTrend = "up" | "down" | "steady";

export interface JournalCategoryInsight {
  category: DreamCategory;
  count: number;
  recentCount: number;
  previousCount: number;
  share: number;
  trend: JournalTrend;
  trendDelta: number;
}

export interface JournalActivityPoint {
  startISO: string;
  endISO: string;
  count: number;
}

export interface SmartJournalInsights {
  windowDays: number;
  sinceISO: string;
  previousSinceISO: string;
  totalDreams: number;
  recentDreams: number;
  previousDreams: number;
  activeDays: number;
  latestDreamAt?: string | null;
  latestStreakDays: number;
  longestGapDays: number;
  topCategories: JournalCategoryInsight[];
  recurringCategories: JournalCategoryInsight[];
  risingCategories: JournalCategoryInsight[];
  weeklyActivity: JournalActivityPoint[];
  suggestedFocusCategory?: DreamCategory | null;
  dataQuality: "empty" | "light" | "ready";
}

const DEFAULT_TITLE = "Untitled dream";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const DREAM_CATEGORY_SET = new Set<string>(DREAM_CATEGORIES);

function clampWindowDays(windowDays?: number) {
  const parsed = Number(windowDays);
  if (!Number.isFinite(parsed)) return 30;
  return Math.max(7, Math.min(365, Math.floor(parsed)));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function wholeDaysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

function getTrend(recentCount: number, previousCount: number): JournalTrend {
  const diff = recentCount - previousCount;
  if (diff >= 2) return "up";
  if (diff <= -2) return "down";
  return "steady";
}

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

export const getSmartJournalInsights = async (query: {
  userId: string;
  windowDays?: number;
}): Promise<SmartJournalInsights> => {
  if (!query.userId || !Types.ObjectId.isValid(query.userId)) {
    throw new Error("valid userId is required");
  }

  const windowDays = clampWindowDays(query.windowDays);
  const now = new Date();
  const since = new Date(now.getTime() - windowDays * DAY_MS);
  const previousSince = new Date(now.getTime() - windowDays * 2 * DAY_MS);
  const userObjectId = new Types.ObjectId(query.userId);

  const dreams = await Dream.find({ userId: userObjectId })
    .select("categories createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const totalDreams = dreams.length;
  let recentDreams = 0;
  let previousDreams = 0;
  const allActiveDaySet = new Set<string>();
  const recentActiveDaySet = new Set<string>();
  const categoryMap = new Map<
    DreamCategory,
    { count: number; recentCount: number; previousCount: number }
  >();

  const bucketCount = Math.min(8, Math.max(4, Math.ceil(windowDays / 7)));
  const activityStart = new Date(now.getTime() - bucketCount * WEEK_MS);
  const weeklyBuckets = Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(activityStart.getTime() + index * WEEK_MS);
    const end = new Date(start.getTime() + WEEK_MS);
    return { start, end, count: 0 };
  });

  for (const dream of dreams as any[]) {
    const createdAt = dream?.createdAt ? new Date(dream.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

    const isRecent = createdAt >= since;
    const isPrevious = createdAt >= previousSince && createdAt < since;
    const day = dateKey(createdAt);
    allActiveDaySet.add(day);
    if (isRecent) recentActiveDaySet.add(day);

    if (isRecent) recentDreams += 1;
    if (isPrevious) previousDreams += 1;

    if (createdAt >= activityStart) {
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.max(
          0,
          Math.floor((createdAt.getTime() - activityStart.getTime()) / WEEK_MS)
        )
      );
      weeklyBuckets[bucketIndex].count += 1;
    }

    const categories = Array.isArray(dream?.categories)
      ? Array.from(new Set(dream.categories)).filter(Boolean)
      : [];

    for (const rawCategory of categories) {
      if (!DREAM_CATEGORY_SET.has(String(rawCategory))) continue;
      const category = rawCategory as DreamCategory;
      const current =
        categoryMap.get(category) ??
        { count: 0, recentCount: 0, previousCount: 0 };
      current.count += 1;
      if (isRecent) current.recentCount += 1;
      if (isPrevious) current.previousCount += 1;
      categoryMap.set(category, current);
    }
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, values]) => {
      const trendDelta = values.recentCount - values.previousCount;
      return {
        category,
        count: values.count,
        recentCount: values.recentCount,
        previousCount: values.previousCount,
        share:
          totalDreams > 0
            ? Number((values.count / totalDreams).toFixed(2))
            : 0,
        trend: getTrend(values.recentCount, values.previousCount),
        trendDelta,
      };
    })
    .sort((a, b) => b.count - a.count || b.recentCount - a.recentCount)
    .slice(0, 8);

  const recurringCategories = topCategories
    .filter((item) => item.count >= 2)
    .slice(0, 5);

  const risingCategories = [...topCategories]
    .filter((item) => item.trend === "up")
    .sort(
      (a, b) => b.trendDelta - a.trendDelta || b.recentCount - a.recentCount
    )
    .slice(0, 3);

  const activeDays = recentActiveDaySet.size;
  const sortedDays = Array.from(allActiveDaySet).sort();
  const latestDay = sortedDays[sortedDays.length - 1];
  let latestStreakDays = latestDay ? 1 : 0;
  let cursor = latestDay ? new Date(`${latestDay}T00:00:00.000Z`) : null;

  for (let index = sortedDays.length - 2; index >= 0 && cursor; index -= 1) {
    const expected = new Date(cursor.getTime() - DAY_MS);
    if (sortedDays[index] !== dateKey(expected)) break;
    latestStreakDays += 1;
    cursor = expected;
  }

  let longestGapDays = 0;
  for (let index = 1; index < sortedDays.length; index += 1) {
    const prev = new Date(`${sortedDays[index - 1]}T00:00:00.000Z`);
    const curr = new Date(`${sortedDays[index]}T00:00:00.000Z`);
    longestGapDays = Math.max(longestGapDays, wholeDaysBetween(prev, curr) - 1);
  }

  const latestDream = dreams[dreams.length - 1] as any;
  const latestDreamAt = latestDream?.createdAt
    ? new Date(latestDream.createdAt).toISOString()
    : null;

  return {
    windowDays,
    sinceISO: since.toISOString(),
    previousSinceISO: previousSince.toISOString(),
    totalDreams,
    recentDreams,
    previousDreams,
    activeDays,
    latestDreamAt,
    latestStreakDays,
    longestGapDays,
    topCategories,
    recurringCategories,
    risingCategories,
    weeklyActivity: weeklyBuckets.map((bucket) => ({
      startISO: bucket.start.toISOString(),
      endISO: bucket.end.toISOString(),
      count: bucket.count,
    })),
    suggestedFocusCategory:
      risingCategories[0]?.category ?? topCategories[0]?.category ?? null,
    dataQuality:
      totalDreams === 0 ? "empty" : totalDreams < 3 ? "light" : "ready",
  };
};
