import Users from "../models/user";
import type { IUser } from "../types/users.interface";
import { comparePassword, hashPassword } from "../helpers/bcrypt";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image?: string;
}

/**
 * מחזיר את המשתמש הציבורי (ללא סיסמה) אם האישורים תקינים.
 * אין כאן יצירת טוקנים/קוקיות – זה בטיפול הקונטרולר.
 */
export const login = async (creds: LoginDTO) => {
  if (!creds?.email || !creds?.password) {
    const err: any = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }

  // שים לב: password בסכמה כנראה select:false
  const found = await Users.findOne({ email: creds.email })
    .select("+password")
    .lean<IUser & { password: string; name?: string }>()
    .exec();

  if (!found) {
    const err: any = new Error("Could not find this user in the database");
    err.status = 401;
    throw err;
  }

  // וידוא שהסיסמה מסו-האש בדאטהבייס
  const isHash =
    typeof found.password === "string" && found.password.startsWith("$2");
  if (!isHash) {
    const err: any = new Error("User password is not hashed in DB");
    err.status = 500;
    throw err;
  }

  const ok = await comparePassword(creds.password, found.password);
  if (!ok) {
    const err: any = new Error("Incorrect password or Email");
    err.status = 401;
    throw err;
  }

  const name =
    (found as any).name ??
    `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();

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

  return publicUser;
};

/**
 * יצירת משתמש חדש (כולל hashing לסיסמה) והחזרת המשתמש הציבורי.
 */
export const register = async (data: RegisterDTO) => {
  const { firstName, lastName, email, password, image } = data || {};
  if (!firstName || !lastName || !email || !password) {
    const err: any = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }

  const exists = await Users.findOne({ email }).lean().exec();
  if (exists) {
    const err: any = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  // אם יש לך pre('save') שמבצע hashing – אפשר לדלג על השורה הבאה ולהשאיר password רגיל
  const hashed = await hashPassword(password);

  const created = await Users.create({
    firstName,
    lastName,
    email,
    password: hashed,
    image,
    isActive: true,
    lastLogin: new Date(),
  });

  const publicUser: Omit<IUser, "password"> & { _id: string; name?: string } = {
    _id: String(created._id),
    email: created.email,
    role: created.role,
    subscription: created.subscription,
    firstName: created.firstName,
    lastName: created.lastName,
    image: created.image,
    lastLogin: created.lastLogin,
    isActive: created.isActive,
    subscriptionExpiresAt: created.subscriptionExpiresAt,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    name: `${created.firstName ?? ""} ${created.lastName ?? ""}`.trim(),
  };

  return publicUser;
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

export const logout = () => {
  // אין לוגיקה בשרת מלבד ניקוי קוקיות בקונטרולר
  return true;
};
