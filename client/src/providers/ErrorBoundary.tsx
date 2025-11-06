import { ReactNode } from "react";
import { ErrorBoundary as EB } from "react-error-boundary";
export function ErrorBoundary({ children }: {
    children: ReactNode;
}) {
    return (<EB fallbackRender={({ error, resetErrorBoundary }) => (<div className="p-6 text-center text-red-300">
          <h2 className="text-xl font-bold mb-2">משהו השתבש</h2>
          <p className="mb-4">{error.message}</p>
          <button className="px-4 py-2 rounded bg-red-700" onClick={resetErrorBoundary}>
            נסה שוב
          </button>
        </div>)}>
      {children}
    </EB>);
}
