"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
type Props = {
    userId?: string;
};
export default function DeleteAccountCard({ userId }: Props) {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [ack, setAck] = React.useState(false);
    const onDelete = async () => {
        const id = userId ?? user?._id;
        if (!id) {
            toast.error("לא נמצא מזהה משתמש.");
            return;
        }
        setLoading(true);
        try {
            await AuthApi.deleteAccount(id);
            const msg = "החשבון נמחק בהצלחה. נתראה שוב בעתיד, אם תבחר/י בכך!";
            toast.success(msg, { autoClose: 3000 });
            try {
                sessionStorage.setItem("flash", JSON.stringify({ type: "success", message: msg }));
            }
            catch { }
            setTimeout(() => {
                logout?.();
                navigate("/login");
            }, 1400);
        }
        catch {
            setLoading(false);
            toast.error("שגיאה במחיקה. נסה שוב מאוחר יותר.");
        }
    };
    return (<div className="mt-8 text-right" dir="rtl">
      <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-red-600 hover:underline px-1" onClick={() => {
            setAck(false);
            setOpen(true);
        }}>
        מחיקת חשבון
      </Button>

      {open && (<div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !loading && setOpen(false)}/>
          <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              מחיקת חשבון
            </h3>
            <p className="text-sm text-slate-700 dark:text-white/80 leading-6 mb-4">
              פעולה סופית: כל המידע המשויך לחשבון יימחק לצמיתות. לא ניתן לשחזר
              לאחר המחיקה.
            </p>

            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 mb-6 select-none">
              <input type="checkbox" className="mt-0.5 accent-red-600" checked={ack} onChange={(e) => setAck(e.target.checked)}/>
              אני מאשר/ת את מחיקת החשבון לצמיתות.
            </label>

            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" disabled={loading} onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button size="sm" disabled={!ack || loading} onClick={onDelete}>
                {loading ? "מוחק..." : "מחק חשבון"}
              </Button>
            </div>
          </div>
        </div>)}
    </div>);
}
