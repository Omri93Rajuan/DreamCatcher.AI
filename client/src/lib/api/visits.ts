import { api } from "./apiClient";

export const VisitsApi = {
  record: (payload: { sessionId: string; path: string }) =>
    api.post("/visits", payload).then((r) => r.data),
};
