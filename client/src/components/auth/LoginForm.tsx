import * as React from "react";
import { useAuthLogin } from "@/hooks/useAuthLogin";

type Props = { onSuccess?: () => void };

export default function LoginForm({ onSuccess }: Props) {
  const { login, submitting, error, setError } = useAuthLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await login(email, password);
        if (ok) onSuccess?.();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm text-white/80 mb-1">אימייל</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
          placeholder="name@example.com"
        />
      </div>
      <div>
        <label className="block text-sm text-white/80 mb-1">סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)]"
          placeholder="••••••••"
        />
      </div>
      {error && <div className="text-rose-300 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition disabled:opacity-50"
      >
        כניסה
      </button>
    </form>
  );
}
