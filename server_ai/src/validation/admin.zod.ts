import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const adminOverviewRequestSchema = z.object({
  query: z
    .object({
      windowDays: z.coerce.number().int().min(1).max(365).optional(),
    })
    .optional(),
});

export const adminDreamsRequestSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      search: z.string().optional(),
      isShared: z.enum(["true", "false", "1", "0"]).optional(),
      sortBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

export const adminDeleteDreamRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});
