import { api, API_TIMEOUTS } from "./apiClient";

export const VisitsApi = {
  record: (payload: { sessionId: string; path: string }) =>
    api
      .post("/visits", payload, {
        skipRefresh: true,
        timeout: API_TIMEOUTS.analytics,
      })
      .then((r) => r.data),
};
