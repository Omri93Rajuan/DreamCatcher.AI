// src/services/auth.service.ts
import { CookieOptions, Response } from "express";
import { comparePassword } from "../helpers/bcrypt";
import { generateAuthToken } from "../middlewares/jwt";
import Users from "../models/user";
import type { IUser } from "../types/users.interface";

const isProd = process.env.NODE_ENV === "production";

const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  path: "/",
};

interface LoginDTO {
  email: string;
  password: string;
}

export const login = async (user: LoginDTO, res: Response) => {
  if (!user?.email || !user?.password) {
    const err: any = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }

  // ⚠️ חשוב: password הוא select:false בסכמה → חייבים +password
  const found = await Users.findOne({ email: user.email })
    .select("+password")
    .lean<IUser & { password: string; name?: string }>()
    .exec();

  if (!found) {
    const err: any = new Error("Could not find this user in the database");
    err.status = 401;
    throw err;
  }

  // אם הסידינג שמר סיסמאות לא מוצפנות, ההשוואה תיכשל.
  // ניתן לזהות hash אמיתי לפי התחלה ב-$2
  const isHash =
    typeof found.password === "string" && found.password.startsWith("$2");
  if (!isHash) {
    const err: any = new Error("User password is not hashed in DB");
    err.status = 500;
    throw err;
  }

  const ok = await comparePassword(user.password, found.password);
  if (!ok) {
    const err: any = new Error("Incorrect password or Email");
    err.status = 401;
    throw err;
  }

  const name =
    (found as any).name ?? `${found.firstName} ${found.lastName}`.trim();

  const token = generateAuthToken({
    _id: found._id,
    role: found.role,
  });

  res.cookie("auth_token", token, cookieConfig);

  const publicUser: Omit<IUser, "password"> & { _id: string; name?: string } = {
    _id: String(found._id),
    email: found.email,
    role: found.role,
    subscription: found.subscription,
    firstName: found.firstName,
    lastName: found.lastName,
    image: found.image,
    lastLogin: found.lastLogin,
    isActive: found.isActive,
    subscriptionExpiresAt: found.subscriptionExpiresAt,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
    name,
  };

  return { foundUser: publicUser, token };
};

export const logout = (res: Response) => {
  res.clearCookie("auth_token", { ...cookieConfig });
};

export const getMe = async (userId: string) => {
  if (!userId) {
    const err: any = new Error("Missing userId");
    err.status = 400;
    throw err;
  }
  const u = await Users.findById(userId)
    .lean<IUser & { name?: string }>()
    .exec();
  if (!u) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }
  delete (u as any).password;
  if (!u.name)
    (u as any).name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return u;
};
