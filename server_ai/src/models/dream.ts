// src/models/dream.ts
import { Schema, model } from "mongoose";
import { IDream } from "../types/dream.interface";
import { DREAM_CATEGORIES } from "../types/categories.interface";
const DreamSchema = new Schema<IDream>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    userInput: { type: String, required: true },
    aiResponse: { type: String, required: true },
    isShared: { type: Boolean, default: false, index: true },
    sharedAt: { type: Date, default: null },

    // ⬇️ חדש:
    categories: {
      type: [String],
      enum: DREAM_CATEGORIES,
      default: [],
      index: true,
    },
    categoryScores: {
      type: Map,
      of: Number,
      default: undefined,
    },
  },
  { timestamps: true }
);

// אינדקסים שימושיים
DreamSchema.index({ userId: 1, isShared: 1, categories: 1, createdAt: -1 });
DreamSchema.index({ isShared: 1, categories: 1, createdAt: -1 });

export const Dream = model<IDream>("Dream", DreamSchema);
