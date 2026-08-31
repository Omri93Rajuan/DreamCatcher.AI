import { z } from "zod";
import { countWords } from "../utils/countWords";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const DREAM_INPUT_LIMITS = {
  text: 10000,
  words: 60,
  title: 120,
  search: 120,
  pageLimit: 50,
} as const;

const categoriesSchema = z
  .union([z.array(z.string().min(1)), z.string().min(1)])
  .optional();

const localeSchema = z.enum(["he", "en"]);
const dreamTextSchema = z
  .string()
  .trim()
  .min(1, "Dream text is required")
  .max(
    DREAM_INPUT_LIMITS.text,
    `Dream text must be ${DREAM_INPUT_LIMITS.text} characters or fewer`
  )
  .refine((value) => countWords(value) <= DREAM_INPUT_LIMITS.words, {
    message: `Dream text must be ${DREAM_INPUT_LIMITS.words} words or fewer`,
  });
const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(
    DREAM_INPUT_LIMITS.title,
    `Title must be ${DREAM_INPUT_LIMITS.title} characters or fewer`
  );

const createDreamBodySchema = z
  .object({
    title: titleSchema.optional(),
    userInput: dreamTextSchema,
    isShared: z.boolean().optional(),
    locale: localeSchema.optional(),
  })
  .strict();

export const createDreamRequestSchema = z.object({
  body: createDreamBodySchema,
});

export const updateDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
  body: z
    .object({
      title: titleSchema.optional(),
      isShared: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one editable field is required",
    }),
});

export const interpretDreamRequestSchema = z.object({
  body: z
    .object({
      text: dreamTextSchema.optional(),
      userInput: dreamTextSchema.optional(),
      prompt: dreamTextSchema.optional(),
      dream_text: dreamTextSchema.optional(),
      isShared: z.boolean().optional(),
      titleOverride: titleSchema.optional(),
      locale: localeSchema.optional(),
    })
    .strict()
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
      search: z.string().trim().max(DREAM_INPUT_LIMITS.search).optional(),
      sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
      order: z.enum(["asc", "desc"]).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(DREAM_INPUT_LIMITS.pageLimit).optional(),
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

export const journalInsightsRequestSchema = z.object({
  query: z
    .object({
      windowDays: z.coerce.number().int().min(7).max(365).optional(),
    })
    .optional(),
});
