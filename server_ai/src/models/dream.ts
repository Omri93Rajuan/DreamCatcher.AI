import { Schema, model } from "mongoose";
import { IDream } from "../types/dream.interface";

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
  },
  { timestamps: true }
);

DreamSchema.index({ userId: 1, isShared: 1, createdAt: -1 });

export const Dream = model<IDream>("Dream", DreamSchema);
