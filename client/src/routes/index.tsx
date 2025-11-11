import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DreamDetailsPage from "@/pages/DreamDetailsPage";
import { ProtectedRoute } from "./protected";
import RegisterPage from "@/pages/RegisterPage";
import MyDreamsPage from "@/pages/MyDreamsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AccountPage from "@/pages/AccountPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ArticlesPage from "@/pages/ArticlesPage";
import ContactPage from "@/pages/ContactPage";
import GoogleCallbackPage from "@/pages/GoogleCallbackPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
export const router = createBrowserRouter([
    {
        path: "/",
        element: (<Layout>
        <HomePage />
      </Layout>),
    },
    {
        path: "/login",
        element: (<Layout>
        <LoginPage />
      </Layout>),
    },
    {
        path: "/register",
        element: (<Layout>
        <RegisterPage />
      </Layout>),
    },
    {
        path: "/auth/google/callback",
        element: (<Layout>
        <GoogleCallbackPage />
      </Layout>),
    },
    {
        path: "/dreams/:id",
        element: (<Layout>
        <ProtectedRoute>
          <DreamDetailsPage />
        </ProtectedRoute>
      </Layout>),
    },
    {
        path: "/account",
        element: (<Layout>
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      </Layout>),
    },
    {
        path: "/me/dreams",
        element: (<Layout>
        <ProtectedRoute>
          <MyDreamsPage />
        </ProtectedRoute>
      </Layout>),
    },
    {
        path: "/articles",
        element: (<Layout>
        <ArticlesPage />
      </Layout>),
    },
    {
        path: "/contact",
        element: (<Layout>
        <ContactPage />
      </Layout>),
    },
    {
        path: "/reset-password",
        element: (<Layout>
        <ResetPasswordPage />
      </Layout>),
    },
    {
        path: "/forgot-password",
        element: (<Layout>
        <ForgotPasswordPage />
      </Layout>),
    },
    {
        path: "/terms",
        element: (<Layout>
        <TermsPage />
      </Layout>),
    },
    {
        path: "/privacy",
        element: (<Layout>
        <PrivacyPage />
      </Layout>),
    },
    {
        path: "*",
        element: (<Layout>
        <NotFoundPage />
      </Layout>),
    },
]);


