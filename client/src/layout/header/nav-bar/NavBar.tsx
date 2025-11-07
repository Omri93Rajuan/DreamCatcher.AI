import React from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "../logo/Logo";
import { useAuthStore } from "@/stores/useAuthStore";

const NAV_LINKS = [
    { to: "/", label: "בית" },
    { to: "/articles", label: "מאמרים" },
    { to: "/contact", label: "צור קשר" },
];

export default function NavBar() {
    const { user, logout } = useAuthStore();
    const handleLogout = async () => {
        await logout();
    };
    return (<nav className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" aria-label="DreamCatcher.AI">
          <Logo />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            DreamCatcher.AI
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-semibold">
          {NAV_LINKS.map((item) => (<NavLink key={item.to} to={item.to} className={({ isActive }) => [
                    "transition-colors",
                    isActive
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white",
                ].join(" ")}>
              {item.label}
            </NavLink>))}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (<>
              <Link to="/login" className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
                התחברות
              </Link>
              <Link to="/register" className="rounded-lg bg-gradient-to-l from-amber-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:opacity-90">
                הרשמה
              </Link>
            </>) : (<>
              <span className="text-sm font-medium text-slate-600 dark:text-white/80">
                שלום, {user.firstName || user.email}
              </span>
              <button onClick={handleLogout} className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
                יציאה
              </button>
            </>)}
        </div>
      </div>
    </nav>);
}
