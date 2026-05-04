import mongoose, { Schema } from "mongoose";

const siteVisitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    sessionIdHash: { type: String, required: true },
    ipHash: { type: String, default: null },
    userAgentHash: { type: String, default: null },
    path: { type: String, default: "/" },
    dayBucket: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

siteVisitSchema.index(
  { sessionIdHash: 1, dayBucket: 1 },
  { unique: true }
);
siteVisitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const SiteVisit = mongoose.model("SiteVisit", siteVisitSchema);
