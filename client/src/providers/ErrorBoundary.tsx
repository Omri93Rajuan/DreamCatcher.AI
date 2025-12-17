import { ReactNode } from "react";
import { ErrorBoundary as EB } from "react-error-boundary";
import { useTranslation } from "react-i18next";
export function ErrorBoundary({ children }: {
    children: ReactNode;
}) {
    const { t } = useTranslation();
    return (<EB fallbackRender={({ error, resetErrorBoundary }) => (<div className="p-6 text-center text-red-300">
          <h2 className="text-xl font-bold mb-2">{t("common.errorGeneric")}</h2>
          <p className="mb-4">{error.message}</p>
          <button className="px-4 py-2 rounded bg-red-700" onClick={resetErrorBoundary}>
            {t("common.retry")}
          </button>
        </div>)}>
      {children}
    </EB>);
}
