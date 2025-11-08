import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
declare module "axios" {
    export interface AxiosRequestConfig<D = any> {
        skipRefresh?: boolean;
        _retry?: boolean;
    }
    export interface InternalAxiosRequestConfig<D = any> {
        skipRefresh?: boolean;
        _retry?: boolean;
    }
}
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});
let isRefreshing = false;
let waiting: Array<() => void> = [];
const isAuthPath = (url = "") => /\/auth\/(login|register|refresh-token|verify-token|verify)\b/.test(url);
api.interceptors.response.use((res) => res, async (error: AxiosError) => {
    type RetriableConfig = InternalAxiosRequestConfig & {
        skipRefresh?: boolean;
        _retry?: boolean;
    };
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    if (status !== 401)
        return Promise.reject(error);
    if (!original)
        return Promise.reject(error);
    if (original.skipRefresh || original._retry || isAuthPath(original.url)) {
        return Promise.reject(error);
    }
    original._retry = true;
    try {
        if (isRefreshing) {
            await new Promise<void>((resolve) => waiting.push(resolve));
            return api(original);
        }
        isRefreshing = true;
        await api.post("/auth/refresh-token", { skipRefresh: true });
        waiting.forEach((r) => r());
        waiting = [];
        return api(original);
    }
    catch (e) {
        waiting = [];
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
    }
    finally {
        isRefreshing = false;
    }
});
