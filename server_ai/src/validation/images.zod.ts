import { z } from "zod";

export const proxyImageSchema = z.object({
  params: z.object({
    0: z.string().min(1, "Image key is required"),
  }),
});
