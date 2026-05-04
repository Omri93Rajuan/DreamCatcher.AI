import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
export function ProtectedRoute({ children }: {
    children: JSX.Element;
}) {
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    return isAuthed ? children : <Navigate to="/login" replace/>;
}

export function AdminRoute({ children }: {
    children: JSX.Element;
}) {
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    if (!isAuthed)
        return <Navigate to="/login" replace/>;
    return user?.role === "admin" ? children : <Navigate to="/" replace/>;
}
