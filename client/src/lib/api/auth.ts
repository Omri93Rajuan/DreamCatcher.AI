import { api } from "./apiClient";
import type { LoginDto, User } from "./types";

export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const AuthApi = {
  login: (data: LoginDto) =>
    api
      .post("/auth/login", data, { withCredentials: true })
      .then((r) => r.data),
  logout: () =>
    api
      .post("/auth/logout", null, { withCredentials: true })
      .then((r) => r.data),
  refresh: () =>
    api
      .post("/auth/refresh-token", null, { withCredentials: true })
      .then((r) => r.data),
  verify: () =>
    api
      .get("/auth/verify-token", { withCredentials: true })
      .then((r) => r.data as { valid: boolean; user?: User }),
  getMe: (id: string) =>
    api
      .get(`/auth/me/${id}`, { withCredentials: true })
      .then((r) => r.data as { user?: User })
      .catch(() => null),
  register: (data: RegisterDto) =>
    api
      .post("/auth/register", data, { withCredentials: true })
      .then((r) => r.data),
};
