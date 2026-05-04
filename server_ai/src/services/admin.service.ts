import { Types } from "mongoose";
import { Dream } from "../models/dream";
import { DreamActivity } from "../models/dreamActivity";
import { SiteVisit } from "../models/siteVisit";
import User from "../models/user";
import { PublicUser, UserRole } from "../types/users.interface";

type SortOrder = "asc" | "desc";

const DAY_MS = 24 * 60 * 60 * 1000;

function clampWindowDays(value?: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 30;
  return Math.max(1, Math.min(365, Math.floor(parsed)));
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? null : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function trendMetric(current: number, previous: number) {
  return {
    current,
    previous,
    delta: current - previous,
    percentChange: percentChange(current, previous),
  };
}

function buildSeries(windowDays: number) {
  const now = new Date();
  const start = new Date(now.getTime() - (windowDays - 1) * DAY_MS);
  const days = Array.from({ length: windowDays }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS);
    return dayKey(date);
  });
  return {
    days,
    start,
    rows: days.map((day) => ({ day, users: 0, dreams: 0, visits: 0 })),
  };
}

async function aggregateCreatedByDay(model: any, since: Date) {
  return model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);
}

export async function getAdminOverview(windowDaysInput?: number) {
  const windowDays = clampWindowDays(windowDaysInput);
  const now = new Date();
  const since = new Date(now.getTime() - windowDays * DAY_MS);
  const previousSince = new Date(now.getTime() - windowDays * 2 * DAY_MS);
  const { rows, start } = buildSeries(windowDays);
  const rowMap = new Map(rows.map((row) => [row.day, row]));

  const [
    totalUsers,
    totalDreams,
    sharedDreams,
    visitsTotal,
    currentUsers,
    previousUsers,
    currentDreams,
    previousDreams,
    currentVisits,
    previousVisits,
    userSeries,
    dreamSeries,
    visitSeries,
    topCategories,
  ] = await Promise.all([
    User.countDocuments(),
    Dream.countDocuments(),
    Dream.countDocuments({ isShared: true }),
    SiteVisit.countDocuments(),
    User.countDocuments({ createdAt: { $gte: since } }),
    User.countDocuments({ createdAt: { $gte: previousSince, $lt: since } }),
    Dream.countDocuments({ createdAt: { $gte: since } }),
    Dream.countDocuments({ createdAt: { $gte: previousSince, $lt: since } }),
    SiteVisit.countDocuments({ createdAt: { $gte: since } }),
    SiteVisit.countDocuments({ createdAt: { $gte: previousSince, $lt: since } }),
    aggregateCreatedByDay(User, start),
    aggregateCreatedByDay(Dream, start),
    aggregateCreatedByDay(SiteVisit, start),
    Dream.aggregate([
      { $match: { createdAt: { $gte: since }, categories: { $ne: [] } } },
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]),
  ]);

  for (const item of userSeries as Array<{ _id: string; count: number }>) {
    const row = rowMap.get(item._id);
    if (row) row.users = Number(item.count || 0);
  }

  for (const item of dreamSeries as Array<{ _id: string; count: number }>) {
    const row = rowMap.get(item._id);
    if (row) row.dreams = Number(item.count || 0);
  }

  for (const item of visitSeries as Array<{ _id: string; count: number }>) {
    const row = rowMap.get(item._id);
    if (row) row.visits = Number(item.count || 0);
  }

  return {
    windowDays,
    sinceISO: since.toISOString(),
    previousSinceISO: previousSince.toISOString(),
    totals: {
      users: totalUsers,
      dreams: totalDreams,
      sharedDreams,
      privateDreams: Math.max(0, totalDreams - sharedDreams),
      visits: visitsTotal,
    },
    metrics: {
      newUsers: trendMetric(currentUsers, previousUsers),
      newDreams: trendMetric(currentDreams, previousDreams),
      siteVisits: trendMetric(currentVisits, previousVisits),
    },
    series: rows,
    topCategories,
  };
}

export async function listAdminDreams(query: {
  page?: number;
  limit?: number;
  search?: string;
  isShared?: boolean;
  sortBy?: string;
  order?: SortOrder;
}) {
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const limit = Math.max(1, Math.min(100, Math.floor(Number(query.limit) || 20)));
  const filter: Record<string, any> = {};

  if (typeof query.isShared === "boolean") {
    filter.isShared = query.isShared;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { userInput: { $regex: search, $options: "i" } },
      { aiResponse: { $regex: search, $options: "i" } },
      { insights: { $regex: search, $options: "i" } },
      { emotions: { $regex: search, $options: "i" } },
      { "keySymbols.symbol": { $regex: search, $options: "i" } },
      { "keySymbols.meaning": { $regex: search, $options: "i" } },
    ];
  }

  const sortBy = query.sortBy || "createdAt";
  const sort: Record<string, 1 | -1> = {
    [sortBy]: query.order === "asc" ? 1 : -1,
  };

  const [dreams, total] = await Promise.all([
    Dream.find(filter)
      .populate("userId", "firstName lastName email role")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Dream.countDocuments(filter),
  ]);

  return {
    dreams: dreams.map((dream: any) => {
      const owner =
        dream.userId && typeof dream.userId === "object"
          ? {
              _id: String(dream.userId._id),
              firstName: dream.userId.firstName || "",
              lastName: dream.userId.lastName || "",
              email: dream.userId.email || "",
              role: dream.userId.role || "user",
            }
          : null;

      return {
        ...dream,
        _id: String(dream._id),
        userId: owner?._id || String(dream.userId || ""),
        user: owner,
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
  };
}

export async function deleteAdminDream(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const deleted = await Dream.findByIdAndDelete(id);
  if (!deleted) return null;

  await DreamActivity.deleteMany({ dreamId: new Types.ObjectId(id) });
  return deleted;
}

export async function listAdminUsers(query: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: string;
  order?: SortOrder;
}) {
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const limit = Math.max(1, Math.min(100, Math.floor(Number(query.limit) || 20)));
  const filter: Record<string, any> = {};

  if (query.role) {
    filter.role = query.role;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const sortBy = query.sortBy || "createdAt";
  const sort: Record<string, 1 | -1> = {
    [sortBy]: query.order === "asc" ? 1 : -1,
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -resetPasswordTokenHash")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((user: any) => ({
      ...user,
      _id: String(user._id),
    })) as PublicUser[],
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
  };
}

export async function updateAdminUserRole(id: string, role: UserRole) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const existing = await User.findById(id).select("_id role");
  if (!existing) {
    return null;
  }

  if (existing.role === UserRole.Admin && role !== UserRole.Admin) {
    const adminCount = await User.countDocuments({ role: UserRole.Admin });
    if (adminCount <= 1) {
      const err: any = new Error("Cannot demote the last admin user");
      err.status = 409;
      err.code = "last_admin";
      throw err;
    }
  }

  const updated = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  )
    .select("-password -resetPasswordTokenHash")
    .lean();

  return updated
    ? ({
        ...updated,
        _id: String(updated._id),
      } as PublicUser)
    : null;
}
