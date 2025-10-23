import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getMe, login, logout } from "../services/auth.service";
import { handleError } from "../utils/ErrorHandle";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecret";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.body;
    const RealUser = await login(user, res);

    const refreshToken = jwt.sign(
      { _id: RealUser.foundUser._id, role: RealUser.foundUser.role },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ ...RealUser, refreshToken });
  } catch (error: any) {
    handleError(res, error.status || 401, error.message);
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  try {
    logout(res);
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      handleError(res, 401, "No refresh token provided");
      return;
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) {
        return handleError(res, 403, "Invalid refresh token");
      }

      const newAccessToken = jwt.sign(
        { _id: (decoded as any)._id, role: (decoded as any).role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token: newAccessToken });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

export const verifyToken = (req: Request, res: Response): void => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      handleError(res, 401, "No token provided");
      return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) {
        return handleError(res, 403, "Invalid token");
      }
      res.json({ valid: true, decoded });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // מ-JWT middleware
    const foundUser = await getMe(userId);

    if (!foundUser) {
      handleError(res, 404, "User not found"); // ✅ בלי return
      return;
    }

    res.json({ foundUser });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
