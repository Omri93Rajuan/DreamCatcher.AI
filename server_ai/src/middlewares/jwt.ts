import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/users.interface";

interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

const SECRET_KEY = process.env.JWT_ACCESS_SECRET || "fallback_secret_key";

const generateAuthToken = (user: { _id: any; role: UserRole }): string => {
  return jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
};

// Middleware לאימות משתמש רגיל
const verifyUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.["auth_token"];

  if (!token) {
    res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    }) as TokenPayload;

    // שמירה של המשתמש ב־req
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "error",
        message: "Token expired. Please log in again.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        status: "error",
        message: "Invalid or malformed token.",
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Internal error during authentication.",
    });
  }
};

// Middleware לאימות אדמין
const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  verifyUser(req, res, () => {
    const user = (req as any).user;

    if (!user || !user.isAdmin) {
      res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    next();
  });
};

export { generateAuthToken, verifyUser, verifyAdmin };
