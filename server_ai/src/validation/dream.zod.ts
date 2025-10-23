import { z } from "zod";

const zodMongoObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const dreamSchema = z.object({
  _id: zodMongoObjectId.optional(),
  userId: zodMongoObjectId,
  title: z.string().min(1, "Title is required"),
  userInput: z.string().min(1, "User input (dream text) is required"),
  aiResponse: z.string().min(1, "AI response is required"),
  createdAt: z.union([z.date(), z.string().datetime()]).optional(),
  updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
});

// POST /api/dreams – יצירת חלום חדש
export const createDreamRequestSchema = z.object({
  body: dreamSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  }),
});

// PUT /api/dreams/:id – עדכון חלום קיים
export const updateDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
  body: dreamSchema
    .partial() // מאפשר עדכון חלקי
    .omit({
      _id: true,
      createdAt: true,
      updatedAt: true,
    }),
});

// GET /api/dreams/:id – קבלת חלום בודד
export const getDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
});

// DELETE /api/dreams/:id – מחיקת חלום
export const deleteDreamRequestSchema = z.object({
  params: z.object({
    id: zodMongoObjectId,
  }),
});

export const listDreamsRequestSchema = z.object({
  query: z
    .object({
      userId: zodMongoObjectId.optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
      filter: z.string().optional(),
    })
    .optional(),
});
