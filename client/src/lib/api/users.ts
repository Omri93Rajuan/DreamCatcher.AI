import { api } from "./apiClient";
import type { User, UpdateUserDTO } from "./types";
export const UsersApi = {
    list: () => api.get("/users").then((r) => r.data as User[]),
    getUsersByCall: (page = 1, limit = 10) => api
        .get(`/users/getUsersByCall?page=${page}&limit=${limit}`)
        .then((r) => r.data),
    getById: (id: string) => api.get(`/users/${id}`).then((r) => r.data as User),
    create: (payload: Partial<User>) => api.post("/users", payload).then((r) => r.data as User),
    update: (id: string, payload: UpdateUserDTO) => api.patch(`/users/${id}`, payload).then((r) => r.data as User),
    remove: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};
