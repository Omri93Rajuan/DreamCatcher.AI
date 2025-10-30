import type { RequestHandler } from "express";
import {
  recordActivity,
  getReactions,
  getPopular,
} from "../services/dreamActivity.service";
import type { AuthRequest } from "../types/auth.interface";

// אחיד ופשוט: אף פעם לא נחזיר מחרוזת ריקה כ-userId
const getAuth = (req: AuthRequest) => {
  const raw = req.user?._id;
  const clean =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  return {
    userId: clean,
    isAdmin: !!req.user?.isAdmin,
  };
};

// פונקציה עזר לשגיאות
const handleErr = (res: any, code: number, msg: string) => {
  res.status(code).json({ error: msg });
};

// POST /activity/:id  body: { type: "view"|"like"|"dislike" }
export const postActivity: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body as { type?: "view" | "like" | "dislike" };

    if (!type) {
      res.status(400).json({ error: "missing_type" });
      return;
    }

    const { userId } = getAuth(req);

    const result = await recordActivity({
      dreamId: id,
      userId, // יהיה null אם אין משתמש מאומת — לא מחרוזת ריקה
      ip: req.ip,
      type,
    });

    if (!result?.ok) {
      const code =
        result?.reason === "not_found"
          ? 404
          : result?.reason === "auth_required"
          ? 401
          : result?.reason === "forbidden"
          ? 403
          : 400;
      res.status(code).json(result);
      return;
    }

    res.json(result);
  } catch (e: any) {
    console.error("[Activity Error]", e);
    res.status(500).json({ error: e?.message ?? "internal_error" });
  }
};

// GET /activity/:id/reactions
export const getDreamReactions: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);

    const data = await getReactions(id, userId);
    res.json(data);
  } catch (e: any) {
    console.error("[Reactions Error]", e);
    handleErr(res, 500, e?.message ?? "internal_error");
  }
};

// GET /activity/popular?windowDays=7&limit=6&series=1
export const getPopularController: RequestHandler = async (req, res) => {
  try {
    const raw = String(req.query.windowDays ?? "7").toLowerCase();
    const windowDays =
      raw === "all" ? 0 : Math.max(0, Math.min(36500, Number(raw) || 0));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 6));
    const withSeries = String(req.query.series ?? "0") === "1";

    const rows = await getPopular(windowDays, limit, withSeries);
    res.json(rows);
  } catch (e: any) {
    console.error("[Popular Error]", e);
    res.status(500).json({ error: "popular_failed", message: e?.message });
  }
};
