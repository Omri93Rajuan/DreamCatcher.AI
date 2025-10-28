// src/services/dream.service.ts
import { Dream } from "../models/dream";
import { LLMOptions } from "../llm/llm.types";
import { getLLMProvider } from "../llm";

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

/** 🔹 שמירה ישירה כשכבר יש לנו פירוש (ללא LLM נוסף) */
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

/** שמירה הכוללת קריאת LLM (כאשר אין פירוש מוכן) */
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

  const visibilityFilter = viewerId
    ? { $or: [{ isShared: true }, { userId: viewerId }] }
    : { isShared: true };

  const creatorId = userId || ownerId;
  const creatorFilter = creatorId ? { userId: creatorId } : {};

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

  return { dreams, total, page: safePage, pages: Math.ceil(total / safeLimit) };
};

export const getDreamById = async (id: string) => Dream.findById(id);
export const deleteDream = async (id: string) => Dream.findByIdAndDelete(id);
