import { ObjectId } from "mongoose";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export enum SubscriptionType {
  Free = "free",
  Premium = "premium",
}

/** מודל DB מלא (שימוש פנימי בלבד) */
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

  // Terms / TOS
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

/** מה שיוצא ללקוח (ללא password) */
export type PublicUser = Omit<IUser, "password">;

/** DTO ליצירת משתמש (בד"כ אדמין/הרשמה) */
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image?: string;
  // אפשרי בזמן הרשמה:
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;
}

/** DTO לעדכון משתמש מה־UI: בלי password/role/subscription/terms */
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

/** אופציונלי: DTO נפרד לקבלת תנאים (אם תפתח endpoint ייעודי) */
export interface AcceptTermsDTO {
  termsAccepted: true;
  termsAcceptedAt: Date;
  termsVersion: string;
  termsIp?: string | null;
  termsUserAgent?: string | null;
  termsLocale?: string | null;
}
