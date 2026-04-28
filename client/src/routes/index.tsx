import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/layout";
import { ProtectedRoute } from "./protected";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const GoogleCallbackPage = lazy(() => import("@/pages/GoogleCallbackPage"));
const DreamDetailsPage = lazy(() => import("@/pages/DreamDetailsPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const MyDreamsPage = lazy(() => import("@/pages/MyDreamsPage"));
const ArticlesPage = lazy(() => import("@/pages/ArticlesPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageShell({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="grid min-h-[45vh] place-items-center text-slate-600 dark:text-white/70">
            Loading...
          </div>
        }
      >
        {children}
      </Suspense>
    </Layout>
  );
}

function routeElement(Page: ComponentType, protectedRoute = false) {
  const page = <Page />;
  return (
    <PageShell>
      {protectedRoute ? <ProtectedRoute>{page}</ProtectedRoute> : page}
    </PageShell>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: routeElement(HomePage) },
  { path: "/login", element: routeElement(LoginPage) },
  { path: "/register", element: routeElement(RegisterPage) },
  { path: "/auth/google/callback", element: routeElement(GoogleCallbackPage) },
  { path: "/dreams/:id", element: routeElement(DreamDetailsPage, true) },
  { path: "/account", element: routeElement(AccountPage, true) },
  { path: "/me/dreams", element: routeElement(MyDreamsPage, true) },
  { path: "/articles", element: routeElement(ArticlesPage) },
  { path: "/contact", element: routeElement(ContactPage) },
  { path: "/reset-password", element: routeElement(ResetPasswordPage) },
  { path: "/forgot-password", element: routeElement(ForgotPasswordPage) },
  { path: "/terms", element: routeElement(TermsPage) },
  { path: "/privacy", element: routeElement(PrivacyPage) },
  { path: "*", element: routeElement(NotFoundPage) },
]);
