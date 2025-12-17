import "@/i18n";
import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setDocumentDirection } from "@/lib/utils/rtl";

export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = (lng: string) => {
      try {
        window.localStorage.setItem("i18nextLng", lng);
      } catch {
        /* storage might be blocked */
      }
      setDocumentDirection(lng);
    };

    apply(i18n.resolvedLanguage || i18n.language);
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n]);

  return <>{children}</>;
}
