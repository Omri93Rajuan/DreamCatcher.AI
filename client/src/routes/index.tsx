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

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginPage />
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <RegisterPage />
      </Layout>
    ),
  },
  {
    path: "/dreams/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <DreamDetailsPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/account",
    element: (
      <Layout>
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/me/dreams",
    element: (
      <Layout>
        <ProtectedRoute>
          <MyDreamsPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Layout>
        <ResetPasswordPage />
      </Layout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Layout>
        <ForgotPasswordPage />
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
  },
]);
