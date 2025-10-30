import { api } from "./apiClient";
import type { User } from "./types";

export const UsersApi = {
  list: () => api.get("/users").then((r) => r.data as User[]),
  getUsersByCall: () =>
    api.get("/users/getUsersByCall").then((r) => r.data as User[]),
  getById: (id: string) => api.get(`/users/${id}`).then((r) => r.data as User),
  create: (payload: Partial<User>) =>
    api.post("/users", payload).then((r) => r.data as User),
  update: (id: string, payload: Partial<User>) =>
    api.patch(`/users/${id}`, payload).then((r) => r.data as User),
  remove: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};
