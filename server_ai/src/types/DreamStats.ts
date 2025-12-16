import { Schema, Types, model } from "mongoose";
const dreamStatsSchema = new Schema(
  {
    dreamId: {
      type: Types.ObjectId,
      ref: "Dream",
      required: true,
      unique: true,
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    lastViewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export const DreamStats = model("DreamStats", dreamStatsSchema);
