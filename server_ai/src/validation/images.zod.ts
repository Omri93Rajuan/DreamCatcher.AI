import { z } from "zod";

export const proxyImageSchema = z.object({
  params: z.object({
    key: z.array(z.string()).min(1, "Image key is required"),
  }),
});
