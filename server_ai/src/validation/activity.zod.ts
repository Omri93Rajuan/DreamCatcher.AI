import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const postActivitySchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
  body: z.object({
    type: z.enum(["view", "like", "dislike"]),
  }),
});

export const reactionsSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});

export const popularSchema = z.object({
  query: z
    .object({
      windowDays: z
        .union([z.literal("all"), z.coerce.number().int().min(0).max(36500)])
        .optional(),
      limit: z.coerce.number().int().min(1).max(50).optional(),
      series: z.enum(["0", "1"]).optional(),
    })
    .optional(),
});
