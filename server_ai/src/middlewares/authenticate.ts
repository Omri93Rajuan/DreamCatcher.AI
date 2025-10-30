import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types/auth.interface";

/**
 * ודא שבאפליקציה הראשית מוגדר:
 *   app.use(cookieParser())
 * ושיש JWT_SECRET בסביבת הריצה
 */
const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.auth_token;

    // לוגים שימושיים אך לא חושפים סודות
    const short = token ? token.slice(0, 16) + "..." : "(none)";
    console.log("[AUTH] cookies present:", !!req.cookies, "| token:", short);

    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[AUTH] Missing JWT_SECRET env");
      res.status(500).json({ error: "server_misconfigured" });
      return;
    }

    // אימות אמיתי
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log(
      "[AUTH] verified OK. payload keys:",
      Object.keys(decoded || {})
    );

    // תמיכה בכל וריאציות ה-id, כולל _id (כמו בלוג שלך)
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

    console.log("[AUTH] using userId:", req.user._id);
    next();
  } catch (err: any) {
    console.error("[AUTH] verify failed:", err?.name, err?.message);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

export default authenticate;
