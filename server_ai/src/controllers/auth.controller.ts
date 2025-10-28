import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  getMe,
  login as loginSvc,
  logout as logoutSvc,
  register as registerSvc,
} from "../services/auth.service";
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
    maxAge: 15 * 60 * 1000, // 15m
  });
}
function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await registerSvc(req.body);

    // יצירת JWT + קוקיות כמו בלוגין
    const accessToken = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { _id: user._id, role: user.role },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user });
  } catch (error: any) {
    handleError(
      res,
      error.status || 400,
      error.message || "Registration failed"
    );
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await loginSvc(req.body);

    const accessToken = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { _id: user._id, role: user.role },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({ user });
  } catch (error: any) {
    handleError(res, error.status || 401, error.message || "Login failed");
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  try {
    logoutSvc();
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  try {
    const rt = req.cookies?.refresh_token as string | undefined;
    if (!rt) {
      handleError(res, 401, "No refresh token provided");
      return;
    }

    jwt.verify(rt, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) {
        handleError(res, 401, "Invalid refresh token");
        return;
      }

      const newAccess = jwt.sign(
        { _id: decoded._id, role: decoded.role },
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
    const fromCookie = req.cookies?.auth_token as string | undefined;
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
