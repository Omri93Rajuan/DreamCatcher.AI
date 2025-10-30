import { QueryProvider } from "../providers/QueryProvider";
import { I18nProvider } from "../providers/I18nProvider";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { RouterProvider } from "../providers/RouterProvider";
import { ThemeProvider } from "../providers/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <ErrorBoundary>
            <RouterProvider />
          </ErrorBoundary>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
