import { Document, ObjectId } from "mongoose";
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
  password: string;
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
  googleId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type PublicUser = Omit<IUser, "password">;
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;
  googleId?: string | null;
}
export type UpdateUserDTO = Partial<
  Omit<
    IUser,
    | "password"
    | "role"
    | "subscription"
    | "termsAccepted"
    | "termsAcceptedAt"
    | "termsVersion"
    | "termsIp"
    | "termsUserAgent"
    | "termsLocale"
  >
>;
export interface AcceptTermsDTO {
  termsAccepted: true;
  termsAcceptedAt: Date;
  termsVersion: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;
}
export interface IUserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
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
  resetPasswordTokenHash?: string | null;
  resetPasswordExpiresAt?: Date | null;
  lastPasswordResetRequestAt: Date;
  passwordChangedAt: Date;
  googleId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
