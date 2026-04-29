import type { RequestHandler, Response } from "express";
import * as DreamService from "../services/dream.service";
import type { AuthRequest } from "../types/auth.interface";
import { DREAM_CATEGORIES } from "../types/categories.interface";

type DreamCategory = (typeof DREAM_CATEGORIES)[number];

const getAuth = (req: AuthRequest) => {
  const raw = req.user?._id;
  const clean =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  return { userId: clean, isAdmin: !!req.user?.isAdmin };
};

function classifyInterpretError(err: any) {
  const message = String(err?.message || "Dream interpretation failed");
  const upstreamStatus = Number(err?.status) || undefined;

  if (
    message.includes("OPENROUTER_API_KEY") ||
    message.includes("No models configured")
  ) {
    return {
      status: 503,
      code: "ai_not_configured",
      message: "Dream interpretation is temporarily unavailable.",
      logMessage: message,
      upstreamStatus,
    };
  }

  if (err?.name === "AbortError") {
    return {
      status: 504,
      code: "ai_timeout",
      message: "AI provider timed out. Please try again.",
      logMessage: message,
      upstreamStatus,
    };
  }

  if (message.startsWith("OpenRouter error:")) {
    return {
      status: upstreamStatus === 429 ? 503 : 502,
      code: "ai_provider_error",
      message: "Dream interpretation is temporarily unavailable. Please try again later.",
      logMessage: message,
      upstreamStatus,
    };
  }

  return {
    status: Number(err?.status) || 500,
    code: "interpret_failed",
    message: "Dream interpretation failed. Please try again.",
    logMessage: message,
    upstreamStatus,
  };
}

function sendInterpretError(res: Response, err: any, context: string) {
  const failure = classifyInterpretError(err);
  if (process.env.NODE_ENV !== "test") {
    console.error(`[Dreams] ${context} failed`, {
      code: failure.code,
      status: failure.status,
      upstreamStatus: failure.upstreamStatus,
      message: failure.logMessage,
    });
  }
  res.status(failure.status).json({
    success: false,
    error: failure.code,
    message: failure.message,
    upstreamStatus: failure.upstreamStatus,
  });
}

function sendDreamError(
  res: Response,
  status: number,
  code: string,
  message: string,
  err?: any,
  context?: string
) {
  if (err && process.env.NODE_ENV !== "test") {
    console.error(`[Dreams] ${context || code} failed`, {
      status,
      code,
      message: err?.message || err,
    });
  }
  res.status(status).json({ success: false, error: code, message });
}

const allowedSet = new Set<string>(DREAM_CATEGORIES);

function normalizeCategories(input: unknown): DreamCategory[] {
  if (!input) return [];

  const arr = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(",")
    : [];

  const out: string[] = [];
  for (const v of arr) {
    const s = String(v ?? "").trim();
    if (s && !allowedSet.has(s)) {
      if (process.env.NODE_ENV !== "test") {
      console.warn(`[Dreams] Category "${s}" not in allowed list`, {
        allowed: Array.from(allowedSet),
      });
      }
    }
    if (s && allowedSet.has(s) && !out.includes(s)) out.push(s);
  }
  return out as DreamCategory[];
}

function normalizeCategoryScores(
  input: unknown
): Record<DreamCategory, number> | undefined {
  if (!input || typeof input !== "object") return undefined;
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!allowedSet.has(k)) continue;
    const n = Number(v);
    const clamped = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
    result[k] = clamped;
  }
  return Object.keys(result).length
    ? (result as Record<DreamCategory, number>)
    : undefined;
}

