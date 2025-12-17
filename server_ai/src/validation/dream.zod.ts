import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const categoriesSchema = z
  .union([z.array(z.string().min(1)), z.string().min(1)])
  .optional();

const categoryScoresSchema = z
  .record(z.string().min(1), z.number().min(0).max(1))
  .optional();

const dreamBodySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  userInput: z.string().min(1, "User input (dream text) is required"),
  aiResponse: z.string().min(1, "AI response is required").optional(),
  isShared: z.coerce.boolean().optional(),
  model: z.string().optional(),
  categories: categoriesSchema,
  categoryScores: categoryScoresSchema,
});

export const createDreamRequestSchema = z.object({
  body: dreamBodySchema,
});

export const updateDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
  body: dreamBodySchema.partial(),
});

export const interpretDreamRequestSchema = z.object({
  body: z
    .object({
      text: z.string().trim().optional(),
      userInput: z.string().trim().optional(),
      prompt: z.string().trim().optional(),
      dream_text: z.string().trim().optional(),
      isShared: z.coerce.boolean().optional(),
      model: z.string().optional(),
      titleOverride: z.string().optional(),
      categories: categoriesSchema,
      categoryScores: categoryScoresSchema,
    })
    .refine(
      (val) =>
        !!(
          val.text?.trim() ||
          val.userInput?.trim() ||
          val.prompt?.trim() ||
          val.dream_text?.trim()
        ),
      { message: "At least one dream text field is required" }
    ),
});

export const getDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
});

export const deleteDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
});

export const listDreamsRequestSchema = z.object({
  query: z
    .object({
      userId: zodMongoObjectId.optional(),
      viewerId: zodMongoObjectId.optional(),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
      categories: categoriesSchema,
      category: z.string().optional(),
    })
    .optional(),
});

export const dreamStatsRequestSchema = z.object({
  query: z
    .object({
      windowDays: z.coerce.number().int().min(0).max(36500).optional(),
    })
    .optional(),
});
