import { z } from "zod";

export const recordVisitRequestSchema = z.object({
  body: z.object({
    sessionId: z.string().trim().min(8).max(160).optional(),
    path: z.string().trim().max(240).optional(),
  }),
});
