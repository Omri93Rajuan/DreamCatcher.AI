import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types/auth.interface";

const authenticateSoft = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.auth_token;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    // אין טוקן → ממשיכים בתור לא מחובר
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const userId =
      decoded._id?.toString() ||
      decoded.id?.toString() ||
      decoded.sub?.toString() ||
      null;

    req.user = {
      _id: userId,
      role: decoded.role,
      isAdmin: decoded.role === "admin",
    };
  } catch (err) {
    console.log("[AUTH-SOFT] Invalid token, ignoring");
    // ממשיכים בלי req.user
  }

  next();
};

export default authenticateSoft;
