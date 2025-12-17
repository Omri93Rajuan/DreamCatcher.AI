import { z } from "zod";

const termsAcceptedSchema = z.enum(["true", "false", "1", "0"]).optional();

export const googleAuthUrlSchema = z
  .object({
    query: z.object({
      mode: z.enum(["login", "signup"]).optional(),
      redirectTo: z.string().optional(),
      next: z.string().optional(),
      termsAccepted: termsAcceptedSchema,
      termsVersion: z.string().optional(),
      termsLocale: z.string().optional(),
    }),
  })
  .superRefine((val, ctx) => {
    if (val.query.mode === "signup") {
      if (
        !val.query.termsAccepted ||
        !["true", "1"].includes(val.query.termsAccepted)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["query", "termsAccepted"],
          message: "termsAccepted must be true for signup",
        });
      }
      if (!val.query.termsVersion) {
        ctx.addIssue({
          code: "custom",
          path: ["query", "termsVersion"],
          message: "termsVersion is required for signup",
        });
      }
    }
  });

export const googleCallbackSchema = z.object({
  query: z.object({
    code: z.string().min(1),
    state: z.string().min(1),
  }),
});

export const consumeResetTokenSchema = z.object({
  query: z.object({
    token: z.string().min(1),
  }),
});

export const verifyTokenSchema = z.object({
  body: z.object({}).optional(),
});

export const refreshTokenSchema = z.object({
  body: z.object({}).optional(),
});
