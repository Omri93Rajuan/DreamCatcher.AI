import { api } from "./apiClient";
import type { User } from "./types";
export type LoginDto = {
    email: string;
    password: string;
};
export type RegisterDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    image?: string;
    termsAgreed: true;
    termsVersion: string;
    termsUserAgent?: string;
    termsLocale?: string;
};
export type GoogleUrlParams = {
    mode: "login" | "signup";
    next?: string;
    redirectTo?: string;
    termsAccepted?: boolean;
    termsVersion?: string | null;
    termsLocale?: string | null;
};
export const AuthApi = {
    login: (data: LoginDto) => api
        .post("/auth/login", data, { withCredentials: true })
        .then((r) => r.data),
    logout: () => api.post("/auth/logout", { withCredentials: true }).then((r) => r.data),
    refresh: () => api
        .post("/auth/refresh-token", null, { withCredentials: true })
        .then((r) => r.data),
    verify: () => api
        .get("/auth/verify", { withCredentials: true })
        .then((r) => r.data as {
        valid: boolean;
        user?: User;
    }),
    getMe: (id: string) => api
        .get(`/auth/user/${id}`, { withCredentials: true })
        .then((r) => r.data as {
        user?: User;
    })
        .catch(() => null),
    register: (data: RegisterDto) => api
        .post("/auth/register", data, { withCredentials: true })
        .then((r) => r.data),
    requestPasswordReset: (email: string) => api.post("/auth/password/request-reset", { email }).then((r) => r.data),
    resetPasswordWithCookie: (newPassword: string) => api
        .post("/auth/password/reset-with-cookie", { newPassword })
        .then((r) => r.data),
    googleUrl: (params: GoogleUrlParams) => api
        .get("/auth/google/url", { params, withCredentials: true })
        .then((r) => r.data as {
        url: string;
    }),
    deleteAccount: (userId: string) => api.delete(`/users/${userId}`),
};
