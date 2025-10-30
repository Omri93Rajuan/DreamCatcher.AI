import * as React from "react";
import { useAuthSignup } from "@/hooks/useAuthSignup";
import TermsDialog from "./TermsDialog";

export const TERMS_VERSION = "2025-10-28";

type Props = { onSuccess?: () => void };

export default function SignupForm({ onSuccess }: Props) {
  const { signup, submitting, error, setError } = useAuthSignup();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const [agreed, setAgreed] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);

  React.useEffect(() => {
    if (!avatarFile) return setAvatarPreview(null);
    const u = URL.createObjectURL(avatarFile);
    setAvatarPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [avatarFile]);

  const pwScore = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s += 4;
    if (/\d/.test(pw)) s += 2;
    if (/[A-Z]/.test(pw)) s += 2;
    if (/[^a-zA-Z0-9]/.test(pw)) s += 2;
    return Math.min(10, s);
  };

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!password || password.length < 6) {
            setError("סיסמה חייבת להיות לפחות 6 תווים.");
            return;
          }
          if (!agreed) {
            setError("יש לאשר את תנאי השימוש לפני יצירת חשבון.");
            return;
          }
          const ok = await signup({
            firstName,
            lastName,
            email,
            password,
            termsAgreed: true,
            termsVersion: TERMS_VERSION,
            termsUserAgent:
              typeof navigator !== "undefined"
                ? navigator.userAgent
                : undefined,
            termsLocale:
              typeof navigator !== "undefined" ? navigator.language : undefined,
          });
          if (ok) onSuccess?.();
        }}
        className="space-y-4"
      >
        {/* פרטים אישיים */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">שם פרטי</label>
            <input
              className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="נועה"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">שם משפחה</label>
            <input
              className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="כהן"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">אימייל</label>
          <input
            type="email"
            className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm text-white/80 mb-1">
            <span>סיסמה</span>
            <span className="text-xs text-white/60">
              חוזק: {pwScore(password)}/10
            </span>
          </label>
          <input
            type="password"
            className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="בחר/י סיסמה"
          />
          <input
            type="range"
            min={0}
            max={10}
            readOnly
            value={pwScore(password)}
            className="w-full accent-[var(--primary)] mt-2"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">
            תמונה (אופציונלי)
          </label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 border border-white/20">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-white/60 text-sm">
                  🙂
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/90 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-white/20 file:bg-white/10 file:text-white hover:file:bg-white/20"
            />
          </div>
        </div>

        {/* תנאי שימוש */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={agreed}
              readOnly
              className="accent-[var(--primary)]"
            />
            <span>
              אני מסכים/ה ל{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline text-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                תנאי השימוש
              </button>
              .
            </span>
            {agreed ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                ✓ אושר
              </span>
            ) : (
              <span className="ml-2 text-xs text-white/60">
                יש לאשר בתוך הדיאלוג
              </span>
            )}
          </div>
        </div>

        {error && <div className="text-rose-300 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition disabled:opacity-50"
        >
          יצירת חשבון
        </button>
      </form>

      <TermsDialog
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setAgreed(true)}
      />
    </>
  );
}
