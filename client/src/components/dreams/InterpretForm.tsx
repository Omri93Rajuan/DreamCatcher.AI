// src/components/InterpretForm.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Search, CheckCircle2 } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * סטרימינג מילה-אחרי-מילה עם שימור רווחים ושורות
 * שומר על צריכת משאבים נמוכה ומנקה טיימרים בזמן אנמאונט.
 */
function useWordStreamer(fullText: string, speedMs = 45) {
  const [out, setOut] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const timerRef = useRef<number | null>(null);

  const tokens = useMemo(
    () =>
      String(fullText ?? "")
        .split(/(\s+)/)
        .filter((t) => t !== undefined && t !== null),
    [fullText]
  );

  useEffect(() => {
    if (!fullText) {
      setOut("");
      setIsStreaming(false);
      return;
    }
    setOut("");
    setIsStreaming(true);

    let i = 0;
    const tick = () => {
      if (i >= tokens.length) {
        setIsStreaming(false);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        return;
      }
      const next = tokens[i++];
      if (typeof next === "string") setOut((prev) => prev + next);
    };

    timerRef.current = window.setInterval(tick, speedMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [fullText, tokens, speedMs]);

  return { streamedText: out, isStreaming };
}

const MY_DREAMS_PATH = "/me/dreams";

export default function InterpretForm() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [dream, setDream] = useState<Dream | null>(null);
  const [justShared, setJustShared] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { streamedText, isStreaming } = useWordStreamer(
    dream?.aiResponse ?? "",
    45
  );

  const isThinking = isInterpreting || isStreaming;

  const handleInterpret = async () => {
    if (!text.trim()) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setIsInterpreting(true);
    setDream(null);
    setJustShared(false);

    try {
      const { dream: saved } = await DreamsApi.interpret({
        text,
        titleOverride: title || undefined,
        isShared: false, // נשמר פרטי כברירת מחדל
      });
      setDream(saved);
      if (!title && saved.title) setTitle(saved.title);
    } catch (e: any) {
      if (e?.response?.status === 401) setAuthOpen(true);
      console.error(e);
    } finally {
      setIsInterpreting(false);
    }
  };

  const shareWithEveryone = async () => {
    if (!dream || dream.isShared) return;
    setJustShared(false);
    const updated = await DreamsApi.update(dream._id, { isShared: true });
    setDream(updated);
    setJustShared(true);
  };

  const openMyDreams = () => {
    try {
      window.location.assign(MY_DREAMS_PATH);
    } catch {
      window.location.href = MY_DREAMS_PATH;
    }
  };

  return (
    <>
      {/* פס סטטוס עליון עם לוגו מהבהב בזמן מחשבה */}
      {isThinking && (
        <div className="sticky top-2 z-20 mx-auto mb-4 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
          <img
            // אם הקובץ שלך נקרא "logo.png/svg", שמור את הנתיב הזה.
            src="../assets/logo.png"
            alt="טוען פירוש"
            className="h-6 w-6 animate-pulse"
          />
          <span className="text-xs text-white/80 font-he">
            מפענח... אנא המתן/י
          </span>
        </div>
      )}

      {/* טופס קלט */}
      <div className="grid gap-3 max-w-3xl mx-auto mb-8">
        <Input
          dir="rtl"
          placeholder="כותרת (לא חובה)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-he"
        />
        <div className="relative">
          <Search className="absolute right-4 top-3 w-5 h-5 text-purple-400" />
          <Textarea
            dir="rtl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="תאר/י את החלום שלך..."
            className="pr-10 font-he"
            disabled={isInterpreting}
          />
        </div>
        <Button
          onClick={handleInterpret}
          disabled={!text.trim() || isInterpreting}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold py-3 rounded-xl"
        >
          {isInterpreting ? (
            <>
              {/* לוגו מהבהב בזמן פירוש */}
              <img
                src="../assets/logo.png"
                alt="טוען"
                className="w-5 h-5 ml-2 animate-pulse"
              />
              מפענח...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 ml-2" /> פענח את החלום
            </>
          )}
        </Button>
      </div>

      {/* פתרון החלום – עכשיו גדול ומרשים יותר */}
      {(dream || isInterpreting) && (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-white shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-amber-200 font-he">
                פתרון החלום
              </h4>
              {isThinking && (
                <span className="text-[11px] text-white/70">מפענח...</span>
              )}
            </div>

            <div
              className="whitespace-pre-wrap text-right font-he select-text"
              dir="rtl"
              lang="he"
              style={{
                unicodeBidi: "plaintext" as any,
                // מרשים יותר: גודל גדול, משקל בינוני, וגובה שורה נוח
                fontSize: "1.125rem", // ~ text-lg
                lineHeight: "1.9",
                fontWeight: 500,
                letterSpacing: "0.2px",
              }}
            >
              <bdi>{streamedText}</bdi>
              {isThinking && <span className="animate-pulse"> ▁</span>}
            </div>

            {/* פעולות אחרי שנשמר */}
            {dream && !isStreaming && (
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {!dream.isShared ? (
                  <Button
                    onClick={shareWithEveryone}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl"
                  >
                    שתף עם כולם
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 text-emerלד-300 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    שותף בהצלחה!
                  </div>
                )}

                <button
                  onClick={openMyDreams}
                  className="text-sm underline underline-offset-4 text-white/90 hover:text-white"
                >
                  פתח את החלומות שלי
                </button>

                {justShared && (
                  <div className="text-emerald-300 text-xs">
                    החלום פורסם ויראה לכלל המשתמשים.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* דיאלוג התחברות/הרשמה */}
      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="signup"
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
