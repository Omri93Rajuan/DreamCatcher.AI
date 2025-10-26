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
  password: string;
  role: UserRole;
  subscription: SubscriptionType;
  image?: string;
  lastLogin?: Date;
  isActive?: boolean;
  subscriptionExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
