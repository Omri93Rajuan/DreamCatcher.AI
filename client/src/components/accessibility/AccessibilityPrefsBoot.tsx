import { useEffect, useLayoutEffect } from "react";

const PREFS_KEY = "a11y-toolbar-prefs";

type SavedPrefs = {
  textScale?: "100" | "115" | "130";
  colorProfile?: "default" | "bright" | "dim" | "mono" | "invert";
  highContrast?: boolean;
  highlightLinks?: boolean;
  dyslexicFont?: boolean;
  reduceMotion?: boolean;
  focusRing?: boolean;
  textSpacing?: boolean;
  readerMode?: boolean;
  bigCursor?: boolean;
};

const TOGGLE_CLASSES: Array<[keyof SavedPrefs, string, "html" | "body"]> = [
  ["highContrast", "a11y-contrast", "html"],
  ["highlightLinks", "a11y-highlight-links", "body"],
  ["dyslexicFont", "a11y-dyslexic", "html"],
  ["reduceMotion", "a11y-reduce-motion", "html"],
  ["focusRing", "a11y-focus-ring", "html"],
  ["textSpacing", "a11y-text-spacing", "html"],
  ["readerMode", "a11y-reader-mode", "html"],
  ["bigCursor", "a11y-big-cursor", "html"],
];

const COLOR_PROFILE_CLASSES: Record<
  Exclude<NonNullable<SavedPrefs["colorProfile"]>, "default">,
  string
> = {
  bright: "a11y-theme-bright",
  dim: "a11y-theme-dim",
  mono: "a11y-theme-monochrome",
  invert: "a11y-theme-invert",
};

function readPrefs(): SavedPrefs {
  try {
    const saved = window.localStorage.getItem(PREFS_KEY);
    return saved ? (JSON.parse(saved) as SavedPrefs) : {};
  } catch {
    return {};
  }
}

function applyPrefs(prefs: SavedPrefs) {
  const html = document.documentElement;
  const body = document.body;
  const scale = Number(prefs.textScale ?? "100") / 100;

  html.style.setProperty("--a11y-text-scale", scale.toString());

  for (const [key, className, target] of TOGGLE_CLASSES) {
    (target === "html" ? html : body).classList.toggle(className, !!prefs[key]);
  }

  Object.values(COLOR_PROFILE_CLASSES).forEach((className) =>
    html.classList.remove(className)
  );

  if (prefs.colorProfile && prefs.colorProfile !== "default") {
    html.classList.add(COLOR_PROFILE_CLASSES[prefs.colorProfile]);
  }
}

export default function AccessibilityPrefsBoot() {
  const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    applyPrefs(readPrefs());
  }, []);

  return null;
}
