import "@/i18n";
import { ReactNode, useEffect } from "react";
import { enableRTL } from "@/lib/utils/rtl";

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => enableRTL(), []);
  return <>{children}</>;
}
