import { api } from "./apiClient";
import type {
  Dream,
  CreateDreamDto,
  InterpretDto,
  InterpretResponse,
  DreamsPage,
  PopularRow,
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

  /**
   * פג'ינציה בצד שרת
   * מחזיר תמיד {dreams,total,page,pages}
   */
  listPaged: async (params: ListParams = {}): Promise<DreamsPage> => {
    const r = await api.get("/dreams", { params });
    return parseListResponse(r.data);
  },

  /**
   * תאימות לאחור: מחזיר רק מערך חלומות
   * (מתוך listPaged)
   */
  list: async (params: ListParams = {}): Promise<Dream[]> => {
    const page = await DreamsApi.listPaged(params);
    return page.dreams;
  },

  /** שליפה לפי מזהה */
  getById: async (id: string): Promise<Dream> => {
    const r = await api.get(`/dreams/${id}`);
    return adapt(r.data);
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
  getPopular: (limit = 6): Promise<PopularRow[]> =>
    api
      .get("/dreams/popular-week", { params: { limit } })
      .then((r) => r.data as PopularRow[]),
};