export const getAllDreams: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);
    const qCatsRaw = (req.query.categories ?? req.query.category) as
      | string
      | string[]
      | undefined;
    const safeCategories = normalizeCategories(qCatsRaw);
    const result = await DreamService.getDreams({
      userId: (req.query.userId as string) || undefined,
      search: (req.query.search as string) || undefined,
      sortBy: (req.query.sortBy as string) || undefined,
      order: ((req.query.order as "asc" | "desc") ?? "desc") as "asc" | "desc",
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      viewerId: userId ?? ((req.query.viewerId as string) || undefined),
      categories: safeCategories.length ? safeCategories : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    sendDreamError(res, 400, "dreams_list_failed", "Could not load dreams.", err, "list");
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
  } catch (err: any) {
    sendDreamError(res, 400, "dream_load_failed", "Could not load this dream.", err, "getById");
  }
};

export const createDream: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);
    const {
      userInput,
      aiResponse,
      title,
      isShared,
      model,
      categories,
      categoryScores,
    } = req.body ?? {};

    if (!userId) {
      res.status(401).json({ success: false, error: "auth_required" });
      return;
    }
    if (!userInput?.trim()) {
      res.status(400).json({ success: false, error: "Missing userInput" });
      return;
    }

    const safeCategories = normalizeCategories(categories);
    const safeScores = normalizeCategoryScores(categoryScores);
    const saved = aiResponse
      ? await DreamService.createDreamFromInterpretation(
          userId,
          userInput,
          String(aiResponse),
          title,
          {
            isShared: !!isShared,
            categories: safeCategories,
            categoryScores: safeScores,
          }
        )
      : await DreamService.createDreamWithAI(userId, userInput, title, {
          ...(model ? { modelOverride: model } : {}),
          isShared: !!isShared,
        });
    res.status(201).json({ success: true, dream: saved });
  } catch (err: any) {
    sendInterpretError(res, err, "create");
  }
};

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

    const { getLLMProvider } = await import("../llm");
    const llm = getLLMProvider();
    const {
      title,
      interpretation,
      categories = [],
      categoryScores,
    } = await llm.interpretDream(rawText, {
      ...(model ? { modelOverride: model } : {}),
    });

    const saved = await DreamService.createDreamFromInterpretation(
      userId,
      rawText,
      interpretation,
      (titleOverride && String(titleOverride).trim()) || title,
      {
        isShared: !!isShared,
        categories,
        categoryScores,
      }
    );
    res.status(201).json({ success: true, dream: saved });
  } catch (err: any) {
    sendInterpretError(res, err, "interpret");
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
    const {
      title,
      userInput,
      aiResponse,
      isShared,
      categories,
      categoryScores,
    } = req.body ?? {};

    const patch: any = {};
    if (typeof title === "string") patch.title = title;
    if (typeof userInput === "string") patch.userInput = userInput;
    if (typeof aiResponse === "string") patch.aiResponse = aiResponse;
    if (typeof isShared === "boolean") patch.isShared = isShared;
    if (categories !== undefined) {
      patch.categories = normalizeCategories(categories);
    }
    if (categoryScores !== undefined) {
      patch.categoryScores = normalizeCategoryScores(categoryScores);
    }
    const updated = await DreamService.updateDream(req.params.id, patch);
    res.json({ success: true, dream: updated });
  } catch (err: any) {
    sendDreamError(res, 400, "dream_update_failed", "Could not update this dream.", err, "update");
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
  } catch (err: any) {
    sendDreamError(res, 400, "dream_delete_failed", "Could not delete this dream.", err, "delete");
  }
};

export const getDreamCategories: RequestHandler = async (
  _req,
  res
): Promise<void> => {
  try {
    res.json({ success: true, categories: DREAM_CATEGORIES });
  } catch (err: any) {
    sendDreamError(res, 500, "categories_failed", "Could not load dream categories.", err, "categories");
  }
};

export const getDreamStats: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const windowDays =
      req.query.windowDays !== undefined
        ? Math.max(1, parseInt(String(req.query.windowDays), 10) || 7)
        : 7;
    const stats = await DreamService.getDreamStats({ windowDays });
    res.json({ success: true, ...stats });
  } catch (err: any) {
    sendDreamError(res, 400, "stats_failed", "Could not load dream statistics.", err, "stats");
  }
};
