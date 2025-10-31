// src/controllers/dream.controller.ts
import type { RequestHandler } from "express";
import type { AuthRequest } from "../types/auth.interface";
import * as DreamService from "../services/dream.service";
import { DREAM_CATEGORIES } from "../types/categories.interface";

type DreamCategory = (typeof DREAM_CATEGORIES)[number];

const getAuth = (req: AuthRequest) => {
  const raw = req.user?._id;
  const clean =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  return { userId: clean, isAdmin: !!req.user?.isAdmin };
};

// ---------- helpers ----------
const allowedSet = new Set<string>(DREAM_CATEGORIES);

function normalizeCategories(input: unknown): DreamCategory[] {
  if (!input) return [];

  // 🔹 תמיכה במערך, string בודד, או string מופרד בפסיקים
  const arr = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(",")
    : [];

  const out: string[] = [];
  for (const v of arr) {
    const s = String(v ?? "").trim();
    // 🔍 DEBUG: הוסף לוג זמני
    if (s && !allowedSet.has(s)) {
      console.warn(
        `⚠️ Category "${s}" not in allowed list:`,
        Array.from(allowedSet)
      );
    }
    if (s && allowedSet.has(s) && !out.includes(s)) out.push(s);
  }

  // 🔍 DEBUG
  console.log("📊 Normalized categories:", out);

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

// ========== Controllers ==========

export const getAllDreams: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req as AuthRequest);

    // 🔹 תמיכה ב-?categories=a&categories=b OR ?categories=a,b OR ?category=...
    const qCatsRaw = (req.query.categories ?? req.query.category) as
      | string
      | string[]
      | undefined;

    // 🔍 DEBUG
    console.log("🔎 Raw categories from query:", qCatsRaw);

    const safeCategories = normalizeCategories(qCatsRaw);

    // 🔹 תיקון: תמיד נשלח את המערך, גם אם הוא ריק
    // אם הוא ריק - הסרוויס ידע לא לסנן
    // אם הוא מלא - הסרוויס יסנן לפי הקטגוריות
    const result = await DreamService.getDreams({
      userId: (req.query.userId as string) || undefined,
      search: (req.query.search as string) || undefined,
      sortBy: (req.query.sortBy as string) || undefined,
      order: ((req.query.order as "asc" | "desc") ?? "desc") as "asc" | "desc",
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      viewerId: userId ?? ((req.query.viewerId as string) || undefined),
      categories: safeCategories.length ? safeCategories : undefined, // ✅ זה בסדר - undefined אם אין סינון
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
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
    res.status(400).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(400).json({ success: false, error: err.message });
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
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getDreamCategories: RequestHandler = async (
  _req,
  res
): Promise<void> => {
  try {
    res.json({ success: true, categories: DREAM_CATEGORIES });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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
    res.status(400).json({ success: false, error: err.message });
  }
};
