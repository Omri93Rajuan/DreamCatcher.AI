import { api } from "./apiClient";
import type {
  Dream,
  CreateDreamDto,
  InterpretDto,
  InterpretResponse,
} from "./types";

const adapt = (raw: any): Dream => ({
  id: raw.id || raw._id,
  userId: String(raw.userId),
  title: raw.title,
  userInput: raw.userInput,
  aiResponse: raw.aiResponse ?? raw.interpretation, // תאימות לאחור
  isShared: !!raw.isShared,
  sharedAt: raw.sharedAt ?? null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export const DreamsApi = {
  interpret: (payload: InterpretDto): Promise<InterpretResponse> =>
    api.post("/dreams/interpret", payload).then((r) => {
      const d = r.data || {};
      return {
        title: d.title ?? null,
        aiResponse: d.aiResponse ?? d.interpretation,
      };
    }),
  create: (payload: CreateDreamDto): Promise<Dream> =>
    api.post("/dreams", payload).then((r) => adapt(r.data)),
  list: (params?: { sort?: string; isShared?: boolean }): Promise<Dream[]> =>
    api
      .get("/dreams", { params })
      .then((r) =>
        Array.isArray(r.data)
          ? r.data.map(adapt)
          : (r.data?.data || []).map(adapt)
      ),
  getById: (id: string): Promise<Dream> =>
    api.get(`/dreams/${id}`).then((r) => adapt(r.data)),
  update: (id: string, payload: Partial<CreateDreamDto>): Promise<Dream> =>
    api.put(`/dreams/${id}`, payload).then((r) => adapt(r.data)),
  remove: (id: string) => api.delete(`/dreams/${id}`).then((r) => r.data),
};
