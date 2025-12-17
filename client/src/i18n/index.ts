import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./he/translation.json";
import en from "./en/translation.json";

const detectInitialLanguage = () => {
  if (typeof window === "undefined") return "he";
  const stored = window.localStorage.getItem("i18nextLng");
  if (stored) return stored;
  const browser = window.navigator.language;
  if (browser?.toLowerCase().startsWith("he")) return "he";
  return "en";
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
