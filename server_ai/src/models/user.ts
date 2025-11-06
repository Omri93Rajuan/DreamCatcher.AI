import { Schema, model, models, HydratedDocument } from "mongoose";
import {
  IUser,
  UserRole,
  SubscriptionType,
  IUserDoc,
} from "../types/users.interface";

const userSchema = new Schema<IUserDoc>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/, "Invalid email"],
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
    subscription: {
      type: String,
      enum: Object.values(SubscriptionType),
      default: SubscriptionType.Free,
    },
    image: { type: String, default: "default-avatar.jpg" },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    subscriptionExpiresAt: { type: Date },

    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    termsVersion: { type: String },
    termsIp: { type: String, default: null },
    termsUserAgent: { type: String, default: null },
    termsLocale: { type: String, default: null },

    resetPasswordTokenHash: { type: String, default: null, select: false },
    resetPasswordExpiresAt: { type: Date, default: null },

    lastPasswordResetRequestAt: Date, // בקשה אחרונה לאיפוס
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.virtual("name").get(function (this: HydratedDocument<IUser>) {
  return `${this.firstName} ${this.lastName}`.trim();
});

export default (models.User as any) || model<IUserDoc>("User", userSchema);
