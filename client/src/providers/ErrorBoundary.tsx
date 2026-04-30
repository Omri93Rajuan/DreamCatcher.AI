import { ReactNode } from "react";
import { ErrorBoundary as EB } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import StatusCard from "@/components/ui/StatusCard";
export function ErrorBoundary({ children }: {
    children: ReactNode;
}) {
    const { t } = useTranslation();
    return (<EB fallbackRender={({ resetErrorBoundary }) => (<main className="min-h-screen px-4 py-10 flex items-center justify-center">
          <StatusCard tone="error" title={t("common.errorGeneric")} message={t("errors.boundary")} actionLabel={t("common.retry")} onAction={resetErrorBoundary} className="w-full max-w-xl"/>
        </main>)}>
      {children}
    </EB>);
}
