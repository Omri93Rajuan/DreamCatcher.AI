import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const isoDate = z.union([z.date(), z.string().datetime()]);

export const userSchema = z.object({
  _id: zodMongoObjectId.optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).default("user"),
  subscription: z.enum(["free", "premium"]).default("free"),
  image: z.string().optional(), // ⬅️ לא מחייב URL
  lastLogin: isoDate.optional(),
  isActive: z.boolean().default(true),
  subscriptionExpiresAt: isoDate.optional(),

  // ⬇️ שדות תנאי שימוש שמורים בבאקאנד
  termsAccepted: z.boolean().optional(),
  termsAcceptedAt: isoDate.optional(),
  termsVersion: z.string().optional(),
  termsIp: z.string().nullable().optional(),
  termsUserAgent: z.string().nullable().optional(),
  termsLocale: z.string().nullable().optional(),

  createdAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
});

// -------- Users CRUD --------

// POST /api/users
export const createUserRequestSchema = z.object({
  body: userSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
  }),
});

// PUT /api/users/:id
export const updateUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
  body: userSchema.partial().omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    // סיסמה לעדכון אופציונלית; אם מעדכנים – בצד ה־service תתבצע הצפנה
  }),
});

// GET /api/users/:id
export const getUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});

// DELETE /api/users/:id
export const deleteUserRequestSchema = z.object({
  params: z.object({ id: zodMongoObjectId }),
});

// GET /api/users (list)
export const listUsersRequestSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
      filter: z.string().optional(),
    })
    .optional(),
});

// -------- Auth --------

// POST /api/users/login
export const loginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

// POST /api/users/register
// נפרד מ-userSchema כי יש בו שדות ייעודיים להסכמה
export const registerRequestSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    image: z.string().optional(),
    termsAgreed: z.literal(true), // חייב להיות true
    termsVersion: z.string().min(1),
  }),
});

// POST /api/users/logout – לא צריך גוף
export const logoutRequestSchema = z.object({
  body: z.object({}).optional(),
});
