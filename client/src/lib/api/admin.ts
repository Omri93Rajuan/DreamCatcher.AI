import { api } from "./apiClient";
import type { Dream, User, UserRole } from "./types";

export type AdminTrendMetric = {
  current: number;
  previous: number;
  delta: number;
  percentChange: number | null;
};

export type AdminSeriesPoint = {
  day: string;
  users: number;
  dreams: number;
  visits: number;
};

export type AdminTopCategory = {
  category: string;
  count: number;
};

export type AdminOverview = {
  windowDays: number;
  sinceISO: string;
  previousSinceISO: string;
  totals: {
    users: number;
    dreams: number;
    sharedDreams: number;
    privateDreams: number;
    visits: number;
  };
  metrics: {
    newUsers: AdminTrendMetric;
    newDreams: AdminTrendMetric;
    siteVisits: AdminTrendMetric;
  };
  series: AdminSeriesPoint[];
  topCategories: AdminTopCategory[];
};

export type AdminDream = Dream & {
  user?: Pick<User, "_id" | "firstName" | "lastName" | "email" | "role"> | null;
};

export type AdminDreamsPage = {
  dreams: AdminDream[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type AdminUser = User;

export type AdminUsersPage = {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const metric = (value: any): AdminTrendMetric => ({
  current: toNumber(value?.current),
  previous: toNumber(value?.previous),
  delta: toNumber(value?.delta),
  percentChange:
    value?.percentChange === null ? null : toNumber(value?.percentChange),
});

export const AdminApi = {
  getOverview: async (windowDays = 30): Promise<AdminOverview> => {
    const { data } = await api.get("/admin/overview", {
      params: { windowDays },
    });
    const payload = data?.success ? data : data;
    return {
      windowDays: toNumber(payload.windowDays, windowDays),
      sinceISO: String(payload.sinceISO || ""),
      previousSinceISO: String(payload.previousSinceISO || ""),
      totals: {
        users: toNumber(payload.totals?.users),
        dreams: toNumber(payload.totals?.dreams),
        sharedDreams: toNumber(payload.totals?.sharedDreams),
        privateDreams: toNumber(payload.totals?.privateDreams),
        visits: toNumber(payload.totals?.visits),
      },
      metrics: {
        newUsers: metric(payload.metrics?.newUsers),
        newDreams: metric(payload.metrics?.newDreams),
        siteVisits: metric(payload.metrics?.siteVisits),
      },
      series: Array.isArray(payload.series)
        ? payload.series.map((row: any) => ({
            day: String(row.day || ""),
            users: toNumber(row.users),
            dreams: toNumber(row.dreams),
            visits: toNumber(row.visits),
          }))
        : [],
      topCategories: Array.isArray(payload.topCategories)
        ? payload.topCategories.map((row: any) => ({
            category: String(row.category || ""),
            count: toNumber(row.count),
          }))
        : [],
    };
  },

  listDreams: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    isShared?: boolean;
  }): Promise<AdminDreamsPage> => {
    const { data } = await api.get("/admin/dreams", { params });
    const payload = data?.success ? data : data;
    return {
      dreams: Array.isArray(payload.dreams) ? payload.dreams : [],
      total: toNumber(payload.total),
      page: toNumber(payload.page, 1),
      pages: toNumber(payload.pages, 1),
      limit: toNumber(payload.limit, params.limit ?? 20),
    };
  },

  deleteDream: async (id: string) => {
    const { data } = await api.delete(`/admin/dreams/${id}`);
    return data;
  },

  listUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
  }): Promise<AdminUsersPage> => {
    const { data } = await api.get("/admin/users", { params });
    const payload = data?.success ? data : data;
    return {
      users: Array.isArray(payload.users) ? payload.users : [],
      total: toNumber(payload.total),
      page: toNumber(payload.page, 1),
      pages: toNumber(payload.pages, 1),
      limit: toNumber(payload.limit, params.limit ?? 20),
    };
  },

  updateUserRole: async (id: string, role: UserRole): Promise<AdminUser> => {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return (data?.user ?? data) as AdminUser;
  },
};
