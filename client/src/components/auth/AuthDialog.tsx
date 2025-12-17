import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";

type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const { t, i18n } = useTranslation();
  const { setUser } = useAuthStore();
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      _id: "1",
      firstName,
      lastName,
      email,
      role: "user",
      subscription: "free",
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div
        className="bg-gradient-to-b from-[#1c112b] to-[#0f0916] border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6"
        dir={i18n.dir()}
      >
        <h2 className="text-white text-2xl font-bold mb-1">
          🌙 {t("auth.dialog.title")} —{" "}
          {isSignup ? t("layout.nav.register") : t("layout.nav.login")}
        </h2>
        <p className="text-white/70 mb-4 text-sm">{t("auth.dialog.subtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={t("signup.firstName")}
                className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder={t("signup.lastName")}
                className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}

          <input
            type="email"
            placeholder={t("auth.loginForm.email")}
            className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder={t("auth.loginForm.password")}
            className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold"
          >
            {isSignup ? t("auth.dialog.ctaSignup") : t("auth.dialog.ctaLogin")}
          </button>
        </form>

        <div className="text-center text-sm mt-4 text-white/70">
          {isSignup ? (
            <>
              {t("auth.dialog.haveAccount")}{" "}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-purple-300 hover:text-purple-400"
              >
                {t("auth.dialog.switchLogin")}
              </button>
            </>
          ) : (
            <>
              {t("auth.dialog.noAccount")}{" "}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="text-purple-300 hover:text-purple-400"
              >
                {t("auth.dialog.switchSignup")}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
          aria-label={t("common.close")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
