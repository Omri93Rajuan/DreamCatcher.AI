import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.logout);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (user && !user.name) {
          const res = await AuthApi.getMe(user._id);
          if (res?.user) setUser(res.user);
        }
      } catch (e) {
        console.error("Failed to fetch user details:", e);
      }
    };
    fetchUserDetails();
  }, [user, setUser]);

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {}
    clearUser();
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white"
      dir="rtl"
    >
      <header className="sticky top-0 z-50 glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={createPageUrl("HomePage")}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center glow-effect transition-transform group-hover:scale-110">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  פתרון חלומות
                </h1>
                <p className="text-xs text-purple-300">גלה את המשמעות הסמויה</p>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              {user && (
                <span className="text-purple-200">
                  שלום
                  {user.name
                    ? `, ${user.name}`
                    : user.email
                    ? `, ${user.email}`
                    : ""}{" "}
                  👋
                </span>
              )}

              <Link
                to="/"
                className="text-purple-200 hover:text-white transition-colors font-medium"
              >
                דף הבית
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-purple-500/30 hover:bg-white/10 transition-colors"
                >
                  התנתק
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-purple-200 hover:text-white transition-colors font-medium"
                >
                  התחברות
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative">{children}</main>

      <footer className="glass-card border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xl font-bold gradient-text">
              פתרון חלומות
            </span>
          </div>
          <p className="text-purple-300 text-sm">
            פרשנות חלומות מתקדמת באמצעות בינה מלאכותית
          </p>
          <p className="text-purple-400 text-xs mt-2">
            © {new Date().getFullYear()} כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  );
}
