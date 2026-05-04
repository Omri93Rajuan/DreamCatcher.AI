import type { RequestHandler } from "express";
import type { AuthRequest } from "../types/auth.interface";
import { recordSiteVisit } from "../services/siteVisit.service";

export const postSiteVisit: RequestHandler = async (
  req: AuthRequest,
  res
): Promise<void> => {
  try {
    const body = req.body as { sessionId?: string; path?: string };
    const rawIp = (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();

    const result = await recordSiteVisit({
      userId: req.user?._id || null,
      sessionId: body.sessionId || null,
      path: body.path || "/",
      ip: rawIp || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    if (!result.ok) {
      res.status(400).json(result);
      return;
    }

    res.status(result.created ? 201 : 200).json(result);
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[SiteVisit] record failed", err?.message || err);
    }
    res.status(500).json({ success: false, error: "visit_record_failed" });
  }
};
