import crypto from "crypto";
import { Types } from "mongoose";
import { Dream } from "../models/dream";
import { DreamActivity } from "../models/dreamActivity";

export type ActivityType = "view" | "like" | "dislike";

const dayBucket = (d = new Date()) => d.toISOString().slice(0, 10);
const hashIp = (ip?: string | null) =>
  ip ? crypto.createHash("sha256").update(ip).digest("hex") : null;

type RecordActivityArgs = {
  dreamId: string;
  userId?: string | null;
  ip?: string | null;
  type: ActivityType;
};

/**
 * רישום פעילות על חלום:
 * - view: נספר פעם ביום פר משתמש (או ipHash לאנונימי).
 * - like/dislike: Toggle מלא למשתמש מחובר (required userId).
 *
 * הערה: אם במסמך Dream קיימים קאונטרים (viewsTotal / likesCount / dislikesCount)
 * השירות יעדכן אותם. אם לא — השאילתות האגרגטיביות יחזירו ספירה נכונה בכל מקרה.
 */
export async function recordActivity({
  dreamId,
  userId,
  ip,
  type,
}: RecordActivityArgs) {
  if (!dreamId)
    return { ok: false as const, reason: "missing_dreamId" as const };
  if (!["view", "like", "dislike"].includes(type)) {
    return { ok: false as const, reason: "invalid_type" as const };
  }

  const dream = await Dream.findById(dreamId).lean();
  if (!dream) return { ok: false as const, reason: "not_found" as const };

  const viewerId = userId || null;
  const isOwner = viewerId && String(dream.userId) === String(viewerId);

  // אם החלום פרטי – רק הבעלים רשאי לראות/לפעול
  if (!dream.isShared && !isOwner) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  const today = dayBucket();

  // צפייה יומית
  if (type === "view") {
    const ipHash = viewerId ? null : hashIp(ip);

    const res = await DreamActivity.updateOne(
      {
        dreamId: new Types.ObjectId(dreamId),
        userId: viewerId ? new Types.ObjectId(viewerId) : null,
        ipHash,
        type: "view",
        dayBucket: today,
      },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const isNew = (res as any).upsertedCount === 1;

    // עדכון קאונטר על Dream אם קיים (אופציונלי)
    if (isNew) {
      try {
        await Dream.updateOne({ _id: dreamId }, { $inc: { viewsTotal: 1 } });
      } catch {
        /* אם אין שדה כזה בסכימה — מתעלמים בשקט */
      }
    }

    return { ok: true as const, activity: "view" as const, new: isNew };
  }

  // לייק/דיסלייק — נדרש userId (לא אנונימי)
  if (!viewerId) {
    return { ok: false as const, reason: "auth_required" as const };
  }

  const uid = new Types.ObjectId(viewerId);
  const did = new Types.ObjectId(dreamId);

  const existing = await DreamActivity.findOne({
    dreamId: did,
    userId: uid,
    type: { $in: ["like", "dislike"] },
  }).lean();

  // אין תגובה קודמת → יצירה + inc
  if (!existing) {
    await DreamActivity.create({
      dreamId: did,
      userId: uid,
      ipHash: null,
      type,
      dayBucket: today,
      createdAt: new Date(),
    });

    try {
      await Dream.updateOne(
        { _id: dreamId },
        type === "like"
          ? { $inc: { likesCount: 1 } }
          : { $inc: { dislikesCount: 1 } }
      );
    } catch {
      /* שדה לא קיים — דלג */
    }

    return { ok: true as const, activity: type, action: "created" as const };
  }

  // קיימת זהה → ביטול (toggle off) + dec
  if (existing.type === type) {
    await DreamActivity.deleteOne({ _id: existing._id });

    try {
      await Dream.updateOne(
        { _id: dreamId },
        type === "like"
          ? { $inc: { likesCount: -1 } }
          : { $inc: { dislikesCount: -1 } }
      );
    } catch {
      /* דלג */
    }

    return { ok: true as const, activity: type, action: "removed" as const };
  }

  // קיימת הפוכה → החלפה (switch): עדכון + inc/dec
  await DreamActivity.updateOne(
    { _id: existing._id },
    { $set: { type, dayBucket: today, createdAt: new Date() } }
  );

  try {
    await Dream.updateOne(
      { _id: dreamId },
      type === "like"
        ? { $inc: { likesCount: 1, dislikesCount: -1 } }
        : { $inc: { likesCount: -1, dislikesCount: 1 } }
    );
  } catch {
    /* דלג */
  }

  return { ok: true as const, activity: type, action: "switched" as const };
}

/** החזרת מונים + התגובה של המשתמש */
export async function getReactions(dreamId: string, userId?: string | null) {
  const did = new Types.ObjectId(dreamId);

  // קאונטרים ע״י אגרגציה (אמין גם אם אין קאונטרים על Dream)
  const agg = await DreamActivity.aggregate([
    { $match: { dreamId: did, type: { $in: ["like", "dislike"] } } },
    { $group: { _id: "$type", c: { $sum: 1 } } },
  ]);

  const counts = { likes: 0, dislikes: 0 };
  for (const r of agg) {
    if (r._id === "like") counts.likes = r.c;
    if (r._id === "dislike") counts.dislikes = r.c;
  }

  let myReaction: "like" | "dislike" | null = null;
  if (userId) {
    const r = await DreamActivity.findOne({
      dreamId: did,
      userId: new Types.ObjectId(userId),
      type: { $in: ["like", "dislike"] },
    })
      .select("type")
      .lean();
    myReaction = (r?.type as any) ?? null;
  }

  return { likes: counts.likes, dislikes: counts.dislikes, myReaction };
}

/** פופולרי השבוע לפי צפיות (אפשר להרחיב משקל עם לייקים) */
export async function getPopularThisWeek(limit = 5) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await DreamActivity.aggregate([
    { $match: { type: "view", createdAt: { $gte: since } } },
    { $group: { _id: "$dreamId", views7d: { $sum: 1 } } },
    { $sort: { views7d: -1 } },
    { $limit: limit },
  ]);

  // הצמדת פרטי חלום בסיסיים
  const ids = rows.map((r) => r._id);
  const dreams = await Dream.find({ _id: { $in: ids } })
    .select("_id title isShared userId createdAt")
    .lean();

  const map = new Map(dreams.map((d) => [String(d._id), d]));
  return rows
    .map((r) => {
      const d = map.get(String(r._id));
      if (!d) return null;
      return {
        dreamId: String(d._id),
        title: d.title,
        isShared: !!d.isShared,
        views7d: r.views7d,
      };
    })
    .filter(Boolean) as Array<{
    dreamId: string;
    title: string;
    isShared: boolean;
    views7d: number;
  }>;
}
