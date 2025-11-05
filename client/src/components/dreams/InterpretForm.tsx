import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Search, CheckCircle2, Loader2 } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import { useAuthStore } from "@/stores/useAuthStore";
import Logo from "@/assets/logo.png";

/**
 * Smooth, natural word-by-word streamer with punctuation-aware pacing,
 * auto-scroll, and a stable final render after completion.
 */
function useWordStreamer({
  fullText,
  baseMs = 40,
  wordsPerTick = 1,
  containerRef,
}: {
  fullText: string;
  baseMs?: number;
  wordsPerTick?: number;
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [out, setOut] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Tokenize into [word|punct|space] preserving spaces so RTL looks correct
  const tokens = useMemo(() => {
    const t = String(fullText ?? "");
    if (!t) return [] as string[];
    // words (including diacritics), punctuation, or whitespace
    return t.match(/\p{L}+[\p{L}\p{M}'’\-]*|[\p{P}]+|\s+/gu) ?? [t];
  }, [fullText]);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = useCallback((delay: number, fn: () => void) => {
    clearTimer();
    timerRef.current = window.setTimeout(fn, delay) as unknown as number;
  }, []);

  useEffect(() => {
    clearTimer();
    if (!fullText) {
      setOut("");
      setIsStreaming(false);
      return;
    }
    setOut("");
    setIsStreaming(true);

    let i = 0;

    const step = () => {
      if (i >= tokens.length) {
        setIsStreaming(false);
        clearTimer();
        return;
      }

      // append N tokens per tick for smoother flow
      let appended = "";
      for (let k = 0; k < Math.max(1, wordsPerTick) && i < tokens.length; k++) {
        appended += tokens[i++];
      }
      setOut((prev) => prev + appended);

      // Auto-scroll the container (if provided)
      const node = containerRef?.current as HTMLElement | null;
      if (node) {
        requestAnimationFrame(() => {
          node.scrollTop = node.scrollHeight;
        });
      }

      // Pacing
      const lastChar = appended[appended.length - 1] ?? "";
      const isPunct = /[\.!?…,:;\)]/.test(lastChar);
      const isSentenceEnd = /[\.!?…]/.test(lastChar);
      const delay = baseMs * (isSentenceEnd ? 8 : isPunct ? 3 : 1);

      schedule(delay, step);
    };

    schedule(baseMs, step);
    return () => clearTimer();
  }, [fullText, baseMs, wordsPerTick, schedule, containerRef, tokens]);

  return { streamedText: out, isStreaming } as const;
}

const MY_DREAMS_PATH = "/me/dreams";

export default function InterpretForm() {
  const [text, setText] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [dream, setDream] = useState<Dream | null>(null);
  const [justShared, setJustShared] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated } = useAuthStore();

  const { streamedText, isStreaming } = useWordStreamer({
    fullText: dream?.aiResponse ?? "",
    baseMs: 40,
    wordsPerTick: 2,
    containerRef,
  });

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
        titleOverride: undefined,
        isShared: false,
      });
      setDream(saved);
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
      {/* Input card */}
      <div className="grid gap-3 max-w-3xl mx-auto mb-8">
        <div className="relative">
          {/* Light/Dark icon color */}
          <Search className="absolute right-4 top-3 w-5 h-5 text-slate-400 dark:text-purple-400" />
          <Textarea
            dir="rtl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="תאר/י את החלום שלך... (אפשר גם להדביק)"
            disabled={isInterpreting}
            className={[
              "pr-10 font-he min-h-[140px]",
              // --- LIGHT MODE --- //
              "bg-white text-black placeholder:text-slate-500",
              "border border-black/10",
              "focus-visible:ring-2 focus-visible:ring-black/20",
              // --- DARK MODE (לשמור בדיוק כמו שהיה) --- //
              "dark:bg-white/10 dark:text-white",
              "dark:placeholder:text-white/50",
              "dark:border-white/15",
              "dark:focus-visible:ring-2 dark:focus-visible:ring-purple-400/30",
              "transition-all duration-300",
            ].join(" ")}
          />
        </div>

        {/* CTA Button: Light זהב, Dark גרדיאנט סגול→ענבר כמו שהיה */}
        <Button
          onClick={handleInterpret}
          disabled={!text.trim() || isInterpreting}
          className={[
            "w-full font-bold py-3 rounded-xl",
            // Light
            "bg-[var(--brand,#c9a23a)] text-[color:var(--brand-fg,#1b1b1b)] hover:brightness-105",
            // Dark (השארתי בדיוק כמו שהיה)
            "dark:bg-gradient-to-r dark:from-purple-600 dark:to-amber-600 dark:hover:from-purple-700 dark:hover:to-amber-700 dark:text-white",
          ].join(" ")}
        >
          {isInterpreting ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              חושב על זה...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 ml-2" /> פענח/י את החלום
            </>
          )}
        </Button>
      </div>

      {/* Results card */}
      {(dream || isInterpreting) && (
        <div className="max-w-3xl mx-auto mb-10">
          <div
            className={[
              "relative rounded-3xl p-6 shadow-xl backdrop-blur",
              // Light
              "bg-white border border-black/10 text-slate-900",
              // Dark – כמו שהיה
              "dark:border-white/15 dark:bg-white/5 dark:text-white",
            ].join(" ")}
            aria-live="polite"
            aria-busy={isThinking}
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                className={[
                  "text-lg font-extrabold font-he",
                  // Light: טקסט כהה
                  "text-slate-900",
                  // Dark: גרדיאנט כמו שהיה
                  "dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-purple-300 dark:to-amber-200",
                ].join(" ")}
              >
                פתרון החלום
              </h4>
            </div>

            {/* waiting logo */}
            {!dream && isInterpreting && (
              <div className="grid place-items-center py-14">
                <img
                  src={Logo}
                  alt=""
                  className="w-16 h-16 animate-pulse opacity-95 select-none"
                  draggable={false}
                />
              </div>
            )}

            {/* streaming/final */}
            {(isStreaming || dream) && (
              <div
                ref={containerRef as any}
                className="whitespace-pre-wrap text-right font-he select-text max-h-[50vh] overflow-y-auto pr-1"
                dir="rtl"
                lang="he"
                style={{
                  unicodeBidi: "plaintext" as any,
                  fontSize: "1.125rem",
                  lineHeight: 1.9,
                  fontWeight: 500,
                  letterSpacing: "0.2px",
                }}
              >
                <bdi className="text-slate-800 dark:text-white">
                  {isStreaming ? streamedText : dream?.aiResponse}
                </bdi>
                {isStreaming && (
                  <span className="inline-block w-2 h-5 align-text-bottom animate-pulse">
                    ‎
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            {dream && !isStreaming && (
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {!dream.isShared ? (
                  <Button
                    onClick={shareWithEveryone}
                    className={[
                      "px-4 py-2 rounded-xl",
                      // Light
                      "bg-[var(--brand,#c9a23a)] text-[color:var(--brand-fg,#1b1b1b)] hover:brightness-105",
                      // Dark (זהה לסגנון הענברי הקיים)
                      "dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white",
                    ].join(" ")}
                  >
                    שתף/י עם כולם
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    שותף בהצלחה!
                  </div>
                )}

                <button
                  onClick={openMyDreams}
                  className="text-sm underline underline-offset-4 text-slate-800 hover:text-slate-900 dark:text-white/90 dark:hover:text-white"
                >
                  פתח/י את החלומות שלי
                </button>

                {justShared && (
                  <div className="text-emerald-700 dark:text-emerald-300 text-xs">
                    החלום פורסם ויראה לכלל המשתמשים.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth dialog */}
      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="signup"
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
