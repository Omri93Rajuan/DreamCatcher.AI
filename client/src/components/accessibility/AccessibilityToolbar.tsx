"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type TextScale = "100" | "115" | "130";
type ColorProfile = "default" | "bright" | "dim" | "mono" | "invert";

type Prefs = {
  textScale: TextScale;
  colorProfile: ColorProfile;
  highContrast: boolean;
  highlightLinks: boolean;
  dyslexicFont: boolean;
  reduceMotion: boolean;
  focusRing: boolean;
  textSpacing: boolean;
  readerMode: boolean;
  bigCursor: boolean;
};

type ToggleablePref = Exclude<keyof Prefs, "textScale" | "colorProfile">;

const PREFS_KEY = "a11y-toolbar-prefs";
const SCALE_VALUES: TextScale[] = ["100", "115", "130"];

const COLOR_PROFILE_IDS: ColorProfile[] = [
  "default",
  "bright",
  "dim",
  "mono",
  "invert",
];

const COLOR_PROFILE_CLASSES: Record<Exclude<ColorProfile, "default">, string> = {
  bright: "a11y-theme-bright",
  dim: "a11y-theme-dim",
  mono: "a11y-theme-monochrome",
  invert: "a11y-theme-invert",
};

const TOGGLE_IDS: ToggleablePref[] = [
  "highContrast",
  "highlightLinks",
  "dyslexicFont",
  "reduceMotion",
  "focusRing",
  "textSpacing",
  "readerMode",
  "bigCursor",
];

const defaultPrefs: Prefs = {
  textScale: "100",
  colorProfile: "default",
  highContrast: false,
  highlightLinks: false,
  dyslexicFont: false,
  reduceMotion: false,
  focusRing: false,
  textSpacing: false,
  readerMode: false,
  bigCursor: false,
};

const CLASS_MAP: Record<ToggleablePref, string> = {
  highContrast: "a11y-contrast",
  highlightLinks: "a11y-highlight-links",
  dyslexicFont: "a11y-dyslexic",
  reduceMotion: "a11y-reduce-motion",
  focusRing: "a11y-focus-ring",
  textSpacing: "a11y-text-spacing",
  readerMode: "a11y-reader-mode",
  bigCursor: "a11y-big-cursor",
};

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const panelId = useId();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Prefs>;
        setPrefs({ ...defaultPrefs, ...parsed });
      }
    } catch {
      /* ignore storage issues */
    }
  }, []);

  const classTargets = useMemo<null | Record<ToggleablePref, HTMLElement>>(() => {
    if (typeof document === "undefined") return null;
    return {
      highContrast: document.documentElement,
      highlightLinks: document.body,
      dyslexicFont: document.documentElement,
      reduceMotion: document.documentElement,
      focusRing: document.documentElement,
      textSpacing: document.documentElement,
      readerMode: document.documentElement,
      bigCursor: document.documentElement,
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const scale = Number(prefs.textScale) / 100;
    document.documentElement.style.setProperty(
      "--a11y-text-scale",
      scale.toString()
    );

    (Object.keys(CLASS_MAP) as Array<keyof typeof CLASS_MAP>).forEach((key) => {
      const el =
        classTargets?.[key] ?? document.documentElement ?? document.body;
      el.classList.toggle(CLASS_MAP[key], prefs[key]);
    });

    const html = document.documentElement;
    Object.values(COLOR_PROFILE_CLASSES).forEach((cls) =>
      html.classList.remove(cls)
    );
    if (prefs.colorProfile !== "default") {
      html.classList.add(COLOR_PROFILE_CLASSES[prefs.colorProfile]);
    }

    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* storage might be unavailable */
    }
  }, [prefs, classTargets]);

  const toggle = (key: ToggleablePref) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const setScale = (textScale: TextScale) =>
    setPrefs((prev) => ({ ...prev, textScale }));

  const setColorProfile = (colorProfile: ColorProfile) =>
    setPrefs((prev) => ({ ...prev, colorProfile }));

  return (
    <div
      data-a11y-root="true"
      className="fixed bottom-6 right-6 z-[11000] flex flex-col items-end gap-3"
      dir={i18n.dir()}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-white/90 dark:text-slate-900"
        aria-expanded={open}
        aria-controls={panelId}
        style={{ fontSize: "14px" }}
      >
        ♿ {t("accessibility.trigger")}
      </button>

      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label={t("accessibility.dialogLabel")}
          className="w-80 rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm shadow-2xl backdrop-blur dark:border-white/20 dark:bg-slate-900/95 max-h-[min(80vh,500px)] overflow-y-auto"
          style={{ fontSize: "14px" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-white/70">
              {t("accessibility.activeHeading")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
              aria-label={t("accessibility.close")}
            >
              ✕
            </button>
          </div>
          <div className="space-y-5">
            <fieldset className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/5">
              <legend className="text-xs font-semibold text-slate-500 dark:text-white/70">
                {t("accessibility.textSize")}
              </legend>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-bold dark:border-white/20"
                  onClick={() => {
                    const idx = SCALE_VALUES.indexOf(prefs.textScale);
                    if (idx > 0) setScale(SCALE_VALUES[idx - 1]);
                  }}
                  aria-label={t("accessibility.textSizeDecrease")}
                >
                  −
                </button>
                <div className="text-base font-semibold">
                  {prefs.textScale}%
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-bold dark:border-white/20"
                  onClick={() => {
                    const idx = SCALE_VALUES.indexOf(prefs.textScale);
                    if (idx < SCALE_VALUES.length - 1)
                      setScale(SCALE_VALUES[idx + 1]);
                  }}
                  aria-label={t("accessibility.textSizeIncrease")}
                >
                  +
                </button>
              </div>
            </fieldset>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-white/70">
                {t("accessibility.colorAdjustments")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {COLOR_PROFILE_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setColorProfile(id)}
                    className={`rounded-2xl border px-3 py-3 text-right transition ${
                      prefs.colorProfile === id
                        ? "border-amber-400 bg-amber-50 text-slate-900 dark:bg-amber-400/15"
                        : "border-slate-200 bg-white/80 dark:border-white/15 dark:bg-white/5"
                    }`}
                    aria-pressed={prefs.colorProfile === id}
                  >
                    <div className="text-sm font-semibold">
                      {t(`accessibility.profiles.${id}.label`)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-white/60">
                      {t(`accessibility.profiles.${id}.description`)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {TOGGLE_IDS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className={`flex flex-col items-start rounded-2xl border px-3 py-3 text-left transition ${
                    prefs[key]
                      ? "border-amber-400 bg-amber-50 text-slate-900 dark:bg-amber-400/15"
                      : "border-slate-200 bg-white/80 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/80"
                  }`}
                  aria-pressed={prefs[key]}
                >
                  <span className="text-sm font-semibold">
                    {t(`accessibility.toggles.${key}.label`)}
                  </span>
                  <span className="text-[11px]">
                    {t(`accessibility.toggles.${key}.description`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
            onClick={() => setPrefs(defaultPrefs)}
          >
            {t("accessibility.reset")}
          </button>
        </section>
      )}
    </div>
  );
}
