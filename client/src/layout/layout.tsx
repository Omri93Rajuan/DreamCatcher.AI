import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import { Sparkles } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
              <Link
                to="/"
                className="text-purple-200 hover:text-white transition-colors font-medium"
              >
                דף הבית
              </Link>
              <Link
                to="/login"
                className="text-purple-200 hover:text-white transition-colors font-medium"
              >
                התחברות
              </Link>
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
