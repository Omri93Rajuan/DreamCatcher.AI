import mongoose, { Schema } from "mongoose";
export type ActivityType = "view" | "like" | "dislike";
const dreamActivitySchema = new Schema(
  {
    dreamId: {
      type: Schema.Types.ObjectId,
      ref: "Dream",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ipHash: { type: String, default: null },
    type: { type: String, enum: ["view", "like", "dislike"], required: true },
    dayBucket: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
dreamActivitySchema.index(
  { dreamId: 1, userId: 1, ipHash: 1, dayBucket: 1, type: 1 },
  { unique: true }
);
dreamActivitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
export const DreamActivity = mongoose.model(
  "DreamActivity",
  dreamActivitySchema
);
