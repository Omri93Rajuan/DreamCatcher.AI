import crypto from "crypto";
import { Types } from "mongoose";
import { Dream } from "../models/dream";
import { DreamActivity } from "../models/dreamActivity";
export type ActivityType = "view" | "like" | "dislike";
const dayBucket = (d = new Date()) => d.toISOString().slice(0, 10);
const hashIp = (ip?: string | null) => ip ? crypto.createHash("sha256").update(ip).digest("hex") : null;
type RecordActivityArgs = {
    dreamId: string;
    userId?: string | null;
    ip?: string | null;
    type: ActivityType;
};
export async function recordActivity({ dreamId, userId, ip, type, }: RecordActivityArgs) {
    if (!dreamId)
        return { ok: false as const, reason: "missing_dreamId" as const };
    if (!["view", "like", "dislike"].includes(type)) {
        return { ok: false as const, reason: "invalid_type" as const };
    }
    const dream = await Dream.findById(dreamId).lean();
    if (!dream)
        return { ok: false as const, reason: "not_found" as const };
    const viewerId = userId || null;
    const isOwner = viewerId && String(dream.userId) === String(viewerId);
    if (!dream.isShared && !isOwner) {
        return { ok: false as const, reason: "forbidden" as const };
    }
    const today = dayBucket();
    if (type === "view") {
        const ipHash = viewerId ? null : hashIp(ip);
        const res = await DreamActivity.updateOne({
            dreamId: new Types.ObjectId(dreamId),
            userId: viewerId ? new Types.ObjectId(viewerId) : null,
            ipHash,
            type: "view",
            dayBucket: today,
        }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        const isNew = (res as any).upsertedCount === 1;
        if (isNew) {
            try {
                await Dream.updateOne({ _id: dreamId }, { $inc: { viewsTotal: 1 } });
            }
            catch {
            }
        }
        return { ok: true as const, activity: "view" as const, new: isNew };
    }
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
            await Dream.updateOne({ _id: dreamId }, type === "like"
                ? { $inc: { likesCount: 1 } }
                : { $inc: { dislikesCount: 1 } });
        }
        catch {
        }
        return { ok: true as const, activity: type, action: "created" as const };
    }
    if (existing.type === type) {
        await DreamActivity.deleteOne({ _id: existing._id });
        try {
            await Dream.updateOne({ _id: dreamId }, type === "like"
                ? { $inc: { likesCount: -1 } }
                : { $inc: { dislikesCount: -1 } });
        }
        catch {
        }
        return { ok: true as const, activity: type, action: "removed" as const };
    }
    await DreamActivity.updateOne({ _id: existing._id }, { $set: { type, dayBucket: today, createdAt: new Date() } });
    try {
        await Dream.updateOne({ _id: dreamId }, type === "like"
            ? { $inc: { likesCount: 1, dislikesCount: -1 } }
            : { $inc: { likesCount: -1, dislikesCount: 1 } });
    }
    catch {
    }
    return { ok: true as const, activity: type, action: "switched" as const };
}
export async function getReactions(dreamId: string, userId?: string | null) {
    const did = new Types.ObjectId(dreamId);
    const agg = await DreamActivity.aggregate([
        { $match: { dreamId: did, type: { $in: ["like", "dislike"] } } },
        { $group: { _id: "$type", c: { $sum: 1 } } },
    ]);
    const counts = { likes: 0, dislikes: 0 };
    for (const r of agg) {
        if (r._id === "like")
            counts.likes = r.c;
        if (r._id === "dislike")
            counts.dislikes = r.c;
    }
    const viewsAgg = await DreamActivity.aggregate([
        { $match: { dreamId: did, type: "view" } },
        { $count: "c" },
    ]);
    const viewsTotal = viewsAgg?.[0]?.c ?? 0;
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
    return {
        likes: counts.likes,
        dislikes: counts.dislikes,
        viewsTotal,
        myReaction,
    };
}
export type PopularRow = {
    rank: number;
    dreamId: string;
    title: string;
    isShared: boolean;
    views: number;
    likes: number;
    score: number;
    percentChange: number | null;
    series?: Array<{
        day: string;
        views: number;
        likes: number;
        score: number;
    }>;
};
export async function getPopular(windowDays = 7, limit = 6, withSeries = false): Promise<PopularRow[]> {
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const useAllTime = windowDays <= 0;
    const since = new Date(now - windowDays * DAY);
    const prevSince = new Date(since.getTime() - windowDays * DAY);
    const matchCurr: any = { type: { $in: ["view", "like"] } };
    if (!useAllTime)
        matchCurr.createdAt = { $gte: since };
    const curr = await DreamActivity.aggregate([
        { $match: matchCurr },
        {
            $group: {
                _id: "$dreamId",
                views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
                likes: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
            },
        },
        {
            $addFields: { score: { $add: ["$views", { $multiply: ["$likes", 3] }] } },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
    ]);
    const ids = curr.map((r) => r._id as Types.ObjectId);
    let prevMap = new Map<string, number>();
    if (!useAllTime) {
        const prevAgg = await DreamActivity.aggregate([
            {
                $match: {
                    type: { $in: ["view", "like"] },
                    dreamId: { $in: ids },
                    createdAt: { $gte: prevSince, $lt: since },
                },
            },
            {
                $group: {
                    _id: "$dreamId",
                    views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
                    likes: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
                },
            },
            {
                $addFields: {
                    score: { $add: ["$views", { $multiply: ["$likes", 3] }] },
                },
            },
        ]);
        prevMap = new Map<string, number>(prevAgg.map((r: any) => [String(r._id), Number(r.score || 0)]));
    }
    let seriesMap: Map<string, Array<{
        day: string;
        views: number;
        likes: number;
        score: number;
    }>> | null = null;
    if (withSeries && !useAllTime) {
        const seriesAgg = await DreamActivity.aggregate([
            {
                $match: {
                    type: { $in: ["view", "like"] },
                    dreamId: { $in: ids },
                    createdAt: { $gte: since },
                },
            },
            {
                $group: {
                    _id: { dreamId: "$dreamId", day: "$dayBucket" },
                    views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
                    likes: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
                },
            },
            {
                $project: {
                    dreamId: "$_id.dreamId",
                    day: "$_id.day",
                    views: 1,
                    likes: 1,
                    score: { $add: ["$views", { $multiply: ["$likes", 3] }] },
                    _id: 0,
                },
            },
            { $sort: { day: 1 } },
        ]);
        seriesMap = new Map();
        for (const p of seriesAgg as any[]) {
            const k = String(p.dreamId);
            if (!seriesMap.has(k))
                seriesMap.set(k, []);
            seriesMap.get(k)!.push({
                day: p.day,
                views: p.views,
                likes: p.likes,
                score: p.score,
            });
        }
    }
    const dreams = await Dream.find({ _id: { $in: ids } })
        .select("_id title isShared")
        .lean();
    const dreamMap = new Map(dreams.map((d) => [String(d._id), d]));
    let rank = 1;
    const rows: PopularRow[] = [];
    for (const r of curr as any[]) {
        const id = String(r._id);
        const d = dreamMap.get(id);
        if (!d || !d.isShared)
            continue;
        const scoreCurr = Number(r.score || 0);
        const prevScore = useAllTime ? 0 : Number(prevMap.get(id) || 0);
        const percentChange = useAllTime || prevScore <= 0
            ? null
            : ((scoreCurr - prevScore) / prevScore) * 100;
        rows.push({
            rank: rank++,
            dreamId: id,
            title: d.title || "",
            isShared: !!d.isShared,
            views: Number(r.views || 0),
            likes: Number(r.likes || 0),
            score: scoreCurr,
            percentChange,
            series: withSeries && !useAllTime ? seriesMap?.get(id) ?? [] : undefined,
        });
    }
    return rows;
}
