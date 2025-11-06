import { QueryProvider } from "../providers/QueryProvider";
import { I18nProvider } from "../providers/I18nProvider";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { RouterProvider } from "../providers/RouterProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function App() {
    return (<ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <ErrorBoundary>
            <RouterProvider />
            <ToastContainer position="top-right" rtl autoClose={1800} className="toast-container" toastClassName="toast-body"/>
          </ErrorBoundary>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>);
}
