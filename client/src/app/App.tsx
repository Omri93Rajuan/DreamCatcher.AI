import { QueryProvider } from "../providers/QueryProvider";
import { I18nProvider } from "../providers/I18nProvider";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { RouterProvider } from "../providers/RouterProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import AccessibilityPrefsBoot from "../components/accessibility/AccessibilityPrefsBoot";
import DeferredAppAddons from "./DeferredAppAddons";
export default function App() {
    return (<ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <ErrorBoundary>
            <div id="a11y-app-shell" className="min-h-screen">
              <RouterProvider />
            </div>
            <AccessibilityPrefsBoot />
            <DeferredAppAddons />
          </ErrorBoundary>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>);
}
