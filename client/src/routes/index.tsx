import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DreamDetailsPage from "@/pages/DreamDetailsPage";
import { ProtectedRoute } from "./protected";

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
    path: "*",
    element: (
      <Layout>
        <div className="p-8">404</div>
      </Layout>
    ),
  },
]);
