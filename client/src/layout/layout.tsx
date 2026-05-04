import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";
import { VisitsApi } from "@/lib/api/visits";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

const VISIT_SESSION_KEY = "dreamcatcher:visit-session-id";
const VISIT_RECORDED_KEY = "dreamcatcher:visit-recorded";

function getVisitSessionId() {
  const existing = window.sessionStorage.getItem(VISIT_SESSION_KEY);
  if (existing) return existing;

  const generated =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(VISIT_SESSION_KEY, generated);
  return generated;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.logout);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (checkedAuth) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await AuthApi.verify();
        if (!cancelled && res?.user) {
          const id = (res.user as any)._id || (res.user as any).id;
          if (id) {
            const full = await AuthApi.getMe(id);
            if (!cancelled && full?.user) {
              setUser(full.user);
              return;
            }
          }
          setUser(res.user as any);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setCheckedAuth(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkedAuth, setUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(VISIT_RECORDED_KEY)) return;
      const sessionId = getVisitSessionId();
      window.sessionStorage.setItem(VISIT_RECORDED_KEY, "1");
      VisitsApi.record({
        sessionId,
        path: `${window.location.pathname}${window.location.search}`,
      }).catch(() => {
        window.sessionStorage.removeItem(VISIT_RECORDED_KEY);
      });
    } catch {
      /* ignore analytics failures */
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (user && !user.firstName) {
          const res = await AuthApi.getMe((user as any)._id);
          if (res?.user) setUser(res.user);
        }
      } catch (e) {
        console.error("Failed to fetch user details:", e);
      }
    })();
  }, [user, setUser]);

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      /* ignore */
    }
    clearUser();
    navigate("/");
  };

  return (
    <div
      dir={i18n.dir()}
      className="
        min-h-screen flex flex-col text-slate-900 dark:text-white
      "
    >
      <Header user={user} onLogout={handleLogout} />

      <main className="relative flex-1">{children}</main>

      <Footer />
      <CookieConsent />
    </div>
  );
}
