import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false as boolean;
let waiting: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => waiting.push(resolve));
        return api(original);
      }

      try {
        isRefreshing = true;
        await api.post("/auth/refresh-token");
        waiting.forEach((r) => r());
        waiting = [];
        return api(original);
      } catch (e) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
