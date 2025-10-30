// lib/api/dreams.ts
import { api } from "./apiClient";
import type {
  Dream,
  CreateDreamDto,
  DreamsPage,
  InterpretDto,
  InterpretResponse,
} from "./types";

/** מאפס רשומת שרת ל-DTO בצד לקוח */
const adapt = (raw: any): Dream => ({
  _id: raw._id ?? raw.id,
  userId: String(raw.userId),
  title: raw.title,
  userInput: raw.userInput,
  aiResponse: raw.aiResponse ?? raw.interpretation, // תאימות לאחור
  isShared: Boolean(raw.isShared),
  sharedAt: raw.sharedAt ?? null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

type ListParams = {
  page?: number;
  limit?: number;
  // תמיכה בשני הסגנונות:
  sortBy?: string;
  order?: "asc" | "desc";
  sort?: string; // למשל "-createdAt"
  search?: string;
  userId?: string;
  ownerId?: string;
  viewerId?: string;
  isShared?: boolean;
};

function toPosInt(v: unknown, fallback: number) {
  const n =
    typeof v === "string" ? parseInt(v, 10) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** עוזר להפוך 401/403 לשגיאה עם code=AUTH_REQUIRED */
function asAuthError(err: any) {
  if ([401, 403].includes(err?.response?.status)) {
    const e = new Error("AUTH_REQUIRED");
    (e as any).code = "AUTH_REQUIRED";
    return e;
  }
  return err;
}

/** נרמול פרמטרי המיון: תומך או ב-sortBy/order או ב-sort בסגנון -field */
function normalizeSort(params: ListParams) {
  const out: Record<string, string> = {};
  if (params.sortBy) out.sortBy = params.sortBy;
  if (params.order) out.order = params.order;

  if (params.sort && !params.sortBy && !params.order) {
    const s = String(params.sort).trim();
    if (s.startsWith("-")) {
      out.sortBy = s.slice(1);
      out.order = "desc";
    } else {
      out.sortBy = s;
      out.order = "asc";
    }
  }
  return out;
}

/** תומך בכל הצורות הנפוצות של המענה מהשרת */
function parseListResponse(data: any): DreamsPage {
  // מבנה מומלץ/נפוץ: { success?, dreams, total, page, pages, limit?, hasNext?, hasPrev? }
  const payload = data?.success === true ? data : data;

  if (payload && Array.isArray(payload.dreams)) {
    return {
      dreams: payload.dreams.map(adapt),
      total: toPosInt(payload.total, payload.dreams.length),
      page: toPosInt(payload.page, 1),
      pages: toPosInt(payload.pages, 1),
      limit: toPosInt(payload.limit, undefined as any), // יישאר undefined אם אין
      hasNext:
        typeof payload.hasNext === "boolean" ? payload.hasNext : undefined,
      hasPrev:
        typeof payload.hasPrev === "boolean" ? payload.hasPrev : undefined,
    };
  }

  // נפילות תאימות ישנות:
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

export type DreamsListResult = {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  dreams: Dream[];
};

export const DreamsApi = {
  /**
   * 🔹 פירוש + שמירה מיידית
   */
  interpret: async (payload: InterpretDto): Promise<InterpretResponse> => {
    const body = {
      text:
        payload.text ??
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
    const aiResponse =
      d.aiResponse ?? d.interpretation ?? dream.aiResponse ?? null;

    return { dream, title, aiResponse };
  },

  /** יצירת חלום חדש (אם תשלח aiResponse – השרת ישמור אותו כפי שהוא) */
  create: async (payload: CreateDreamDto): Promise<Dream> => {
    const r = await api.post("/dreams", payload);
    return adapt(r.data?.dream ?? r.data);
  },

  /** פג'ינציה בצד שרת – מחזיר בדיוק את מה שהשרת חושב על pages/total */
  listPaged: async (params: ListParams = {}): Promise<DreamsPage> => {
    const { page, limit, search, userId, ownerId, viewerId } = params;
    const { sortBy, order } = normalizeSort(params);

    const r = await api.get("/dreams", {
      params: {
        page: toPosInt(page, 1),
        limit: toPosInt(limit, 10),
        search: search || undefined,
        sortBy: sortBy || undefined,
        order: order || undefined,
        userId: userId || undefined,
        ownerId: ownerId || undefined,
        viewerId: viewerId || undefined,
      },
    });

    return parseListResponse(r.data);
  },

  /** תאימות לאחור: מחזיר רק מערך חלומות */
  list: async (params: ListParams = {}): Promise<Dream[]> => {
    const page = await DreamsApi.listPaged(params);
    return page.dreams;
  },

  /** שליפה לפי מזהה */
  getById: async (id: string): Promise<Dream> => {
    const r = await api.get(`/dreams/${id}`);
    const raw = r.data?.dream ?? r.data;
    return adapt(raw);
  },

  /** עדכון */
  update: async (
    id: string,
    payload: Partial<CreateDreamDto>
  ): Promise<Dream> => {
    const r = await api.put(`/dreams/${id}`, payload);
    return adapt(r.data?.dream ?? r.data);
  },

  /** מחיקה */
  remove: async (id: string) => {
    const r = await api.delete(`/dreams/${id}`);
    return r.data;
  },

  /** פופולריים */
  getPopular: async (window: 7 | 30 | 365 = 7) => {
    const { data } = await api.get("/activity/popular", {
      params: { windowDays: window, limit: 3, series: 1 },
    });
    return Array.isArray(data) ? data : [];
  },

  /** רישום פעילות (כולל צפייה) – לא מפיל את ה־UI במקרה כשל */
  recordActivity: async (
    dreamId: string,
    type: "view" | "like" | "dislike"
  ): Promise<void> => {
    try {
      await api.post(`/activity/${dreamId}`, { type });
    } catch {
      /* no-op */
    }
  },

  /** סיכומי תגובות וצפיות */
  getReactions: async (dreamId: string) => {
    try {
      const { data } = await api.get(`/activity/${dreamId}/reactions`);
      return {
        likes: Number(data?.likes ?? 0),
        dislikes: Number(data?.dislikes ?? 0),
        viewsTotal: Number(data?.viewsTotal ?? 0),
        myReaction: (data?.myReaction ?? null) as "like" | "dislike" | null,
      };
    } catch (err: any) {
      throw asAuthError(err);
    }
  },

  /** לייק/דיסלייק עם טיפול בלא-מחובר */
  react: async (dreamId: string, type: "like" | "dislike") => {
    try {
      const { data } = await api.post(`/activity/${dreamId}`, { type });
      return data;
    } catch (err: any) {
      throw asAuthError(err);
    }
  },

  /** רשימת חלומות של משתמש (תאימות ישנה). משתמש בפועל ב-listPaged */
  async listByUser(
    userId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<DreamsListResult> {
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

  /** עדכון דגל שיתוף */
  setShare: async (id: string, isShared: boolean) => {
    const r = await api.put<{ success: true; dream: Dream }>(`/dreams/${id}`, {
      isShared,
    });
    return adapt(r.data.dream);
  },
};
