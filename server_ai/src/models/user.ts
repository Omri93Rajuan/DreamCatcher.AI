import mongoose, { Document, Schema } from "mongoose";
import { IUser, UserRole, SubscriptionType } from "../types/users.interface";

const userSchema: Schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/, "Please enter a valid email"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(UserRole), // ["admin", "user"]
      default: UserRole.User,
    },
    subscription: {
      type: String,
      enum: Object.values(SubscriptionType), // ["free", "premium"]
      default: SubscriptionType.Free,
    },
    image: {
      type: String,
      default: "default-avatar.jpg",
    },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser & Document>("User", userSchema);
