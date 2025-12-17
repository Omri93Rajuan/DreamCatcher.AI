import { z } from "zod";

export const avatarUploadSchema = z.object({
  body: z.object({
    contentType: z.string().min(1, "contentType is required"),
    contentLength: z.coerce.number().int().positive().optional(),
  }),
});
