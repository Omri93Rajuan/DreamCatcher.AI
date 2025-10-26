import { api } from "./apiClient";
import type { LoginDto, User } from "./types";

export const AuthApi = {
  login: (data: LoginDto) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  refresh: () => api.post("/auth/refresh-token").then((r) => r.data),
  verify: () =>
    api
      .get("/auth/verify-token")
      .then((r) => r.data as { valid: boolean; user?: User }),
  getMe: (id: string) =>
    api
      .get(`/auth/me/${id}`)
      .then((r) => r.data as { user?: User })
      .catch(() => null),
};
