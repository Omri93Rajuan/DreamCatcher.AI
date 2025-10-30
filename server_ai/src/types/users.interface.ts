import { ObjectId } from "mongoose";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export enum SubscriptionType {
  Free = "free",
  Premium = "premium",
}

export interface IUser {
  _id?: ObjectId | string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // select:false במודל
  role: UserRole;
  subscription: SubscriptionType;
  image?: string;
  lastLogin?: Date;
  isActive?: boolean;
  subscriptionExpiresAt?: Date;

  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}
