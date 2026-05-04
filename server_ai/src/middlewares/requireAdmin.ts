import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types/auth.interface";

export default function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({
      success: false,
      error: "admin_required",
      message: "Admin privileges are required.",
    });
    return;
  }

  next();
}
