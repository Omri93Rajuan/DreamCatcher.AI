import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getMe, login, logout } from "../services/auth.service";
import { handleError } from "../utils/ErrorHandle";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "supersecret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.REFRESH_SECRET ||
  "refreshsecret";
const isProd = process.env.NODE_ENV === "production";

function setAccessCookie(res: Response, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
}
function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// עוזר קטן להפוך Document ל-POJO אם צריך
function toPlain<T>(doc: any): T {
  return doc?.toObject ? doc.toObject() : doc;
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const creds = req.body;
    const RealUser = await login(creds, res);

    const u = toPlain<{
      _id: string;
      email: string;
      role?: string;
      name?: string;
    }>(RealUser.foundUser);

    const accessToken = jwt.sign(
      { _id: u._id, role: u.role, email: u.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { _id: u._id, role: u.role },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      user: { _id: u._id, email: u.email, name: u.name, role: u.role },
    });
    return;
  } catch (error: any) {
    handleError(res, error.status || 401, error.message);
    return;
  }
};

export const logoutUser = (
  req: Request,
  res: Response
): Promise<void> | void => {
  try {
    logout(res);
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
    return;
  } catch (error: any) {
    handleError(res, 500, error.message);
    return;
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  try {
    const rt = req.cookies.refresh_token as string | undefined;
    if (!rt) {
      handleError(res, 401, "No refresh token provided");
      return;
    }

    jwt.verify(rt, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) {
        handleError(res, 401, "Invalid refresh token"); // 401 כדי לאפשר ללקוח לנקות סשן
        return;
      }

      const newAccess = jwt.sign(
        { _id: (decoded as any)._id, role: (decoded as any).role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      setAccessCookie(res, newAccess);
      res.json({ ok: true });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

export const verifyToken = (req: Request, res: Response): void => {
  try {
    const fromCookie = req.cookies.auth_token as string | undefined;
    const auth = req.headers.authorization;
    const fromHeader = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
    const token = fromCookie || fromHeader;

    if (!token) {
      handleError(res, 401, "No token provided");
      return;
    }

    jwt.verify(token, ACCESS_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) {
        handleError(res, 401, "Invalid token");
        return;
      }
      const p = decoded as any;
      res.json({
        valid: true,
        user: { id: p._id, role: p.role, email: p.email },
      });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const foundUser = await getMe(id);

    if (!foundUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user: foundUser });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
