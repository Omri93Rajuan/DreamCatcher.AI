import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DreamDetailsPage from "@/pages/DreamDetailsPage";
import { ProtectedRoute } from "./protected";
import RegisterPage from "@/pages/RegisterPage";
import MyDreamsPage from "@/pages/MyDreamsPage";

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
    path: "*",
    element: (
      <Layout>
        <div className="p-8">404</div>
      </Layout>
    ),
  },
]);
