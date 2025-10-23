import { RequestHandler } from "express";
import * as DreamService from "../services/dream.service";

function getAuth(req: any) {
  const userObj = req.user || {};
  const userId = req.userId || userObj.id || userObj._id || null;
  const isAdmin =
    req.isAdmin === true ||
    userObj.isAdmin === true ||
    userObj.role === "admin";
  return { userId, isAdmin };
}

export const createDream: RequestHandler = async (req, res) => {
  try {
    const { userId, userInput, title, model, isShared } = req.body;
    if (!userId || !userInput) {
      res
        .status(400)
        .json({ success: false, error: "Missing userId or userInput" });
      return;
    }

    const dream = await DreamService.createDreamWithAI(
      userId,
      userInput,
      title,
      {
        ...(model ? { modelOverride: model } : {}),
        isShared: typeof isShared === "boolean" ? isShared : false,
      }
    );

    res.status(201).json({ success: true, dream });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const interpretDream: RequestHandler = async (req, res) => {
  try {
    const { userId, text, isShared, model } = req.body;
    if (!userId || !text) {
      res.status(400).json({ success: false, error: "Missing userId or text" });
      return;
    }

    const saved = await DreamService.createDreamWithAI(
      userId,
      text,
      undefined,
      {
        ...(model ? { modelOverride: model } : {}),
        isShared: typeof isShared === "boolean" ? isShared : false,
      }
    );

    res.status(201).json({
      success: true,
      dream: {
        id: saved._id,
        title: saved.title,
        userInput: saved.userInput,
        aiResponse: saved.aiResponse,
        isShared: saved.isShared,
        createdAt: saved.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllDreams: RequestHandler = async (req, res) => {
  try {
    const { userId, search, sortBy, order, page, limit, viewerId } =
      req.query as Record<string, string | undefined>;

    const auth = getAuth(req);
    const currentViewerId = auth.userId || viewerId;

    const result = await DreamService.getDreams({
      userId: userId,
      search: search,
      sortBy: sortBy,
      order: (order === "asc" || order === "desc" ? order : "desc") as
        | "asc"
        | "desc",
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      viewerId: currentViewerId,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getDreamById: RequestHandler = async (req, res) => {
  try {
    const dream = await DreamService.getDreamById(req.params.id);
    if (!dream) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const auth = getAuth(req);
    const viewerId = auth.userId || (req.query.viewerId as string | undefined);
    const isOwner = viewerId && String(dream.userId) === String(viewerId);

    if (!dream.isShared && !isOwner && !auth.isAdmin) {
      res.status(403).json({ success: false, error: "This dream is private" });
      return;
    }

    res.json({ success: true, dream });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateDream: RequestHandler = async (req, res) => {
  try {
    const auth = getAuth(req);

    const existing = await DreamService.getDreamById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const isOwner =
      auth.userId && String(existing.userId) === String(auth.userId);
    if (!isOwner && !auth.isAdmin) {
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
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteDream: RequestHandler = async (req, res) => {
  try {
    const auth = getAuth(req);

    const existing = await DreamService.getDreamById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Dream not found" });
      return;
    }

    const isOwner =
      auth.userId && String(existing.userId) === String(auth.userId);
    if (!isOwner && !auth.isAdmin) {
      res
        .status(403)
        .json({ success: false, error: "Only owner or admin can delete" });
      return;
    }

    await DreamService.deleteDream(req.params.id);
    res.json({ success: true, message: "Dream deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
