// apiClient.ts
import axios, { AxiosError } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipRefresh?: boolean;
    _retry?: boolean; // נשתמש פנימית
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let waiting: Array<() => void> = [];

const isAuthPath = (url = "") =>
  /\/auth\/(login|register|refresh-token|verify-token|verify)\b/.test(url);

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config || {};
    const status = error.response?.status;

    // לא 401? תחזיר שגיאה
    if (status !== 401) return Promise.reject(error);

    // אל תנסה רענון בלוגין/רישום/ווריפיי/רפרש עצמו, או אם ביקשו לדלג, או אם כבר ניסינו
    if (original.skipRefresh || original._retry || isAuthPath(original.url)) {
      return Promise.reject(error);
    }

    // מכאן—401 "אמיתי": ננסה לרענן פעם אחת
    original._retry = true;

    try {
      if (isRefreshing) {
        await new Promise<void>((resolve) => waiting.push(resolve));
        return api(original); // נסה שוב אחרי שהרענון גלובלי יסתיים
      }

      isRefreshing = true;
      // חשוב: לדלג על אינטרספטור ברענון עצמו
      await api.post("/auth/refresh-token", { skipRefresh: true });

      waiting.forEach((r) => r());
      waiting = [];

      // ריצה מחדש של הבקשה המקורית
      return api(original);
    } catch (e) {
      waiting = [];
      // תן לאפליקציה לדעת שנפלנו (לוגאאוט גלובלי וכו'), אבל אל תאכל את השגיאה
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(error); // תחזיר את ה-401 המקורי למעלה
    } finally {
      isRefreshing = false;
    }
  }
);
