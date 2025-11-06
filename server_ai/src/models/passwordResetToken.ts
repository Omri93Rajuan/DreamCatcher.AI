import mongoose, { Schema, Document } from "mongoose";

export interface PasswordResetQuotaDoc extends Document {
  userId: mongoose.Types.ObjectId;
  lastRequestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetQuotaSchema = new Schema<PasswordResetQuotaDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // חשוב: גם required וגם default כדי שב-upsert עם setDefaultsOnInsert זה ייכתב
    lastRequestedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

// אינדקס ייחודי על userId לוודא “פעם ליום ליוזר”
PasswordResetQuotaSchema.index({ userId: 1 }, { unique: true });

const PasswordResetQuota =
  (mongoose.models
    .PasswordResetQuota as mongoose.Model<PasswordResetQuotaDoc>) ||
  mongoose.model<PasswordResetQuotaDoc>(
    "PasswordResetQuota",
    PasswordResetQuotaSchema
  );

export default PasswordResetQuota;
