import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./he/translation.json";
import en from "./en/translation.json";

type SupportedLanguage = "he" | "en";

const DEFAULT_LANGUAGE: SupportedLanguage = "he";

const isSupportedLanguage = (
  language: string | null,
): language is SupportedLanguage => language === "he" || language === "en";

const detectInitialLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const stored = window.localStorage.getItem("i18nextLng");
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    /* storage might be blocked */
  }

  return DEFAULT_LANGUAGE;
};

void i18n.use(initReactI18next).init({
  resources: { he: { translation: he }, en: { translation: en } },
  lng: detectInitialLanguage(),
  fallbackLng: ["en", "he"],
  supportedLngs: ["he", "en"],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
