import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

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
        min-h-screen flex flex-col
        bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100 text-slate-900
        dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 dark:text-white
      "
    >
      <Header user={user} onLogout={handleLogout} />

      <main className="relative flex-1">{children}</main>

      <Footer />
      <CookieConsent />
    </div>
  );
}
