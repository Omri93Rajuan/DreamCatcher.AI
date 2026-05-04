import { api } from "./apiClient";
import type { Dream, CreateDreamDto, DreamsPage, InterpretDto, InterpretResponse, GlobalDreamStats, SmartJournalInsights, } from "./types";
const asStringArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value))
        return undefined;
    const arr = value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);
    return arr.length ? arr : undefined;
};
const asKeySymbols = (value: unknown): Dream["keySymbols"] => {
    if (!Array.isArray(value))
        return undefined;
    const arr = value
        .map((item) => {
        if (typeof item === "string") {
            const symbol = item.trim();
            return symbol ? { symbol, meaning: "" } : null;
        }
        if (!item || typeof item !== "object")
            return null;
        const raw = item as Record<string, unknown>;
        const symbol = String(raw.symbol ?? raw.name ?? "").trim();
        const meaning = String(raw.meaning ?? raw.description ?? "").trim();
        return symbol ? { symbol, meaning } : null;
    })
        .filter(Boolean) as NonNullable<Dream["keySymbols"]>;
    return arr.length ? arr : undefined;
};
const adapt = (raw: any): Dream => ({
    _id: raw?._id ?? raw?.id,
    userId: String(raw?.userId ?? ""),
    title: raw?.title ?? "",
    userInput: raw?.userInput ?? raw?.text ?? "",
    aiResponse: raw?.aiResponse ?? raw?.interpretation ?? "",
    insights: asStringArray(raw?.insights),
    keySymbols: asKeySymbols(raw?.keySymbols ?? raw?.symbols),
    emotions: asStringArray(raw?.emotions),
    isShared: Boolean(raw?.isShared),
    sharedAt: raw?.sharedAt ?? null,
    categories: Array.isArray(raw?.categories) ? raw.categories : undefined,
    categoryScores: raw?.categoryScores && typeof raw.categoryScores === "object"
        ? raw.categoryScores
        : undefined,
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt ?? "",
});
type ListParams = {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    sort?: string;
    search?: string;
    userId?: string;
    ownerId?: string;
    viewerId?: string;
    isShared?: boolean;
    category?: string;
    categories?: string[];
};
function toPosInt(v: unknown, fallback: number) {
    const n = typeof v === "string" ? parseInt(v, 10) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
function asAuthError(err: any) {
    if ([401, 403].includes(err?.response?.status)) {
        const e = new Error("AUTH_REQUIRED");
        (e as any).code = "AUTH_REQUIRED";
        return e;
    }
    return err;
}
function normalizeSort(params: ListParams) {
    const out: Record<string, string> = {};
    if (params.sortBy)
        out.sortBy = params.sortBy;
    if (params.order)
        out.order = params.order;
    if (params.sort && !params.sortBy && !params.order) {
        const s = String(params.sort).trim();
        if (s.startsWith("-")) {
            out.sortBy = s.slice(1);
            out.order = "desc";
        }
        else {
            out.sortBy = s;
            out.order = "asc";
        }
    }
    return out;
}
function parseListResponse(data: any): DreamsPage {
    const payload = data?.success === true ? data : data;
    if (payload && Array.isArray(payload.dreams)) {
        return {
            dreams: payload.dreams.map(adapt),
            total: toPosInt(payload.total, payload.dreams.length),
            page: toPosInt(payload.page, 1),
            pages: toPosInt(payload.pages, 1),
            limit: toPosInt(payload.limit, undefined as any),
            hasNext: typeof payload.hasNext === "boolean" ? payload.hasNext : undefined,
            hasPrev: typeof payload.hasPrev === "boolean" ? payload.hasPrev : undefined,
        };
    }
    if (payload && Array.isArray(payload.data)) {
        const arr = payload.data.map(adapt);
        return { dreams: arr, total: arr.length, page: 1, pages: 1 };
    }
    if (Array.isArray(payload)) {
        const arr = payload.map(adapt);
        return { dreams: arr, total: arr.length, page: 1, pages: 1 };
    }
    return { dreams: [], total: 0, page: 1, pages: 1 };
}
function buildParamsSerializer(extraCats?: string[]) {
    return (p: Record<string, any>) => {
        const usp = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => {
            if (v === undefined || v === null)
                return;
            usp.set(k, String(v));
        });
        if (Array.isArray(extraCats) && extraCats.length) {
            for (const c of extraCats) {
                if (c)
                    usp.append("categories", c);
            }
        }
        return usp.toString();
    };
}
export type DreamsListResult = {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    dreams: Dream[];
};
export const DreamsApi = {
    interpret: async (payload: InterpretDto): Promise<InterpretResponse> => {
        const body = {
            text: payload.text ??
                (payload as any).userInput ??
                (payload as any).prompt ??
                (payload as any).dream_text,
            titleOverride: payload.titleOverride,
            isShared: payload.isShared ?? false,
            model: payload.model,
        };
        const r = await api.post("/dreams/interpret", body);
        const d = r.data || {};
        const dreamRaw = d.dream ?? d.data?.dream ?? d;
        const dream = adapt(dreamRaw);
        const title = d.title ?? dream.title ?? body.titleOverride ?? "";
        const aiResponse = d.aiResponse ?? d.interpretation ?? dream.aiResponse ?? null;
        return { dream, title, aiResponse } as InterpretResponse;
    },
    create: async (payload: CreateDreamDto): Promise<Dream> => {
        const r = await api.post("/dreams", payload);
        return adapt(r.data?.dream ?? r.data);
    },
    listPaged: async (params: ListParams = {}): Promise<DreamsPage> => {
        const { page, limit, search, userId, ownerId, viewerId, category, categories, isShared, } = params;
        const { sortBy, order } = normalizeSort(params);
        const catSet = new Set<string>();
        if (category)
            catSet.add(String(category).trim());
        if (Array.isArray(categories)) {
            for (const c of categories) {
                if (c)
                    catSet.add(String(c).trim());
            }
        }
        const catList = Array.from(catSet);
        const baseParams: Record<string, any> = {
            page: toPosInt(page, 1),
            limit: toPosInt(limit, 10),
            search: search || undefined,
            sortBy: sortBy || undefined,
            order: order || undefined,
            userId: userId || undefined,
            ownerId: ownerId || undefined,
            viewerId: viewerId || undefined,
            isShared: typeof isShared === "boolean" ? isShared : undefined,
        };
        const r = await api.get("/dreams", {
            params: baseParams,
            paramsSerializer: buildParamsSerializer(catList),
        });
        return parseListResponse(r.data);
    },
    list: async (params: ListParams = {}): Promise<Dream[]> => {
        const page = await DreamsApi.listPaged(params);
        return page.dreams;
    },
    getById: async (id: string): Promise<Dream> => {
        const r = await api.get(`/dreams/${id}`);
        const raw = r.data?.dream ?? r.data;
        return adapt(raw);
    },
    update: async (id: string, payload: Partial<CreateDreamDto>): Promise<Dream> => {
        const r = await api.put(`/dreams/${id}`, payload);
        return adapt(r.data?.dream ?? r.data);
    },
    remove: async (id: string) => {
        const r = await api.delete(`/dreams/${id}`);
        return r.data;
    },
    getPopular: async (window: 7 | 30 | 365 = 7) => {
        const { data } = await api.get("/activity/popular", {
            params: { windowDays: window, limit: 3, series: 1 },
        });
        return Array.isArray(data) ? data : [];
    },
    recordActivity: async (dreamId: string, type: "view" | "like" | "dislike"): Promise<void> => {
        try {
            await api.post(`/activity/${dreamId}`, { type });
        }
        catch {
        }
    },
    getReactions: async (dreamId: string) => {
        try {
            const { data } = await api.get(`/activity/${dreamId}/reactions`);
            return {
                likes: Number(data?.likes ?? 0),
                dislikes: Number(data?.dislikes ?? 0),
                viewsTotal: Number(data?.viewsTotal ?? 0),
                myReaction: (data?.myReaction ?? null) as "like" | "dislike" | null,
            };
        }
        catch (err: any) {
            throw asAuthError(err);
        }
    },
    react: async (dreamId: string, type: "like" | "dislike") => {
        try {
            const { data } = await api.post(`/activity/${dreamId}`, { type });
            return data;
        }
        catch (err: any) {
            throw asAuthError(err);
        }
    },
    async listByUser(userId: string, params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<DreamsListResult> {
        const pageResp = await DreamsApi.listPaged({
            userId,
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            search: params?.search || undefined,
            sortBy: "createdAt",
            order: "desc",
        });
        return {
            success: true,
            total: pageResp.total,
            page: pageResp.page,
            limit: pageResp.limit ?? toPosInt(params?.limit, 20),
            dreams: pageResp.dreams,
        };
    },
    setShare: async (id: string, isShared: boolean) => {
        const r = await api.put<{
            success: true;
            dream: Dream;
        }>(`/dreams/${id}`, {
            isShared,
        });
        return adapt(r.data.dream);
    },
    getGlobalStats: async (windowDays: number = 7): Promise<GlobalDreamStats> => {
        const { data } = await api.get("/dreams/stats", { params: { windowDays } });
        const payload = data?.success ? data : data;
        return {
            totalAll: Number(payload.totalAll ?? 0),
            totalPublic: Number(payload.totalPublic ?? 0),
            newSince: Number(payload.newSince ?? 0),
            publishedSince: Number(payload.publishedSince ?? 0),
            uniqueUsers: Number(payload.uniqueUsers ?? 0),
            windowDays: Number(payload.windowDays ?? 7),
            sinceISO: payload.sinceISO,
        };
    },
    getSmartJournalInsights: async (windowDays: number = 30): Promise<SmartJournalInsights> => {
        const { data } = await api.get("/dreams/journal/insights", { params: { windowDays } });
        const payload = data?.success ? data : data;
        return {
            windowDays: Number(payload.windowDays ?? windowDays),
            sinceISO: payload.sinceISO,
            previousSinceISO: payload.previousSinceISO,
            totalDreams: Number(payload.totalDreams ?? 0),
            recentDreams: Number(payload.recentDreams ?? 0),
            previousDreams: Number(payload.previousDreams ?? 0),
            activeDays: Number(payload.activeDays ?? 0),
            latestDreamAt: payload.latestDreamAt ?? null,
            latestStreakDays: Number(payload.latestStreakDays ?? 0),
            longestGapDays: Number(payload.longestGapDays ?? 0),
            topCategories: Array.isArray(payload.topCategories) ? payload.topCategories : [],
            recurringCategories: Array.isArray(payload.recurringCategories) ? payload.recurringCategories : [],
            risingCategories: Array.isArray(payload.risingCategories) ? payload.risingCategories : [],
            weeklyActivity: Array.isArray(payload.weeklyActivity) ? payload.weeklyActivity : [],
            suggestedFocusCategory: payload.suggestedFocusCategory ?? null,
            dataQuality: payload.dataQuality ?? "empty",
        };
    },
};
