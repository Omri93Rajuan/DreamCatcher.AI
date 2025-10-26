// controllers/dreamActivity.controller.ts
import type { RequestHandler } from "express";
import { handleError } from "../utils/ErrorHandle";
import {
  recordActivity,
  getReactions,
  getPopularThisWeek,
} from "../services/dreamActivity.service";

export const postActivity: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body as { type?: "view" | "like" | "dislike" };
    if (!type) {
      res.status(400).json({ error: "missing_type" });
      return;
    }

    const userId =
      (req as any).userId ||
      (req as any).user?._id ||
      (req as any).user?.id ||
      null;

    const result = await recordActivity({
      dreamId: id,
      userId,
      ip: req.ip,
      type,
    });

    if (!result.ok) {
      const code =
        result.reason === "not_found"
          ? 404
          : result.reason === "forbidden" || result.reason === "auth_required"
          ? 403
          : 400;
      res.status(code).json(result);
      return;
    }

    res.json(result);
  } catch (e: any) {
    console.error("[Activity Error]", e);
    // if you want centralized error handling:
    // return next(e);
    handleError(res, 500, e.message);
    return;
  }
};

export const getDreamReactions: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId =
      (req as any).userId ||
      (req as any).user?._id ||
      (req as any).user?.id ||
      null;

    const data = await getReactions(id, userId);
    res.json(data);
  } catch (e: any) {
    console.error("[Reactions Error]", e);
    handleError(res, 500, e.message);
    return;
  }
};

export const getPopularWeek: RequestHandler = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const rows = await getPopularThisWeek(limit);
    res.json(rows);
  } catch (e: any) {
    console.error("[Popular Error]", e);
    handleError(res, 500, e.message);
    return;
  }
};
