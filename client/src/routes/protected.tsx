import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
export function ProtectedRoute({ children }: {
    children: JSX.Element;
}) {
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    return isAuthed ? children : <Navigate to="/login" replace/>;
}
