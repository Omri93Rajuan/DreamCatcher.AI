import React, { useMemo, useRef, useState, useEffect } from "react";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import TermsDialog from "./TermsDialog";
export const TERMS_VERSION = "2025-10-28";
const AVATAR_REQUIRED = false;
type Props = {
    onSuccess?: () => void;
};
type Step = "email" | "details" | "avatar" | "terms";
export default function AuthSignup({ onSuccess }: Props) {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState(""), [first, setFirst] = useState(""), [last, setLast] = useState(""), [pass, setPass] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [eErr, setEErr] = useState(""), [fErr, setFErr] = useState(""), [lErr, setLErr] = useState(""), [pErr, setPErr] = useState(""), [aErr, setAErr] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false), [showTerms, setShowTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { setUser } = useAuthStore();
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setPreview(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
    const pwReq = useMemo(() => ({
        len: pass.length >= 8,
        num: /\d/.test(pass),
        up: /[A-Z]/.test(pass),
    }), [pass]);
    const pwScore = (pwReq.len ? 4 : 0) + (pwReq.num ? 3 : 0) + (pwReq.up ? 3 : 0);
    const vEmail = () => setEErr(emailOk ? "" : "אימייל לא תקין.");
    const vDetails = () => {
        setFErr(first.trim() ? "" : "שם פרטי חובה.");
        setLErr(last.trim() ? "" : "שם משפחה חובה.");
        setPErr(!pass
            ? "סיסמה חובה."
            : !pwReq.len
                ? "לפחות 8 תווים."
                : !pwReq.num
                    ? "להוסיף ספרה."
                    : !pwReq.up
                        ? "להוסיף אות גדולה."
                        : "");
    };
    const vAvatar = () => setAErr(AVATAR_REQUIRED && !file ? "נא להעלות תמונה." : "");
    const onFile = (f: File | null) => {
        setAErr("");
        if (!f)
            return;
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type))
            return setAErr("קובץ לא נתמך.");
        if (f.size > 5 * 1024 * 1024)
            return setAErr("עד 5MB.");
        setFile(f);
    };
    const register = async () => {
        setSubmitting(true);
        setErr(null);
        try {
            const img = file
                ? await new Promise<string>((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res(r.result as string);
                    r.onerror = rej;
                    r.readAsDataURL(file);
                })
                : undefined;
            const payload = {
                firstName: first.trim(),
                lastName: last.trim(),
                email: email.trim().toLowerCase(),
                password: pass,
                image: img,
                termsAgreed: true,
                termsVersion: TERMS_VERSION,
            };
            const r = await AuthApi.register(payload);
            const user = r?.user ??
                (await AuthApi.verify())?.user ??
                (await (async () => {
                    await AuthApi.login({ email: payload.email, password: pass });
                    return (await AuthApi.verify())?.user;
                })());
            if (user) {
                setUser(user);
                onSuccess?.();
                return;
            }
            setErr("החשבון נוצר, אך לא אומת.");
        }
        catch (e: any) {
            const s = e?.response?.status, m = e?.response?.data?.message || e?.message || "שגיאה.";
            if (s === 409) {
                setStep("email");
                setEErr("האימייל הזה כבר רשום אצלנו.");
                setErr(null);
            }
            else
                setErr(m);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div dir="rtl" className="w-full max-w-md mx-auto p-6 rounded-2xl glass-card space-y-6 text-slate-900 dark:text-white">
      <div className="text-xs text-slate-500 dark:text-white/70">
        {["email", "details", "avatar", "terms"].indexOf(step) + 1} / 4
      </div>
      {err && (<div className="rounded-xl px-3 py-2 text-sm border bg-rose-500/10 text-rose-700 border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-100 dark:border-rose-400/30">
          {err}
        </div>)}

      {step === "email" && (<form onSubmit={(e) => {
                e.preventDefault();
                vEmail();
                if (!emailOk)
                    return;
                setStep("details");
            }} className="space-y-6">
          <h2 className="text-center text-3xl font-bold text-amber-700 dark:text-amber-300">
            נעים להכיר!
          </h2>
          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-white/85">
              אימייל
            </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={vEmail} autoComplete="email" placeholder="name@example.com" className={`w-full rounded-xl px-3 py-2 outline-none border bg-white/80 text-slate-900 placeholder:text-slate-400 border-black/10 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:border-white/10 ${eErr && "border-rose-400/60"}`}/>
            {eErr && (<p className="mt-1 text-rose-500 dark:text-rose-300 text-xs">
                {eErr}
              </p>)}
          </div>
          <button disabled={!emailOk} className="w-full py-3 rounded-xl font-semibold text-white transition bg-[linear-gradient(135deg,#8b5cf6_0%,#f59e0b_100%)] shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,.35)] hover:opacity-95 focus:ring-2 focus:ring-amber-300/40 disabled:opacity-50">
            המשך
          </button>
        </form>)}

      {step === "details" && (<form onSubmit={(e) => {
                e.preventDefault();
                vDetails();
                if (fErr || lErr || pErr)
                    return;
                setStep("avatar");
            }} className="space-y-6">
          <h2 className="text-center text-2xl font-semibold text-amber-700 dark:text-amber-300">
            יצירת פרופיל ✨
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="שם פרטי" v={first} set={setFirst} err={fErr}/>
            <Field label="שם משפחה" v={last} set={setLast} err={lErr}/>
          </div>
          <div>
            <label className="flex items-center justify-between text-sm mb-1 text-slate-700 dark:text-white/85">
              <span>סיסמה</span>
              <span className="text-xs text-slate-500 dark:text-white/60">
                חוזק: {pwScore}/10
              </span>
            </label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onBlur={vDetails} autoComplete="new-password" placeholder="בחר/י סיסמה" className={`w-full rounded-xl px-3 py-2 outline-none border bg-white/80 text-slate-900 placeholder:text-slate-400 border-black/10 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:border-white/10 ${pErr && "border-rose-400/60"}`}/>
            {pErr && (<p className="mt-1 text-rose-500 dark:text-rose-300 text-xs">
                {pErr}
              </p>)}
          </div>
          <div className="flex gap-3">
            <BtnGhost onClick={() => setStep("email")}>חזרה</BtnGhost>
            <BtnGrad disabled={!!(fErr || lErr || pErr)}>המשך</BtnGrad>
          </div>
        </form>)}

      {step === "avatar" && (<form onSubmit={(e) => {
                e.preventDefault();
                vAvatar();
                if (aErr)
                    return;
                setStep("terms");
            }} className="space-y-6">
          <h2 className="text-center text-2xl font-semibold text-amber-700 dark:text-amber-300">
            תמונת פרופיל
          </h2>
          <div className="rounded-2xl border-2 border-dashed p-4 text-center transition bg-white/70 border-black/20 hover:border-black/30 dark:bg-white/[0.06] dark:border-white/20 dark:hover:border-white/30">
            {preview ? (<div className="space-y-3">
                <img src={preview} alt="" className="w-40 h-40 object-cover rounded-2xl border border-black/10 dark:border-white/20 mx-auto"/>
                <div className="flex justify-center gap-3">
                  <BtnGhost onClick={() => inputRef.current?.click()}>
                    החלף תמונה
                  </BtnGhost>
                  {!AVATAR_REQUIRED && (<button type="button" onClick={() => {
                        setFile(null);
                        setAErr("");
                    }} className="text-xs underline text-slate-600 dark:text-white/70">
                      הסר תמונה
                    </button>)}
                </div>
              </div>) : (<div className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-white/80">
                  גררו תמונה לכאן או
                </p>
                <BtnGrad type="button" onClick={() => inputRef.current?.click()}>
                  בחר/י קובץ
                </BtnGrad>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  JPG/PNG/WebP/GIF · עד 5MB
                </p>
              </div>)}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.currentTarget.files?.[0] || null)}/>
          </div>
          {aErr && (<p className="text-rose-500 dark:text-rose-300 text-xs">{aErr}</p>)}
          <div className="flex gap-3">
            <BtnGhost onClick={() => setStep("details")}>חזרה</BtnGhost>
            <BtnGrad disabled={AVATAR_REQUIRED && !file}>המשך</BtnGrad>
          </div>
        </form>)}

      {step === "terms" && (<form onSubmit={(e) => {
                e.preventDefault();
                if (!agreed)
                    return setErr("יש לאשר תנאי שימוש.");
                register();
            }} className="space-y-6">
          <h2 className="text-center text-xl font-semibold text-amber-700 dark:text-amber-300">
            אישור תנאי שימוש
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-white/90">
            <button type="button" onClick={() => setShowTerms(true)} className="underline text-amber-700 dark:text-amber-300">
              פתח/י תנאי שימוש
            </button>
            {agreed && (<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border border-emerald-400/30">
                ✓ אושר
              </span>)}
          </div>
          <div className="flex gap-3">
            <BtnGhost onClick={() => setStep("avatar")}>חזרה</BtnGhost>
            <BtnGrad disabled={!agreed || submitting}>
              {submitting ? "יוצר/ת חשבון…" : "סיום"}
            </BtnGrad>
          </div>
        </form>)}

      {showTerms && (<TermsDialog open={showTerms} onClose={() => setShowTerms(false)} onAccept={() => {
                setAgreed(true);
                setShowTerms(false);
            }}/>)}
    </div>);
}
function Field({ label, v, set, err, }: {
    label: string;
    v: string;
    set: (s: string) => void;
    err?: string;
}) {
    return (<div>
      <label className="block text-sm mb-1 text-slate-700 dark:text-white/85">
        {label}
      </label>
      <input value={v} onChange={(e) => set(e.target.value)} placeholder={label} className={`w-full rounded-xl px-3 py-2 outline-none border bg-white/80 text-slate-900 placeholder:text-slate-400 border-black/10 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:border-white/10 ${err && "border-rose-400/60"}`}/>
      {err && (<p className="mt-1 text-rose-500 dark:text-rose-300 text-xs">{err}</p>)}
    </div>);
}
function BtnGrad(props: any) {
    return (<button {...props} className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition bg-[linear-gradient(135deg,#8b5cf6_0%,#f59e0b_100%)] shadow-[0_8px_24px_-16px_rgba(0,0,0,.12)] dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,.35)] hover:opacity-95 focus:ring-2 focus:ring-amber-300/40 disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}/>);
}
function BtnGhost(props: any) {
    return (<button type="button" {...props} className={`flex-1 py-2.5 rounded-xl font-medium transition bg-white/70 text-slate-700 border border-black/10 hover:bg-white dark:bg-white/[0.06] dark:text-white dark:border-white/10 dark:hover:bg-white/[0.1] ${props.className || ""}`}/>);
}
