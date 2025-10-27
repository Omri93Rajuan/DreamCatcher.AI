import { api } from "./apiClient";
import type {
  Dream,
  CreateDreamDto,
  InterpretDto,
  InterpretResponse,
  DreamsPage,
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

/** תומך בכל הצורות הנפוצות של המענה מהשרת */
function parseListResponse(data: any): DreamsPage {
  // 1) מבנה מומלץ אצלך: { dreams, total, page, pages }
  if (data && Array.isArray(data.dreams)) {
    return {
      dreams: data.dreams.map(adapt),
      total: Number(data.total ?? data.dreams.length),
      page: Number(data.page ?? 1),
      pages: Number(data.pages ?? 1),
    };
  }

  // 2) לעיתים { data: [...] }
  if (data && Array.isArray(data.data)) {
    const arr = data.data.map(adapt);
    return { dreams: arr, total: arr.length, page: 1, pages: 1 };
  }

  // 3) מערך גולמי
  if (Array.isArray(data)) {
    const arr = data.map(adapt);
    return { dreams: arr, total: arr.length, page: 1, pages: 1 };
  }

  // ברירת מחדל בטוחה
  return { dreams: [], total: 0, page: 1, pages: 1 };
}

type ListParams = {
  page?: number;
  limit?: number;
  sort?: string; // למשל "-createdAt"
  search?: string;
  userId?: string; // אופציונלי
  isShared?: boolean;
};

/** עוזר להפוך 401/403 לשגיאה עם code=AUTH_REQUIRED */
function asAuthError(err: any) {
  if ([401, 403].includes(err?.response?.status)) {
    const e = new Error("AUTH_REQUIRED");
    (e as any).code = "AUTH_REQUIRED";
    return e;
  }
  return err;
}

export const DreamsApi = {
  /** בקשת פירוש חלום (LLM) */
  interpret: async (payload: InterpretDto): Promise<InterpretResponse> => {
    const r = await api.post("/dreams/interpret", payload);
    const d = r.data || {};
    return {
      title: d.title ?? null,
      aiResponse: d.aiResponse ?? d.interpretation,
    };
  },

  /** יצירת חלום חדש */
  create: async (payload: CreateDreamDto): Promise<Dream> => {
    const r = await api.post("/dreams", payload);
    return adapt(r.data);
  },

  /** פג'ינציה בצד שרת */
  listPaged: async (params: ListParams = {}): Promise<DreamsPage> => {
    const r = await api.get("/dreams", { params });
    return parseListResponse(r.data);
  },

  /** תאימות לאחור: מחזיר רק מערך חלומות (מתוך listPaged) */
  list: async (params: ListParams = {}): Promise<Dream[]> => {
    const page = await DreamsApi.listPaged(params);
    return page.dreams;
  },

  /** שליפה לפי מזהה */
  getById: async (id: string): Promise<Dream> => {
    const r = await api.get(`/dreams/${id}`);
    const raw = r.data?.dream ?? r.data; // ← תומך בשתי צורות תגובה
    return adapt(raw);
  },

  /** עדכון */
  update: async (
    id: string,
    payload: Partial<CreateDreamDto>
  ): Promise<Dream> => {
    const r = await api.put(`/dreams/${id}`, payload);
    return adapt(r.data);
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
      /* אין צורך לטפל – פעולה "נחמדה שיהיה" בלבד */
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
};
