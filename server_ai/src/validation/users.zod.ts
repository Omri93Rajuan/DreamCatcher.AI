import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const isoDate = z.union([z.date(), z.string().datetime()]);

const userBodySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  image: z.string().optional(),
  termsAccepted: z.boolean().optional(),
  termsAcceptedAt: isoDate.optional(),
  termsVersion: z.string().optional(),
  termsIp: z.string().nullable().optional(),
  termsUserAgent: z.string().nullable().optional(),
  termsLocale: z.string().nullable().optional(),
});

export const createUserRequestSchema = z.object({
  body: userBodySchema,
});

export const updateUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
  body: userBodySchema.omit({ password: true }).partial().strict(),
});

export const getUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});

export const deleteUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});

export const listUsersRequestSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
    })
    .optional(),
});

export const loginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerRequestSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    image: z.string().optional(),
    termsAgreed: z.literal(true),
    termsVersion: z.string().min(1),
  }),
});

export const logoutRequestSchema = z.object({
  body: z.object({}).optional(),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordWithCookieSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6),
  }),
});
