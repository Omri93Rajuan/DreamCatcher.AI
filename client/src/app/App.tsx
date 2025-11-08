import { QueryProvider } from "../providers/QueryProvider";
import { I18nProvider } from "../providers/I18nProvider";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { RouterProvider } from "../providers/RouterProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import AccessibilityToolbar from "../components/accessibility/AccessibilityToolbar";
import "react-toastify/dist/ReactToastify.css";
export default function App() {
    return (<ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <ErrorBoundary>
            <div id="a11y-app-shell" className="min-h-screen">
              <RouterProvider />
              <ToastContainer position="top-right" rtl autoClose={1800} className="toast-container" toastClassName="toast-body"/>
            </div>
            <AccessibilityToolbar />
          </ErrorBoundary>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>);
}
