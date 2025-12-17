import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import type { AuthRequest, JwtPayload } from "../types/auth.interface";
export default async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bearer = req.headers.authorization;
    const headerToken =
      bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : undefined;
    const token = req.cookies?.auth_token || headerToken;
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error("[AUTH] Missing JWT_ACCESS_SECRET env");
      res.status(500).json({ error: "server_misconfigured" });
      return;
    }
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      iat?: number;
    };
    const userId =
      decoded._id?.toString() ||
      decoded.id?.toString() ||
      decoded.sub?.toString() ||
      null;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: bad payload" });
      return;
    }
    const user = await User.findById(userId).select(
      "_id role isActive passwordChangedAt"
    );
    if (!user || user.isActive === false) {
      res.status(401).json({ error: "Unauthorized: user_inactive_or_missing" });
      return;
    }
    if (user.passwordChangedAt && decoded.iat) {
      const issuedAtMs = decoded.iat * 1000;
      if (issuedAtMs < user.passwordChangedAt.getTime()) {
        res.status(401).json({ error: "token_revoked" });
        return;
      }
    }
    req.user = {
      _id: String(user._id),
      role: user.role,
      isAdmin: user.role === "admin",
    };
    next();
  } catch (err: any) {
    console.error("[AUTH] verify failed:", err?.name, err?.message);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}
