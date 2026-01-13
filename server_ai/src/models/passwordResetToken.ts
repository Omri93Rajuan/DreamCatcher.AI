import mongoose, { Document, Schema } from "mongoose";
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
    },
    lastRequestedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);
const PasswordResetQuota =
  (mongoose.models
    .PasswordResetQuota as mongoose.Model<PasswordResetQuotaDoc>) ||
  mongoose.model<PasswordResetQuotaDoc>(
    "PasswordResetQuota",
    PasswordResetQuotaSchema
  );
export default PasswordResetQuota;
