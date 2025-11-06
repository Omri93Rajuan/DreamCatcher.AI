import * as React from "react";
import { useAuthLogin } from "@/hooks/useAuthLogin";
type Props = {
    onSuccess?: () => void;
};
export default function LoginForm({ onSuccess }: Props) {
    const { login, submitting, error, setError } = useAuthLogin();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    return (<form dir="rtl" onSubmit={async (e) => {
            e.preventDefault();
            setError?.(null as any);
            const ok = await login(email, password);
            if (ok)
                onSuccess?.();
        }} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-slate-700 dark:text-white/85">
          אימייל
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="
            w-full rounded-xl px-3 py-2 outline-none
            bg-white/80 border border-black/10 text-slate-900 placeholder:text-slate-400
            focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60
            dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:placeholder:text-white/40
          "/>
      </div>

      <div>
        <label className="block text-sm mb-1 text-slate-700 dark:text-white/85">
          סיסמה
        </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="
            w-full rounded-xl px-3 py-2 outline-none
            bg-white/80 border border-black/10 text-slate-900 placeholder:text-slate-400
            focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60
            dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:placeholder:text-white/40
          "/>
      </div>

      {error && (<div className="text-sm text-rose-600 dark:text-rose-300">
          אימייל או סיסמה שגויים.
        </div>)}

      <button type="submit" disabled={submitting} className="
          w-full py-2.5 rounded-xl font-semibold text-white transition
          shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,.35)]
          bg-[linear-gradient(135deg,#8b5cf6_0%,#f59e0b_100%)]
          hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-amber-300/40
          disabled:opacity-60 disabled:cursor-not-allowed
        ">
        כניסה
      </button>
    </form>);
}
