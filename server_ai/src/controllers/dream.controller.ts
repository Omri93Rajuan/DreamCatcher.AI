// src/controllers/dream.controller.ts
import type { RequestHandler } from "express";
import type { AuthRequest } from "../types/auth.interface";
import * as DreamService from "../services/dream.service";

const getAuth = (req: AuthRequest) => {
  const raw = req.user?._id;
  const clean =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  return { userId: clean, isAdmin: !!req.user?.isAdmin };
};

export const getAllDreams: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);
    const result = await DreamService.getDreams({
      userId: req.query.userId as string | undefined,
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      order: (req.query.order as "asc" | "desc") ?? "desc",
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      viewerId: userId ?? (req.query.viewerId as string | undefined),
    });
    res.json({ success: true, ...result });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
};

export const getDreamById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const dream = await DreamService.getDreamById(req.params.id);
    if (!dream) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const { userId, isAdmin } = getAuth(req as AuthRequest);
    const isOwner = userId && String(dream.userId) === String(userId);
    if (!dream.isShared && !isOwner && !isAdmin) {
      res.status(403).json({ success: false, error: "This dream is private" });
      return;
    }
    res.json({ success: true, dream });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
};

export const updateDream: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId, isAdmin } = getAuth(req as AuthRequest);
    const existing = await DreamService.getDreamById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const isOwner = userId && String(existing.userId) === String(userId);
    if (!isOwner && !isAdmin) {
      res
        .status(403)
        .json({ success: false, error: "Only owner or admin can update" });
      return;
    }

    const { title, userInput, aiResponse, isShared } = req.body ?? {};
    const patch: any = {};
    if (typeof title === "string") patch.title = title;
    if (typeof userInput === "string") patch.userInput = userInput;
    if (typeof aiResponse === "string") patch.aiResponse = aiResponse;
    if (typeof isShared === "boolean") patch.isShared = isShared;

    const updated = await DreamService.updateDream(req.params.id, patch);
    res.json({ success: true, dream: updated });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
};

export const deleteDream: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId, isAdmin } = getAuth(req as AuthRequest);
    const existing = await DreamService.getDreamById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const isOwner = userId && String(existing.userId) === String(userId);
    if (!isOwner && !isAdmin) {
      res
        .status(403)
        .json({ success: false, error: "Only owner or admin can delete" });
      return;
    }

    await DreamService.deleteDream(req.params.id);
    res.json({ success: true, message: "Dream deleted successfully" });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
};

/** 🔹 יצירה ישירה: אם נשלח aiResponse – נשמור אותו כפי שהוא, בלי LLM נוסף */
export const createDream: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);
    const { userInput, aiResponse, title, isShared, model } = req.body ?? {};
    if (!userId) {
      res.status(401).json({ success: false, error: "auth_required" });
      return;
    }
    if (!userInput?.trim()) {
      res.status(400).json({ success: false, error: "Missing userInput" });
      return;
    }

    const saved = aiResponse
      ? await DreamService.createDreamFromInterpretation(
          userId,
          userInput,
          String(aiResponse),
          title,
          { isShared: !!isShared }
        )
      : await DreamService.createDreamWithAI(userId, userInput, title, {
          ...(model ? { modelOverride: model } : {}),
          isShared: !!isShared,
        });

    res.status(201).json({ success: true, dream: saved });
    return;
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
    return;
  }
};

/** 🔹 פירוש ושמירה אוטומטית — LLM פעם אחת, שומרים את אותו הפלט בדיוק */
export const interpretDream: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);
    if (!userId) {
      res.status(401).json({ success: false, error: "auth_required" });
      return;
    }

    const {
      text,
      userInput,
      prompt,
      dream_text,
      isShared,
      model,
      titleOverride,
    } = req.body ?? {};
    const rawText: string = (
      text ??
      userInput ??
      prompt ??
      dream_text ??
      ""
    ).trim();
    if (!rawText) {
      res.status(400).json({ success: false, error: "Missing text" });
      return;
    }

    // פירוש פעם אחת
    const { getLLMProvider } = await import("../llm");
    const llm = getLLMProvider();
    const { title, interpretation } = await llm.interpretDream(rawText, {
      ...(model ? { modelOverride: model } : {}),
    });

    // שמירה בדיוק של אותו פירוש
    const saved = await DreamService.createDreamFromInterpretation(
      userId,
      rawText,
      interpretation,
      (titleOverride && String(titleOverride).trim()) || title,
      { isShared: !!isShared } // ברירת מחדל: false
    );

    res.status(201).json({ success: true, dream: saved });
    return;
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
    return;
  }
};
